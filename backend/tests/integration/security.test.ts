import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../../src/app';

describe('Security Middleware', () => {
    it('should set Helmet security headers', async () => {
        const response = await request(app).get('/health');

        expect(response.headers).toHaveProperty('x-dns-prefetch-control');
        expect(response.headers).toHaveProperty('x-frame-options');
        expect(response.headers).toHaveProperty('strict-transport-security');
        expect(response.headers['x-powered-by']).toBeUndefined(); // Helmet removes this
    });

    it('should set Rate Limit headers', async () => {
        const response = await request(app).get('/health');

        // express-rate-limit standardHeaders: true sends `RateLimit-Limit` etc.
        // Node lowercases headers.
        expect(response.headers).toHaveProperty('ratelimit-limit');
        expect(response.headers).toHaveProperty('ratelimit-remaining');
    });

    it('should enforce rate limiting', async () => {
        const response = await request(app).get('/health');
        expect(parseInt(response.headers['ratelimit-limit'])).toBe(100);
    });
});
