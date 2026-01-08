"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchShopsByText = exports.getTopRatedShops = exports.getNearbyShops = exports.searchShops = void 0;
const client_1 = require("@prisma/client");
const database_1 = require("../../shared/database");
const logger_1 = require("../../shared/utils/logger");
/**
 * Search shops with location-based filtering
 * Uses Haversine formula for distance calculation
 */
const searchShops = async (filters) => {
    const { latitude, longitude, radius = 5, category, deliveryAvailable, minRating, status, searchText } = filters;
    // If location provided, use raw SQL with Haversine formula
    if (latitude && longitude) {
        const shops = await database_1.prisma.$queryRaw `
            SELECT * FROM (
                SELECT *,
                (
                    6371 * acos(
                        cos(radians(${latitude})) *
                        cos(radians(latitude)) *
                        cos(radians(longitude) - radians(${longitude})) +
                        sin(radians(${latitude})) *
                        sin(radians(latitude))
                    )
                ) AS distance
                FROM shops
                WHERE deleted_at IS NULL
                ${category ? client_1.Prisma.sql `AND category = ${category}::"ShopCategory"` : client_1.Prisma.empty}
                ${deliveryAvailable ? client_1.Prisma.sql `AND delivery_available = true` : client_1.Prisma.empty}
                ${minRating ? client_1.Prisma.sql `AND average_rating >= ${minRating}` : client_1.Prisma.empty}
                ${status ? client_1.Prisma.sql `AND status = ${status}` : client_1.Prisma.empty}
                ${searchText ? client_1.Prisma.sql `AND (name ILIKE ${`%${searchText}%`} OR city ILIKE ${`%${searchText}%`} OR address_line1 ILIKE ${`%${searchText}%`})` : client_1.Prisma.empty}
            ) AS nearby_shops
            WHERE distance < ${radius}
            ORDER BY distance ASC
            LIMIT 50
        `;
        logger_1.logger.info(`Location search found ${shops.length} shops within ${radius}km`);
        return shops;
    }
    // Regular search without location
    const shops = await database_1.prisma.shop.findMany({
        where: {
            deletedAt: null,
            ...(category && { category }),
            ...(deliveryAvailable && { deliveryAvailable: true }),
            ...(minRating && { averageRating: { gte: minRating } }),
            ...(minRating && { averageRating: { gte: minRating } }),
            ...(status && { status }),
            ...(searchText && {
                OR: [
                    { name: { contains: searchText, mode: 'insensitive' } },
                    { city: { contains: searchText, mode: 'insensitive' } },
                    { addressLine1: { contains: searchText, mode: 'insensitive' } }
                ]
            })
        },
        take: 50,
        orderBy: { averageRating: 'desc' }
    });
    return shops;
};
exports.searchShops = searchShops;
/**
 * Get nearby shops sorted by distance
 */
const getNearbyShops = async (latitude, longitude, radiusKm = 5, limit = 20) => {
    const shops = await database_1.prisma.$queryRaw `
        SELECT * FROM (
            SELECT *,
            (
                6371 * acos(
                    cos(radians(${latitude})) *
                    cos(radians(latitude)) *
                    cos(radians(longitude) - radians(${longitude})) +
                    sin(radians(${latitude})) *
                    sin(radians(latitude))
                )
            ) AS distance
            FROM shops
            WHERE deleted_at IS NULL
            AND latitude IS NOT NULL
            AND longitude IS NOT NULL
        ) AS nearby_shops
        WHERE distance < ${radiusKm}
        ORDER BY distance ASC
        LIMIT ${limit}
    `;
    return shops;
};
exports.getNearbyShops = getNearbyShops;
/**
 * Get top-rated shops
 */
const getTopRatedShops = async (limit = 10) => {
    return await database_1.prisma.shop.findMany({
        where: {
            deletedAt: null,
            totalReviews: { gte: 5 } // At least 5 reviews
        },
        orderBy: {
            averageRating: 'desc'
        },
        take: limit
    });
};
exports.getTopRatedShops = getTopRatedShops;
/**
 * Search shops by text (name, city, category)
 */
const searchShopsByText = async (query) => {
    const searchTerm = `%${query}%`;
    return await database_1.prisma.shop.findMany({
        where: {
            deletedAt: null,
            OR: [
                { name: { contains: query, mode: 'insensitive' } },
                { city: { contains: query, mode: 'insensitive' } },
                { state: { contains: query, mode: 'insensitive' } }
            ]
        },
        take: 20,
        orderBy: { averageRating: 'desc' }
    });
};
exports.searchShopsByText = searchShopsByText;
