import { Router } from 'express';
import { asyncHandler } from '../../shared/middlewares/asyncHandler';
import { authMiddleware } from '../../auth/middleware';
import * as ShopService from '../shops/service';
import * as ExportService from './service';
import { ApiError } from '../../shared/errors/ApiError';

const router = Router();

// Protected routes - shopkeepers only
router.use(authMiddleware(['SHOPKEEPER']));

// Export orders
router.get('/orders', asyncHandler(async (req, res) => {
    const { userId } = (req as any).user;
    const shop = await ShopService.getShopByOwnerId(userId);

    if (!shop) {
        throw new ApiError(404, 'No shop found');
    }

    const csv = await ExportService.exportOrders(shop.shopId);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="orders-${shop.shopId}.csv"`);
    res.send(csv);
}));

// Export analytics
router.get('/analytics', asyncHandler(async (req, res) => {
    const { userId } = (req as any).user;
    const shop = await ShopService.getShopByOwnerId(userId);

    if (!shop) {
        throw new ApiError(404, 'No shop found');
    }

    const days = parseInt(req.query.days as string) || 30;
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const csv = await ExportService.exportAnalytics(shop.shopId, startDate, endDate);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="analytics-${shop.shopId}.csv"`);
    res.send(csv);
}));

// Export reviews
router.get('/reviews', asyncHandler(async (req, res) => {
    const { userId } = (req as any).user;
    const shop = await ShopService.getShopByOwnerId(userId);

    if (!shop) {
        throw new ApiError(404, 'No shop found');
    }

    const csv = await ExportService.exportReviews(shop.shopId);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="reviews-${shop.shopId}.csv"`);
    res.send(csv);
}));

export default router;
