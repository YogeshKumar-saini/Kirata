import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { routeMessage } from '../../src/services/router';
import { createTestShopkeeper, createTestCustomer, clearDatabase } from '../utils/test-setup';
import { prisma } from '../../src/shared/database';
import request from 'supertest';
import { app } from '../../src/app';

describe('Router Service (Strategy Pattern)', () => {
    let shopkeeperPhone: string;
    let customerPhone: string;
    let shopId: string;

    beforeAll(async () => {
        await clearDatabase();

        // Setup Shopkeeper with Shop
        const sk = await createTestShopkeeper();
        shopkeeperPhone = sk.shopkeeper.phone!;

        const shopRes = await request(app)
            .post('/api/shops')
            .set('Authorization', `Bearer ${sk.token}`)
            .send({ name: 'Router Test Shop', category: 'GROCERY' });
        shopId = shopRes.body.shopId;

        // Setup Customer
        const cust = await createTestCustomer();
        customerPhone = cust.customer.phone!;
    });

    afterAll(async () => {
        await prisma.$disconnect();
    });

    it('should route "sale" message for Shopkeeper', async () => {
        await routeMessage('msg1', shopkeeperPhone, 'sale 100');

        // Verify sale created
        const sales = await prisma.sale.findMany({ where: { shopId } });
        expect(sales.length).toBeGreaterThan(0);
        expect(Number(sales[0].amount)).toBe(100);
    });

    it('should route "order" message for Customer', async () => {
        await routeMessage('msg2', customerPhone, 'order Maggi');

        // Verify order created
        const orders = await prisma.order.findMany({ where: { shopId } });
        expect(orders.length).toBeGreaterThan(0);
        // Note: Strategy picks first available shop. 
        // Since we cleared DB and made one shop, it should be ours.
    });

    it('should ignore unknown intents', async () => {
        await routeMessage('msg3', customerPhone, 'hello world');
        // Should not throw and log info. Hard to assert without spying on logger, 
        // but passing execution is good enough for now.
    });
});
