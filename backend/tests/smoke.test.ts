import { app } from '../src/app';
import request from 'supertest';
import { describe, it, expect } from 'vitest';

describe('Smoke Test', () => {
    it('GET /health should return 200', async () => {
        const response = await request(app).get('/health');
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('status', 'ok');
    });
});
