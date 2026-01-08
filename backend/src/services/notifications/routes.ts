import { Router } from 'express';
import { asyncHandler } from '../../shared/middlewares/asyncHandler';
import { authMiddleware } from '../../auth/middleware';
import { notificationService } from './service';
import { ApiError } from '../../shared/errors/ApiError';

const router = Router();

router.use(authMiddleware(['SHOPKEEPER']));

// Send a manual payment reminder
router.post('/remind/payment', asyncHandler(async (req, res) => {
    const { customerId, amount } = req.body;
    const { user } = req as any;

    if (!customerId || !amount) {
        throw new ApiError(400, 'Customer ID and amount are required');
    }

    // Get shop ID - assuming updated ShopService or user extraction
    // Ideally we get shopId from user/middleware. For now assuming we can get it via service or it's attached.
    // Let's fetch shop first.
    const ShopService = await import('../shops/service');
    const shop = await ShopService.getShopByOwnerId(user.userId);
    if (!shop) throw new ApiError(404, 'Shop not found');

    const success = await notificationService.sendPaymentReminder(shop.shopId, customerId, Number(amount));

    if (!success) {
        throw new ApiError(400, 'Failed to send reminder. Check if customer has a valid phone number.');
    }

    res.json({ message: 'Reminder sent successfully' });
}));

// Send bulk payment reminders
router.post('/remind/payment/bulk', asyncHandler(async (req, res) => {
    const { customerIds } = req.body;
    const { user } = req as any;

    if (!customerIds || !Array.isArray(customerIds) || customerIds.length === 0) {
        throw new ApiError(400, 'Customer IDs array is required');
    }

    const ShopService = await import('../shops/service');
    const shop = await ShopService.getShopByOwnerId(user.userId);
    if (!shop) throw new ApiError(404, 'Shop not found');

    const results = await notificationService.sendBulkPaymentReminders(shop.shopId, customerIds);
    res.json(results);
}));

// Get notification history
router.get('/history', asyncHandler(async (req, res) => {
    const { limit, offset } = req.query;
    const { user } = req as any;

    const ShopService = await import('../shops/service');
    const shop = await ShopService.getShopByOwnerId(user.userId);
    if (!shop) throw new ApiError(404, 'Shop not found');

    const history = await notificationService.getNotificationHistory(
        shop.shopId,
        Number(limit) || 50,
        Number(offset) || 0
    );

    res.json(history);
}));

export default router;
