"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteReview = exports.updateReview = exports.getCustomerReview = exports.getShopReviews = exports.updateShopRating = exports.createReview = void 0;
exports.getCustomerReviews = getCustomerReviews;
const database_1 = require("../../shared/database");
const logger_1 = require("../../shared/utils/logger");
/**
 * Create a review for a shop
 */
const createReview = async (shopId, customerId, rating, comment, images) => {
    // Validate rating
    if (rating < 1 || rating > 5) {
        throw new Error('Rating must be between 1 and 5');
    }
    // Check if customer has ordered from this shop
    const hasOrdered = await database_1.prisma.order.findFirst({
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
    const review = await database_1.prisma.review.create({
        data: {
            shopId,
            customerId,
            rating,
            comment,
            images: images || []
        }
    });
    // Update shop average rating
    await (0, exports.updateShopRating)(shopId);
    logger_1.logger.info(`Review created for shop ${shopId} by customer ${customerId}`);
    return review;
};
exports.createReview = createReview;
/**
 * Update shop's average rating and total reviews
 */
const updateShopRating = async (shopId) => {
    const stats = await database_1.prisma.review.aggregate({
        where: { shopId },
        _avg: { rating: true },
        _count: true
    });
    await database_1.prisma.shop.update({
        where: { shopId },
        data: {
            averageRating: stats._avg.rating || 0,
            totalReviews: stats._count
        }
    });
};
exports.updateShopRating = updateShopRating;
/**
 * Get reviews for a shop
 */
const getShopReviews = async (shopId, limit = 10, offset = 0) => {
    const reviews = await database_1.prisma.review.findMany({
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
exports.getShopReviews = getShopReviews;
/**
 * Get customer's review for a shop
 */
const getCustomerReview = async (shopId, customerId) => {
    return await database_1.prisma.review.findFirst({
        where: {
            shopId,
            customerId
        }
    });
};
exports.getCustomerReview = getCustomerReview;
// Get all reviews by a customer
async function getCustomerReviews(customerId) {
    return database_1.prisma.review.findMany({
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
const updateReview = async (reviewId, customerId, rating, comment) => {
    // Verify ownership
    const review = await database_1.prisma.review.findUnique({
        where: { reviewId }
    });
    if (!review || review.customerId !== customerId) {
        throw new Error('Review not found or access denied');
    }
    // Validate rating if provided
    if (rating && (rating < 1 || rating > 5)) {
        throw new Error('Rating must be between 1 and 5');
    }
    const updated = await database_1.prisma.review.update({
        where: { reviewId },
        data: {
            ...(rating && { rating }),
            ...(comment !== undefined && { comment })
        }
    });
    // Update shop rating
    await (0, exports.updateShopRating)(review.shopId);
    return updated;
};
exports.updateReview = updateReview;
/**
 * Delete a review
 */
const deleteReview = async (reviewId, customerId) => {
    const review = await database_1.prisma.review.findUnique({
        where: { reviewId }
    });
    if (!review || review.customerId !== customerId) {
        throw new Error('Review not found or access denied');
    }
    await database_1.prisma.review.delete({
        where: { reviewId }
    });
    // Update shop rating
    await (0, exports.updateShopRating)(review.shopId);
    logger_1.logger.info(`Review ${reviewId} deleted`);
};
exports.deleteReview = deleteReview;
