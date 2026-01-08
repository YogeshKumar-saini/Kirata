import { Prisma } from '@prisma/client';
import { prisma } from '../../shared/database';
import { ShopCategory } from '@prisma/client';
import { logger } from '../../shared/utils/logger';

export interface SearchFilters {
    latitude?: number;
    longitude?: number;
    radius?: number; // in km
    category?: ShopCategory;
    deliveryAvailable?: boolean;
    isOpen?: boolean;
    minRating?: number;
    status?: string; // ACTIVE, TEMPORARILY_CLOSED, etc.
    searchText?: string;
}

/**
 * Search shops with location-based filtering
 * Uses Haversine formula for distance calculation
 */
export const searchShops = async (filters: SearchFilters) => {
    const { latitude, longitude, radius = 5, category, deliveryAvailable, minRating, status, searchText } = filters;

    // If location provided, use raw SQL with Haversine formula
    if (latitude && longitude) {
        const shops = await prisma.$queryRaw<any[]>`
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
                ${category ? Prisma.sql`AND category = ${category}::"ShopCategory"` : Prisma.empty}
                ${deliveryAvailable ? Prisma.sql`AND delivery_available = true` : Prisma.empty}
                ${minRating ? Prisma.sql`AND average_rating >= ${minRating}` : Prisma.empty}
                ${status ? Prisma.sql`AND status = ${status}` : Prisma.empty}
                ${searchText ? Prisma.sql`AND (name ILIKE ${`%${searchText}%`} OR city ILIKE ${`%${searchText}%`} OR address_line1 ILIKE ${`%${searchText}%`})` : Prisma.empty}
            ) AS nearby_shops
            WHERE distance < ${radius}
            ORDER BY distance ASC
            LIMIT 50
        `;

        logger.info(`Location search found ${shops.length} shops within ${radius}km`);
        return shops;
    }

    // Regular search without location
    const shops = await prisma.shop.findMany({
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

/**
 * Get nearby shops sorted by distance
 */
export const getNearbyShops = async (
    latitude: number,
    longitude: number,
    radiusKm: number = 5,
    limit: number = 20
) => {
    const shops = await prisma.$queryRaw<any[]>`
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

/**
 * Get top-rated shops
 */
export const getTopRatedShops = async (limit: number = 10) => {
    return await prisma.shop.findMany({
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

/**
 * Search shops by text (name, city, category)
 */
export const searchShopsByText = async (query: string) => {
    const searchTerm = `%${query}%`;

    return await prisma.shop.findMany({
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
