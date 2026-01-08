
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../src/app';
import { prisma } from '../src/shared/database';
import bcrypt from 'bcryptjs';

describe('Auth & Shopkeeper Flow', () => {
    let shopkeeperId: string;
    let token: string;
    const testPhone = '+919999999999';
    const testPin = '1234';

    beforeAll(async () => {
        // Cleanup
        await prisma.shopkeeper.deleteMany({ where: { phone: testPhone } });
    });

    afterAll(async () => {
        await prisma.shopkeeper.deleteMany({ where: { phone: testPhone } });
    });

    it('should register a new shopkeeper and login via OTP', async () => {
        // 1. Register
        console.log("Attempting to register on /api/shopkeeper/register");
        const resReg = await request(app).post('/api/shopkeeper/register').send({
            phone: testPhone,
            name: 'Test Keeper',
            shopName: 'Test Shop'
        });

        expect(resReg.status).toBe(200);
        expect(resReg.body).toHaveProperty('uniqueId');

        // 2. Fetch OTP from DB
        const shopkeeper = await prisma.shopkeeper.findUnique({ where: { phone: testPhone } });
        expect(shopkeeper).toBeDefined();
        const otp = shopkeeper?.otpSecret;
        expect(otp).toBeDefined();
        shopkeeperId = shopkeeper!.id;

        // 3. Login with OTP
        const resLogin = await request(app).post('/api/auth/login').send({
            phone: testPhone,
            otp: otp
        });

        expect(resLogin.status).toBe(200);
        expect(resLogin.body).toHaveProperty('token');
        token = resLogin.body.token;
    });

    it('should set transaction PIN', async () => {
        // Wait for token from previous test
        expect(token).toBeDefined();

        const res = await request(app)
            .patch('/api/shopkeepers/pin')
            .set('Authorization', `Bearer ${token}`)
            .send({ pin: testPin });

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('message');
    });

    it('should verify PIN explicitly', async () => {
        const shopkeeper = await prisma.shopkeeper.findUnique({ where: { id: shopkeeperId } });
        expect(shopkeeper?.transactionPin).toBeDefined();
        const isValid = await bcrypt.compare(testPin, shopkeeper!.transactionPin!);
        expect(isValid).toBe(true);
    });
});
