import { Router } from 'express';
import { asyncHandler } from '../../shared/middlewares/asyncHandler';
import { authMiddleware } from '../../auth/middleware';
import * as ReviewService from './service';
import { ApiError } from '../../shared/errors/ApiError';
import { validate } from '../../shared/middlewares/validate.middleware';
import { createReviewSchema, updateReviewSchema } from '../../shared/validations/review.validation';

const router = Router();

// Shopkeeper - Get reviews for my shop
router.get('/managed/all', authMiddleware(['SHOPKEEPER']), asyncHandler(async (req, res) => {
    const { userId } = (req as any).user;

    // Import ShopService dynamically to avoid circular dependencies if any, 
    // or just to match pattern if preferred. Importing at top is better normally but let's do this:
    const ShopService = await import('../shops/service');
    const shop = await ShopService.getShopByOwnerId(userId);

    if (!shop) {
        throw new ApiError(404, 'Shop not found');
    }

    const limit = parseInt(req.query.limit as string) || 10;
    const offset = parseInt(req.query.offset as string) || 0;

    const reviews = await ReviewService.getShopReviews(shop.shopId, limit, offset);
    res.json(reviews);
}));

// Customer Routes - Get all my reviews
router.get('/my', authMiddleware(['CUSTOMER']), asyncHandler(async (req, res) => {
    const { userId } = (req as any).user;
    const reviews = await ReviewService.getCustomerReviews(userId);
    res.json({ reviews, count: reviews.length });
}));

// Public - Get reviews for a shop
router.get('/shop/:shopId', asyncHandler(async (req, res) => {
    const { shopId } = req.params;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = parseInt(req.query.offset as string) || 0;

    const reviews = await ReviewService.getShopReviews(shopId, limit, offset);
    res.json(reviews);
}));

// Protected routes - customers only
router.use(authMiddleware(['CUSTOMER']));

// Create review
router.post('/shop/:shopId', validate(createReviewSchema), asyncHandler(async (req, res) => {
    const { shopId } = req.params;
    const { userId } = (req as any).user;
    const { rating, comment, images } = req.body;

    // Check if customer already reviewed this shop
    const existing = await ReviewService.getCustomerReview(shopId, userId);
    if (existing) {
        throw new ApiError(400, 'You have already reviewed this shop. Please update your existing review.');
    }

    const review = await ReviewService.createReview(shopId, userId, rating, comment, images);
    res.status(201).json(review);
}));

// Get customer's own review for a shop
router.get('/shop/:shopId/my', asyncHandler(async (req, res) => {
    const { shopId } = req.params;
    const { userId } = (req as any).user;

    const review = await ReviewService.getCustomerReview(shopId, userId);
    if (!review) {
        throw new ApiError(404, 'You have not reviewed this shop yet');
    }

    res.json(review);
}));

// Update review
router.patch('/:reviewId', validate(updateReviewSchema), asyncHandler(async (req, res) => {
    const { reviewId } = req.params;
    const { userId } = (req as any).user;
    const { rating, comment } = req.body;

    const review = await ReviewService.updateReview(reviewId, userId, rating, comment);
    res.json(review);
}));

// Delete review
router.delete('/:reviewId', asyncHandler(async (req, res) => {
    const { reviewId } = req.params;
    const { userId } = (req as any).user;

    await ReviewService.deleteReview(reviewId, userId);
    res.json({ message: 'Review deleted successfully' });
}));

export default router;
