
import request from 'supertest';
import { app } from '../src/app';
import { prisma } from '../src/shared/database';
import { createTestCustomer, createTestShop, createTestSale } from './utils/test-setup';

describe('Customer API Routes', () => {
    let customer: any;
    let customerToken: string;
    let shop: any;

    beforeAll(async () => {
        // Setup shared resources
        const customerData = await createTestCustomer();
        customer = customerData.customer;
        customerToken = customerData.token;

        const shopData = await createTestShop();
        shop = shopData.shop;
        // Ensure shop has phone for UPI test
        await prisma.shop.update({ where: { shopId: shop.shopId }, data: { phone: '9876543210' } });
    });

    afterAll(async () => {
        await prisma.sale.deleteMany();
        await prisma.udhaar.deleteMany();
        await prisma.order.deleteMany();
        await prisma.customer.deleteMany();
        await prisma.shop.deleteMany();
        await prisma.shopkeeper.deleteMany();
    });

    describe('GET /api/customers/dashboard', () => {
        it('should return dashboard stats', async () => {
            const res = await request(app)
                .get('/api/customers/dashboard')
                .set('Authorization', `Bearer ${customerToken}`);

            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('totalUdhaar');
            expect(res.body).toHaveProperty('activeOrders');
            expect(res.body).toHaveProperty('recentActivity');
        });
    });

    describe('GET /api/customers/shops', () => {
        it('should return list of shops', async () => {
            // Create a sale to link customer and shop
            await createTestSale(shop.shopId, customer.id, 100, 'UDHAAR');

            const res = await request(app)
                .get('/api/customers/shops')
                .set('Authorization', `Bearer ${customerToken}`);

            expect(res.status).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body.length).toBeGreaterThan(0);
            expect(res.body[0].shopId).toBe(shop.shopId);
        });
    });

    describe('GET /api/customers/shops/:shopId/ledger', () => {
        it('should return shop ledger', async () => {
            const res = await request(app)
                .get(`/api/customers/shops/${shop.shopId}/ledger`)
                .set('Authorization', `Bearer ${customerToken}`);

            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('summary');
            expect(res.body).toHaveProperty('transactions');
            expect(Number(res.body.summary.balance)).toBeGreaterThan(0);
        });
    });

    describe('GET /api/customers/orders', () => {
        it('should return order history', async () => {
            const res = await request(app)
                .get('/api/customers/orders')
                .set('Authorization', `Bearer ${customerToken}`);

            expect(res.status).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
        });
    });

    describe('PATCH /api/customers/profile', () => {
        it('should update profile', async () => {
            const newName = 'Updated Customer Name';
            const res = await request(app)
                .patch('/api/customers/profile')
                .set('Authorization', `Bearer ${customerToken}`)
                .send({ name: newName });

            expect(res.status).toBe(200);
            expect(res.body.name).toBe(newName);
        });
    });

    describe('GET /api/customers/shops/:shopId/ledger (Running Balance)', () => {
        it('should return shop ledger with running balance', async () => {
            // Create transactions
            await createTestSale(shop.shopId, customer.id, 500, 'UDHAAR');
            await createTestSale(shop.shopId, customer.id, 200, 'CASH');

            const response = await request(app)
                .get(`/api/customers/shops/${shop.shopId}/ledger`)
                .set('Authorization', `Bearer ${customerToken}`)
                .expect(200);

            expect(response.body.summary.balance).toBeGreaterThan(0);
            expect(response.body.transactions.length).toBeGreaterThanOrEqual(2);
            // Latest first
            const latest = response.body.transactions[0];
            expect(latest).toHaveProperty('runningBalance');
        });
    });

    describe('GET /api/customers/analytics', () => {
        it('should return analytics data', async () => {
            const response = await request(app)
                .get('/api/customers/analytics')
                .set('Authorization', `Bearer ${customerToken}`)
                .expect(200);

            expect(response.body).toHaveProperty('byCategory');
            expect(response.body).toHaveProperty('monthlyTrend');
            expect(Array.isArray(response.body.byCategory)).toBe(true);
        });
    });

    describe('POST /api/customers/shops/:shopId/pay/upi', () => {
        it('should generate UPI intent', async () => {
            const response = await request(app)
                .post(`/api/customers/shops/${shop.shopId}/pay/upi`)
                .set('Authorization', `Bearer ${customerToken}`)
                .send({ amount: 150 })
                .expect(200);

            expect(response.body).toHaveProperty('intentUrl');
            expect(response.body.intentUrl).toContain('upi://pay');
            expect(response.body.intentUrl).toContain(`am=150.00`);
            expect(response.body).toHaveProperty('vpa');
        });
    });

    describe('POST /api/customers/shops/:shopId/reviews', () => {
        it('should create a shop review', async () => {
            const response = await request(app)
                .post(`/api/customers/shops/${shop.shopId}/reviews`)
                .set('Authorization', `Bearer ${customerToken}`)
                .send({ rating: 5, comment: 'Great shop!' })
                .expect(200);

            expect(response.body).toHaveProperty('rating', 5);
            expect(response.body).toHaveProperty('comment', 'Great shop!');
            expect(response.body).toHaveProperty('shopId', shop.shopId);
        });
    });
});
