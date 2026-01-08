
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../src/app';
import { prisma } from '../src/shared/database';
import { clearDatabase } from './utils/test-setup';
import bcrypt from 'bcryptjs';

describe('Inventory & Order Management', () => {
    let token: string;
    let shopId: string;
    let customerId: string;
    let productId: string;

    const testPhone = '+917777777777';

    beforeAll(async () => {
        await clearDatabase();

        // 1. Register & Login
        const registerRes = await request(app).post('/api/shopkeeper/register').send({
            phone: testPhone,
            name: 'Inventory Tester',
            shopName: 'Inventory Shop'
        });

        // Login to get token
        const shopkeeper = await prisma.shopkeeper.findFirst({ where: { phone: testPhone } });
        const resLogin = await request(app).post('/api/auth/login').send({
            phone: testPhone,
            otp: shopkeeper?.otpSecret
        });
        token = resLogin.body.token;

        // 2. Create Shop
        const shopRes = await request(app).post('/api/shops').set('Authorization', `Bearer ${token}`).send({
            name: 'Inventory Shop',
            category: 'GROCERY',
            addressLine1: 'Test Address',
            city: 'Test City',
            state: 'Test State',
            pincode: '123456',
            phone: '+919999999999'
        });
        shopId = shopRes.body.shopId;

        // 3. Create Product with Stock = 10
        const productRes = await request(app).post('/api/products').set('Authorization', `Bearer ${token}`).send({
            name: 'Stock Item',
            price: 100,
            stock: 10
        });
        productId = productRes.body.productId;

        // 4. Create Customer
        const customer = await prisma.customer.create({
            data: {
                name: 'Inventory Customer',
                phone: '+915555555555',
                uniqueId: 'INV-CUST'
            }
        });
        customerId = customer.id;
    });

    afterAll(async () => {
        await clearDatabase();
    });

    it('should create an order and deduct stock', async () => {
        const res = await request(app)
            .post('/api/orders')
            .set('Authorization', `Bearer ${token}`)
            .send({
                shopId: shopId,
                customerId: customerId,
                items: [
                    {
                        productId: productId,
                        quantity: 5
                    }
                ]
            });

        expect(res.status).toBe(201);

        // Verify stock
        const product = await prisma.product.findUnique({ where: { productId } });
        expect(product?.stock).toBe(5); // 10 - 5 = 5
    });

    it('should fail to create order with insufficient stock', async () => {
        // Try to order 6 items (Stock is 5)
        const res = await request(app)
            .post('/api/orders')
            .set('Authorization', `Bearer ${token}`)
            .send({
                shopId: shopId,
                customerId: customerId,
                items: [
                    {
                        productId: productId,
                        quantity: 6
                    }
                ]
            });

        expect(res.status).toBe(400);
        expect(res.body.message).toMatch(/Insufficient stock/);

        // Verify stock remains 5
        const product = await prisma.product.findUnique({ where: { productId } });
        expect(product?.stock).toBe(5);
    });

    it('should allow ad-hoc items without stock check', async () => {
        const res = await request(app)
            .post('/api/orders')
            .set('Authorization', `Bearer ${token}`)
            .send({
                shopId: shopId,
                customerId: customerId,
                items: [
                    {
                        name: "Adhoc Item",
                        price: 50,
                        quantity: 100 // Large quantity
                    }
                ]
            });

        expect(res.status).toBe(201);
    });
});
