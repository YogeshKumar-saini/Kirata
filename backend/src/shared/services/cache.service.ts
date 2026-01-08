import { createClient, RedisClientType } from 'redis';
import { logger } from '../utils/logger';

let redisClient: RedisClientType | null = null as unknown as RedisClientType | null;

/**
 * Initialize Redis connection
 */
export const initRedis = async (): Promise<void> => {
    // REDIS PAUSED BY USER REQUEST
    logger.info('Redis caching is currently PAUSED. System running in direct-DB mode.');
    return;

    /*
    if (!process.env.REDIS_URL) {
        logger.warn('REDIS_URL not configured, caching disabled');
        return;
    }
    */

    /*
    try {
        redisClient = createClient({
            url: process.env.REDIS_URL
        });

        redisClient.on('error', (err) => {
            logger.error('Redis error:', err);
        });

        redisClient.on('connect', () => {
            logger.info('Redis connected successfully');
        });

        await redisClient.connect();
    } catch (error) {
        logger.error('Failed to connect to Redis:', error);
        redisClient = null;
    }
    */
};

/**
 * Get value from cache
 */
export const getCache = async <T>(key: string): Promise<T | null> => {
    if (!redisClient) return null;

    try {
        const cached = await redisClient.get(key);
        if (!cached) return null;

        return JSON.parse(cached) as T;
    } catch (error) {
        logger.error(`Cache get error for key ${key}:`, error);
        return null;
    }
};

/**
 * Set value in cache with TTL (in seconds)
 */
export const setCache = async (
    key: string,
    value: any,
    ttl: number = 3600
): Promise<void> => {
    if (!redisClient) return;

    try {
        await redisClient.setEx(key, ttl, JSON.stringify(value));
    } catch (error) {
        logger.error(`Cache set error for key ${key}:`, error);
    }
};

/**
 * Delete value from cache
 */
export const deleteCache = async (key: string): Promise<void> => {
    if (!redisClient) return;

    try {
        await redisClient.del(key);
    } catch (error) {
        logger.error(`Cache delete error for key ${key}:`, error);
    }
};

/**
 * Delete multiple keys matching pattern
 */
export const deleteCachePattern = async (pattern: string): Promise<void> => {
    if (!redisClient) return;

    try {
        const keys = await redisClient.keys(pattern);
        if (keys.length > 0) {
            await redisClient.del(keys);
        }
    } catch (error) {
        logger.error(`Cache pattern delete error for ${pattern}:`, error);
    }
};

/**
 * Cache shop data
 */
export const cacheShop = async (shopId: string, shop: any): Promise<void> => {
    await setCache(`shop:${shopId}`, shop, 3600); // 1 hour
};

/**
 * Get cached shop
 */
export const getCachedShop = async (shopId: string): Promise<any | null> => {
    return await getCache(`shop:${shopId}`);
};

/**
 * Invalidate shop cache
 */
export const invalidateShopCache = async (shopId: string): Promise<void> => {
    await deleteCache(`shop:${shopId}`);
    await deleteCachePattern(`shop:${shopId}:*`);
};

/**
 * Close Redis connection
 */
export const closeRedis = async (): Promise<void> => {
    if (redisClient) {
        await redisClient.quit();
        logger.info('Redis connection closed');
    }
};
