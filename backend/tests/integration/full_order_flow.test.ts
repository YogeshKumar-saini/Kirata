// Set env vars for PaymentService initialization (Must be before imports)
process.env.RAZORPAY_KEY_ID = 'rzp_test_mock';
process.env.RAZORPAY_KEY_SECRET = 'mock_secret';

import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import request from 'supertest';
// import { app } from '../../src/app'; // Removed static import
import { createTestShop, createTestCustomer, clearDatabase } from '../utils/test-setup';
import { prisma } from '../../src/shared/database';
import { signToken } from '../../src/auth/utils';

// Mock Razorpay
vi.mock('razorpay', () => {
    return {
        default: class {
            orders = {
                create: vi.fn().mockResolvedValue({
                    id: 'order_mock_123',
                    amount: 10000,
                    currency: 'INR'
                })
            };
            constructor(_options: any) { }
        }
    };
});

// Mock QRCode
vi.mock('qrcode', () => ({
    toDataURL: vi.fn().mockResolvedValue('data:image/png;base64,mockcode')
}));

describe('E2E Full Order Flow', () => {
    let app: any;
    let shop: any;
    let shopkeeper: any;
    let customer: any;
    let shopkeeperToken: string;
    let customerToken: string;

    beforeAll(async () => {
        // Dynamic import app to pick up new env vars
        const appModule = await import('../../src/app');
        app = appModule.app;

        await clearDatabase();
        // Setup Shop
        const shopData = await createTestShop();
        shop = shopData.shop;
        shopkeeper = shopData.shopkeeper;
        shopkeeperToken = signToken({ userId: shopkeeper.id, role: 'SHOPKEEPER' });

        // Setup Customer
        const customerData = await createTestCustomer();
        customer = customerData.customer;
        customerToken = customerData.token;

        // Set Transaction PIN for Shopkeeper (Required for some actions if strict)
        // But price verification usually doesn't need PIN, only Ledger/Settings.
        // We'll set it anyway to cover bases.
        await prisma.shopkeeper.update({
            where: { id: shopkeeper.id },
            data: { transactionPin: '$2b$10$MockHashFor1234' } // Fake hash
        });
    });

    afterAll(async () => {
        await clearDatabase();
        await prisma.$disconnect();
    });

    it('should execute the full order lifecycle', async () => {
        // 1. Create Order (Customer)
        const orderRes = await request(app)
            .post('/api/orders')
            .set('Authorization', `Bearer ${customerToken}`)
            .send({
                shopId: shop.shopId,
                customerId: customer.id,
                items: [
                    { name: 'Rice', price: 500, quantity: 2 }, // Manual Item (needs verification)
                    { name: 'Dal', price: 200, quantity: 1 }
                ],
                fulfillmentMethod: 'PICKUP'
            });

        expect(orderRes.status).toBe(201);
        const orderId = orderRes.body.orderId;
        expect(orderRes.body.status).toBe('PENDING');
        expect(orderRes.body.priceVerified).toBe(false);

        // 2. Verify Price (Shopkeeper)
        const verifyRes = await request(app)
            .post(`/api/orders/${orderId}/verify-price`)
            .set('Authorization', `Bearer ${shopkeeperToken}`)
            .send();

        expect(verifyRes.status).toBe(200);
        expect(verifyRes.body.priceVerified).toBe(true);

        // 3. Accept Order (Shopkeeper)
        const acceptRes = await request(app)
            .patch(`/api/orders/${orderId}/status`)
            .set('Authorization', `Bearer ${shopkeeperToken}`)
            .send({ status: 'ACCEPTED' });

        expect(acceptRes.status).toBe(200);
        expect(acceptRes.body.status).toBe('ACCEPTED');

        // 4. Initiate Payment (Customer)
        // Note: Payment service creates a Razorpay order + Local Payment record
        const paymentRes = await request(app)
            .post('/api/payments/create-order')
            .set('Authorization', `Bearer ${customerToken}`)
            .send({
                shopId: shop.shopId,
                orderId: orderId,
                amount: 1200
            });

        expect(paymentRes.status).toBe(200);
        expect(paymentRes.body.id).toBe('order_mock_123');
        // QR Code generation is handled by Frontend SDK or separate flow, not in create-order response currently
        // expect(paymentRes.body.qrCode).toContain('mockcode');

        // 5. Complete Order (Mark as Collected)
        await request(app)
            .patch(`/api/orders/${orderId}/status`)
            .set('Authorization', `Bearer ${shopkeeperToken}`)
            .send({ status: 'COLLECTED' });

        // 6. Add Review (Customer) - Testing the 500 Fix
        const reviewRes = await request(app)
            .post(`/api/reviews/shop/${shop.shopId}`)
            .set('Authorization', `Bearer ${customerToken}`)
            .send({
                rating: 5,
                comment: 'Great service and accurate prices!',
                images: []
            });

        expect(reviewRes.status).toBe(201);
        expect(reviewRes.body.rating).toBe(5);
        expect(reviewRes.body.shopId).toBe(shop.shopId);

        // 7. Verify Review Stats Updated
        const shopRes = await request(app)
            .get(`/api/shops/${shop.shopId}`)
            .set('Authorization', `Bearer ${customerToken}`);

        // This might depend on if updateShopRating is synchronous or async
        // In our service it uses aggregate then update, so it should be reflected.
        expect(shopRes.status).toBe(200);
        // Stats update might be eventual consistency or immediate
        // Based on service code it awaits execution.
        expect(Number(shopRes.body.totalReviews)).toBeGreaterThanOrEqual(1);
    });
});
