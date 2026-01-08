"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const asyncHandler_1 = require("../../shared/middlewares/asyncHandler");
const middleware_1 = require("../../auth/middleware");
const ReviewService = __importStar(require("./service"));
const ApiError_1 = require("../../shared/errors/ApiError");
const validate_middleware_1 = require("../../shared/middlewares/validate.middleware");
const review_validation_1 = require("../../shared/validations/review.validation");
const router = (0, express_1.Router)();
// Shopkeeper - Get reviews for my shop
router.get('/managed/all', (0, middleware_1.authMiddleware)(['SHOPKEEPER']), (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { userId } = req.user;
    // Import ShopService dynamically to avoid circular dependencies if any, 
    // or just to match pattern if preferred. Importing at top is better normally but let's do this:
    const ShopService = await Promise.resolve().then(() => __importStar(require('../shops/service')));
    const shop = await ShopService.getShopByOwnerId(userId);
    if (!shop) {
        throw new ApiError_1.ApiError(404, 'Shop not found');
    }
    const limit = parseInt(req.query.limit) || 10;
    const offset = parseInt(req.query.offset) || 0;
    const reviews = await ReviewService.getShopReviews(shop.shopId, limit, offset);
    res.json(reviews);
}));
// Customer Routes - Get all my reviews
router.get('/my', (0, middleware_1.authMiddleware)(['CUSTOMER']), (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { userId } = req.user;
    const reviews = await ReviewService.getCustomerReviews(userId);
    res.json({ reviews, count: reviews.length });
}));
// Public - Get reviews for a shop
router.get('/shop/:shopId', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { shopId } = req.params;
    const limit = parseInt(req.query.limit) || 10;
    const offset = parseInt(req.query.offset) || 0;
    const reviews = await ReviewService.getShopReviews(shopId, limit, offset);
    res.json(reviews);
}));
// Protected routes - customers only
router.use((0, middleware_1.authMiddleware)(['CUSTOMER']));
// Create review
router.post('/shop/:shopId', (0, validate_middleware_1.validate)(review_validation_1.createReviewSchema), (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { shopId } = req.params;
    const { userId } = req.user;
    const { rating, comment, images } = req.body;
    // Check if customer already reviewed this shop
    const existing = await ReviewService.getCustomerReview(shopId, userId);
    if (existing) {
        throw new ApiError_1.ApiError(400, 'You have already reviewed this shop. Please update your existing review.');
    }
    const review = await ReviewService.createReview(shopId, userId, rating, comment, images);
    res.status(201).json(review);
}));
// Get customer's own review for a shop
router.get('/shop/:shopId/my', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { shopId } = req.params;
    const { userId } = req.user;
    const review = await ReviewService.getCustomerReview(shopId, userId);
    if (!review) {
        throw new ApiError_1.ApiError(404, 'You have not reviewed this shop yet');
    }
    res.json(review);
}));
// Update review
router.patch('/:reviewId', (0, validate_middleware_1.validate)(review_validation_1.updateReviewSchema), (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { reviewId } = req.params;
    const { userId } = req.user;
    const { rating, comment } = req.body;
    const review = await ReviewService.updateReview(reviewId, userId, rating, comment);
    res.json(review);
}));
// Delete review
router.delete('/:reviewId', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { reviewId } = req.params;
    const { userId } = req.user;
    await ReviewService.deleteReview(reviewId, userId);
    res.json({ message: 'Review deleted successfully' });
}));
exports.default = router;
