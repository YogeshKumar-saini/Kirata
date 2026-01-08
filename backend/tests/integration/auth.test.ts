import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../../src/app';
import { prisma } from '../../src/shared/database';
import { clearDatabase } from '../utils/test-setup';

describe('Auth Service Integration', () => {
    beforeAll(async () => {
        await clearDatabase();
    });

    afterAll(async () => {
        await prisma.$disconnect();
    });

    const testUser = {
        phone: '+919999999999',
        name: 'Test Auth User'
    };

    it('should register a new shopkeeper', async () => {
        const response = await request(app)
            .post('/api/shopkeeper/register')
            .send(testUser);

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('message');
        expect(response.body).toHaveProperty('uniqueId');
    });

    it('should request OTP', async () => {
        const response = await request(app)
            .post('/api/auth/otp')
            .send({ phone: testUser.phone });

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('OTP sent');
    });

    // Note: We can't easily test verify OTP without mocking or peeking DB.
    // For integration test, let's peek DB to get the secret.
    it('should login with correct OTP', async () => {
        const user = await prisma.shopkeeper.findUnique({ where: { phone: testUser.phone } });
        const secret = user?.otpSecret;

        const response = await request(app)
            .post('/api/auth/login')
            .send({
                phone: testUser.phone,
                otp: secret
            });

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('token');
        expect(response.body.user.phone).toBe(testUser.phone);
    });
});
