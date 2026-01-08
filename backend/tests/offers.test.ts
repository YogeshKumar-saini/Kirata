
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../src/app';
import { prisma } from '../src/shared/database';
import { clearDatabase } from './utils/test-setup';

describe('Offers & Order Integration', () => {
    let token: string;
    let shopId: string;
    let customerId: string;
    let productId: string;
    let offerCode = 'SAVE50';

    const testPhone = '+916666666666';

    beforeAll(async () => {
        await clearDatabase();

        // 1. Register & Login
        await request(app).post('/api/shopkeeper/register').send({
            phone: testPhone,
            name: 'Offer Tester',
            shopName: 'Offer Shop'
        });

        const shopkeeper = await prisma.shopkeeper.findFirst({ where: { phone: testPhone } });
        const resLogin = await request(app).post('/api/auth/login').send({
            phone: testPhone,
            otp: shopkeeper?.otpSecret
        });
        token = resLogin.body.token;

        const shopRes = await request(app).post('/api/shops').set('Authorization', `Bearer ${token}`).send({
            name: 'Offer Shop',
            category: 'GROCERY',
            addressLine1: 'Test Address',
            city: 'Test City',
            state: 'Test State',
            pincode: '123456',
            phone: '+919999999999'
        });
        shopId = shopRes.body.shopId;

        // 3. Create Product (Price 100, Stock 100)
        const productRes = await request(app).post('/api/products').set('Authorization', `Bearer ${token}`).send({
            name: 'Expensive Item',
            price: 100,
            stock: 100
        });
        productId = productRes.body.productId;

        // 4. Create Customer
        const customer = await prisma.customer.create({
            data: {
                name: 'Offer Customer',
                phone: '+915555555555',
                uniqueId: 'OFFER-CUST'
            }
        });
        customerId = customer.id;
    });

    afterAll(async () => {
        await clearDatabase();
    });

    it('should create an offer with usage limit', async () => {
        const res = await request(app)
            .post('/api/offers')
            .set('Authorization', `Bearer ${token}`)
            .send({
                code: offerCode,
                type: 'FLAT',
                value: 50,
                minOrderValue: 10,
                usageLimit: 1
            });

        expect(res.status).toBe(201);
        expect(res.body.code).toBe(offerCode);
    });

    it('should apply offer to an order', async () => {
        // Order value 100. Discount 50. Total should be 50.
        const res = await request(app)
            .post('/api/orders')
            .set('Authorization', `Bearer ${token}`)
            .send({
                shopId: shopId,
                customerId: customerId,
                offerCode: offerCode,
                items: [
                    {
                        productId: productId,
                        quantity: 1
                    }
                ]
            });

        expect(res.status).toBe(201);
        expect(Number(res.body.totalAmount)).toBe(50);
        expect(Number(res.body.discount)).toBe(50);
    });

    it('should fail to apply offer if usage limit reached', async () => {
        // Try same offer again (Limit is 1)
        const res = await request(app)
            .post('/api/orders')
            .set('Authorization', `Bearer ${token}`)
            .send({
                shopId: shopId,
                customerId: customerId,
                offerCode: offerCode,
                items: [
                    {
                        productId: productId,
                        quantity: 1
                    }
                ]
            });

        expect(res.status).toBe(400); // Bad Request (Usage limit reached)
        expect(res.body.message).toMatch(/usage limit/i);
    });

    it('should allow manual deactivation', async () => {
        // Fetch offer ID
        const offersRes = await request(app).get('/api/offers').set('Authorization', `Bearer ${token}`);
        const offerId = offersRes.body[0].offerId;

        const res = await request(app)
            .patch(`/api/offers/${offerId}/deactivate`)
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(200);

        // Verify it is inactive
        const check = await prisma.offer.findUnique({ where: { offerId } });
        expect(check?.isActive).toBe(false);
    });
});
