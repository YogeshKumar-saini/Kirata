import { Router } from 'express';
import { asyncHandler } from '../../shared/middlewares/asyncHandler';
import { authMiddleware } from '../../auth/middleware';
import * as AnalyticsService from './service';
import * as ShopService from '../shops/service';
import { ApiError } from '../../shared/errors/ApiError';

const router = Router();

// Protected routes - shopkeepers only
router.use(authMiddleware(['SHOPKEEPER']));

// Get my shop analytics
router.get('/my', asyncHandler(async (req, res) => {
    const { userId } = (req as any).user;
    const shop = await ShopService.getShopByOwnerId(userId);

    if (!shop) {
        throw new ApiError(404, 'No shop found');
    }

    // Get date range from query params
    const days = parseInt(req.query.days as string) || 30;
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const analytics = await AnalyticsService.getShopAnalytics(
        shop.shopId,
        startDate,
        endDate
    );

    res.json(analytics);
}));

// Get today's analytics
router.get('/my/today', asyncHandler(async (req, res) => {
    const { userId } = (req as any).user;
    const shop = await ShopService.getShopByOwnerId(userId);

    if (!shop) {
        throw new ApiError(404, 'No shop found');
    }

    const today = await AnalyticsService.getTodayAnalytics(shop.shopId);
    res.json(today);
}));

export default router;
