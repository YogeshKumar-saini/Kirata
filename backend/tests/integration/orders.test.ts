import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../../src/app';
import { prisma } from '../../src/shared/database';
import { createTestShopkeeper, createTestCustomer, clearDatabase } from '../utils/test-setup';

describe('Orders Service Integration', () => {
    let shopkeeperToken: string;
    let customerToken: string;
    let shopId: string;
    let customerId: string;

    beforeAll(async () => {
        await clearDatabase();
    });

    afterAll(async () => {
        await prisma.$disconnect();
    });

    beforeEach(async () => {
        // Setup Shopkeeper and Shop
        const sk = await createTestShopkeeper();
        shopkeeperToken = sk.token;

        const shopResponse = await request(app)
            .post('/api/shops')
            .set('Authorization', `Bearer ${shopkeeperToken}`)
            .send({ name: 'Order Test Shop', category: 'GROCERY' });
        shopId = shopResponse.body.shopId;

        // Setup Customer
        const cust = await createTestCustomer();
        customerToken = cust.token;
        customerId = cust.customer.id;
    });

    it('should allow customer to create an order', async () => {
        const response = await request(app)
            .post('/api/orders')
            .set('Authorization', `Bearer ${customerToken}`)
            .send({
                shopId,
                items: [{ name: 'Parle-G', quantity: 2, price: 10 }]
            });

        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('orderId');
        expect(response.body.status).toBe('PENDING');
        expect(response.body.customerId).toBe(customerId);
    });

    it('should allow customer to get their orders', async () => {
        // Create an order first
        await request(app)
            .post('/api/orders')
            .set('Authorization', `Bearer ${customerToken}`)
            .send({ shopId, items: [] });

        const response = await request(app)
            .get('/api/orders/my')
            .set('Authorization', `Bearer ${customerToken}`);

        expect(response.status).toBe(200);
        expect(response.body.length).toBeGreaterThan(0);
    });

    it('should allow shopkeeper to update order status', async () => {
        // Create order
        const orderRes = await request(app)
            .post('/api/orders')
            .set('Authorization', `Bearer ${customerToken}`)
            .send({ shopId, items: [] });
        const orderId = orderRes.body.orderId;

        const response = await request(app)
            .patch(`/api/orders/${orderId}/status`)
            .set('Authorization', `Bearer ${shopkeeperToken}`)
            .send({ status: 'ACCEPTED' });

        expect(response.status).toBe(200);
        expect(response.body.status).toBe('ACCEPTED');
    });
});
