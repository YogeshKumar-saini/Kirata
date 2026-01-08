import { prisma } from '../../shared/database';
import { logger } from '../../shared/utils/logger';

/**
 * Create a review for a shop
 */
export const createReview = async (
    shopId: string,
    customerId: string,
    rating: number,
    comment?: string,
    images?: string[]
) => {
    // Validate rating
    if (rating < 1 || rating > 5) {
        throw new Error('Rating must be between 1 and 5');
    }

    // Check if customer has ordered from this shop
    const hasOrdered = await prisma.order.findFirst({
        where: {
            shopId,
            customerId,
            status: 'COLLECTED' // Only completed orders
        }
    });

    if (!hasOrdered) {
        throw new Error('You can only review shops you have ordered from');
    }

    // Create review
    const review = await prisma.review.create({
        data: {
            shopId,
            customerId,
            rating,
            comment,
            images: images || []
        }
    });

    // Update shop average rating
    await updateShopRating(shopId);

    logger.info(`Review created for shop ${shopId} by customer ${customerId}`);
    return review;
};

/**
 * Update shop's average rating and total reviews
 */
export const updateShopRating = async (shopId: string) => {
    const stats = await prisma.review.aggregate({
        where: { shopId },
        _avg: { rating: true },
        _count: true
    });

    await prisma.shop.update({
        where: { shopId },
        data: {
            averageRating: stats._avg.rating || 0,
            totalReviews: stats._count
        }
    });
};

/**
 * Get reviews for a shop
 */
export const getShopReviews = async (
    shopId: string,
    limit: number = 10,
    offset: number = 0
) => {
    const reviews = await prisma.review.findMany({
        where: { shopId },
        include: {
            customer: {
                select: {
                    id: true,
                    name: true
                }
            }
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset
    });

    return reviews;
};

/**
 * Get customer's review for a shop
 */
export const getCustomerReview = async (shopId: string, customerId: string) => {
    return await prisma.review.findFirst({
        where: {
            shopId,
            customerId
        }
    });
};

// Get all reviews by a customer
export async function getCustomerReviews(customerId: string) {
    return prisma.review.findMany({
        where: { customerId },
        include: {
            shop: {
                select: {
                    shopId: true,
                    name: true,
                    city: true
                }
            }
        },
        orderBy: { createdAt: 'desc' }
    });
}

/**
 * Update a review
 */
export const updateReview = async (
    reviewId: string,
    customerId: string,
    rating?: number,
    comment?: string
) => {
    // Verify ownership
    const review = await prisma.review.findUnique({
        where: { reviewId }
    });

    if (!review || review.customerId !== customerId) {
        throw new Error('Review not found or access denied');
    }

    // Validate rating if provided
    if (rating && (rating < 1 || rating > 5)) {
        throw new Error('Rating must be between 1 and 5');
    }

    const updated = await prisma.review.update({
        where: { reviewId },
        data: {
            ...(rating && { rating }),
            ...(comment !== undefined && { comment })
        }
    });

    // Update shop rating
    await updateShopRating(review.shopId);

    return updated;
};

/**
 * Delete a review
 */
export const deleteReview = async (reviewId: string, customerId: string) => {
    const review = await prisma.review.findUnique({
        where: { reviewId }
    });

    if (!review || review.customerId !== customerId) {
        throw new Error('Review not found or access denied');
    }

    await prisma.review.delete({
        where: { reviewId }
    });

    // Update shop rating
    await updateShopRating(review.shopId);

    logger.info(`Review ${reviewId} deleted`);
};
