"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.closeRedis = exports.invalidateShopCache = exports.getCachedShop = exports.cacheShop = exports.deleteCachePattern = exports.deleteCache = exports.setCache = exports.getCache = exports.initRedis = void 0;
const logger_1 = require("../utils/logger");
let redisClient = null;
/**
 * Initialize Redis connection
 */
const initRedis = async () => {
    // REDIS PAUSED BY USER REQUEST
    logger_1.logger.info('Redis caching is currently PAUSED. System running in direct-DB mode.');
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
exports.initRedis = initRedis;
/**
 * Get value from cache
 */
const getCache = async (key) => {
    if (!redisClient)
        return null;
    try {
        const cached = await redisClient.get(key);
        if (!cached)
            return null;
        return JSON.parse(cached);
    }
    catch (error) {
        logger_1.logger.error(`Cache get error for key ${key}:`, error);
        return null;
    }
};
exports.getCache = getCache;
/**
 * Set value in cache with TTL (in seconds)
 */
const setCache = async (key, value, ttl = 3600) => {
    if (!redisClient)
        return;
    try {
        await redisClient.setEx(key, ttl, JSON.stringify(value));
    }
    catch (error) {
        logger_1.logger.error(`Cache set error for key ${key}:`, error);
    }
};
exports.setCache = setCache;
/**
 * Delete value from cache
 */
const deleteCache = async (key) => {
    if (!redisClient)
        return;
    try {
        await redisClient.del(key);
    }
    catch (error) {
        logger_1.logger.error(`Cache delete error for key ${key}:`, error);
    }
};
exports.deleteCache = deleteCache;
/**
 * Delete multiple keys matching pattern
 */
const deleteCachePattern = async (pattern) => {
    if (!redisClient)
        return;
    try {
        const keys = await redisClient.keys(pattern);
        if (keys.length > 0) {
            await redisClient.del(keys);
        }
    }
    catch (error) {
        logger_1.logger.error(`Cache pattern delete error for ${pattern}:`, error);
    }
};
exports.deleteCachePattern = deleteCachePattern;
/**
 * Cache shop data
 */
const cacheShop = async (shopId, shop) => {
    await (0, exports.setCache)(`shop:${shopId}`, shop, 3600); // 1 hour
};
exports.cacheShop = cacheShop;
/**
 * Get cached shop
 */
const getCachedShop = async (shopId) => {
    return await (0, exports.getCache)(`shop:${shopId}`);
};
exports.getCachedShop = getCachedShop;
/**
 * Invalidate shop cache
 */
const invalidateShopCache = async (shopId) => {
    await (0, exports.deleteCache)(`shop:${shopId}`);
    await (0, exports.deleteCachePattern)(`shop:${shopId}:*`);
};
exports.invalidateShopCache = invalidateShopCache;
/**
 * Close Redis connection
 */
const closeRedis = async () => {
    if (redisClient) {
        await redisClient.quit();
        logger_1.logger.info('Redis connection closed');
    }
};
exports.closeRedis = closeRedis;
