import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../../src/app';
import { prisma } from '../../src/shared/database';
import { createTestShopkeeper, clearDatabase } from '../utils/test-setup';

describe('Shop Service Integration', () => {
    let authToken: string;
    let shopkeeperId: string;

    beforeAll(async () => {
        await clearDatabase();
    });

    afterAll(async () => {
        await prisma.$disconnect();
    });

    beforeEach(async () => {
        const { shopkeeper, token } = await createTestShopkeeper();
        authToken = token;
        shopkeeperId = shopkeeper.id;
    });

    it('should create a new shop', async () => {
        const response = await request(app)
            .post('/api/shops')
            .set('Authorization', `Bearer ${authToken}`)
            .send({
                name: 'Test Shop',
                category: 'GROCERY'
            });

        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('shopId');
        expect(response.body.name).toBe('Test Shop');
        expect(response.body.ownerId).toBe(shopkeeperId);
    });

    it('should get shops for the authenticated shopkeeper', async () => {
        // Create a shop first
        await request(app)
            .post('/api/shops')
            .set('Authorization', `Bearer ${authToken}`)
            .send({
                name: 'My Shop',
                category: 'MEDICAL'
            });

        const response = await request(app)
            .get('/api/shops/my')
            .set('Authorization', `Bearer ${authToken}`);

        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBeGreaterThan(0);
        expect(response.body[0].name).toBe('My Shop');
    });
});
