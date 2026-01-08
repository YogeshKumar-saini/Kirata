import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../../src/app';
import { prisma } from '../../src/shared/database';
import { createTestShopkeeper, createTestCustomer, clearDatabase } from '../utils/test-setup';

describe('Ledger Service Integration', () => {
    let shopkeeperToken: string;
    let customerToken: string; // Not typically used for recording sale, but needed for Udhaar
    let shopId: string;
    let customerId: string;

    beforeAll(async () => {
        await clearDatabase();
    });

    afterAll(async () => {
        await prisma.$disconnect();
    });

    beforeEach(async () => {
        const sk = await createTestShopkeeper();
        shopkeeperToken = sk.token;

        const shopResponse = await request(app)
            .post('/api/shops')
            .set('Authorization', `Bearer ${shopkeeperToken}`)
            .send({
                name: 'Ledger Test Shop',
                category: 'GROCERY',
                addressLine1: 'Integration Test St',
                city: 'Test City',
                state: 'Test State',
                pincode: '123456',
                phone: '+919999999999',
                email: 'integration@test.com'
            });
        shopId = shopResponse.body.shopId;

        const cust = await createTestCustomer();
        customerToken = cust.token;
        customerId = cust.customer.id;
    });

    it('should record a CASH sale', async () => {
        const response = await request(app)
            .post('/api/ledger/sale')
            .set('Authorization', `Bearer ${shopkeeperToken}`)
            .send({
                amount: 100,
                paymentType: 'CASH',
                source: 'MANUAL',
                customerId // Optional for cash
            });

        expect(response.status).toBe(201);
        expect(response.body.amount).toBe("100");
        expect(response.body.paymentType).toBe('CASH');
    });

    it('should record an UDHAAR sale and update balance', async () => {
        const response = await request(app)
            .post('/api/ledger/sale')
            .set('Authorization', `Bearer ${shopkeeperToken}`)
            .send({
                amount: 500,
                paymentType: 'UDHAAR',
                source: 'MANUAL',
                customerId
            });

        expect(response.status).toBe(201);
        expect(response.body.paymentType).toBe('UDHAAR');

        // Check Balance
        const balanceRes = await request(app)
            .get(`/api/ledger/balance/${customerId}`)
            .set('Authorization', `Bearer ${shopkeeperToken}`);

        expect(balanceRes.status).toBe(200);
        expect(balanceRes.body.balance).toBe(500);
    });
});
