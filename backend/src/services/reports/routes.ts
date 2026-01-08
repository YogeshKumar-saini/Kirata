import { Router } from 'express';
import { authMiddleware } from '../../auth/middleware';
import { asyncHandler } from '../../shared/middlewares/asyncHandler';
import { ApiError } from '../../shared/errors/ApiError';
import * as ShopService from '../shops/service';
import * as ReportsService from './service';

const router = Router();

// Generate PDF Report
router.get('/generate', authMiddleware(['SHOPKEEPER']), asyncHandler(async (req, res) => {
    const { userId } = (req as any).user;
    const { timeframe, date } = req.query;

    if (!timeframe || !['daily', 'weekly', 'monthly'].includes(timeframe as string)) {
        throw new ApiError(400, 'Invalid timeframe. Must be daily, weekly, or monthly.');
    }

    const reportDate = date ? new Date(date as string) : new Date();
    if (isNaN(reportDate.getTime())) {
        throw new ApiError(400, 'Invalid date format');
    }

    const shopResult = await ShopService.getShopByOwnerId(userId);
    if (!shopResult) throw new ApiError(404, 'Shop not found');

    const pdfBuffer = await ReportsService.generatePDFReport(shopResult.shopId, {
        timeframe: timeframe as 'daily' | 'weekly' | 'monthly',
        date: reportDate
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=report-${timeframe}-${reportDate.toISOString().split('T')[0]}.pdf`);
    res.send(pdfBuffer);
}));

// Get Dashboard Analytics
router.get('/dashboard', authMiddleware(['SHOPKEEPER']), asyncHandler (async (req, res) => {
    const { userId } = (req as any).user;
    const { timeframe = 'monthly' } = req.query; // default to monthly view (last 30 days)

    const shopResult = await ShopService.getShopByOwnerId(userId);
    if (!shopResult) throw new ApiError(404, 'Shop not found');

    const data = await ReportsService.getReportData(shopResult.shopId, timeframe as any);
    res.json(data);
}));

// Email Report
router.post('/email', authMiddleware(['SHOPKEEPER']), asyncHandler(async (req, res) => {
    const { userId } = (req as any).user;
    const { timeframe, date, email } = req.body;

    if (!timeframe || !['daily', 'weekly', 'monthly'].includes(timeframe)) {
        throw new ApiError(400, 'Invalid timeframe. Must be daily, weekly, or monthly.');
    }

    const reportDate = date ? new Date(date) : new Date();
    if (isNaN(reportDate.getTime())) {
        throw new ApiError(400, 'Invalid date format');
    }

    const shopResult = await ShopService.getShopByOwnerId(userId);
    if (!shopResult) throw new ApiError(404, 'Shop not found');

    // Use provided email or fallback to shopkeeper's registered email
    // We need to fetch shopkeeper email if not provided.
    let targetEmail = email;
    if (!targetEmail) {
        // Assuming user object from authMiddleware has email, or we fetch it.
        // user in authMiddleware is { userId, role, ... } usually.
        // Let's assume we need to fetch it or client sends it.
        // For now, let's require client to send it OR fetch from DB.
        // To be safe, let's fetch shopkeeper details.
        const shopkeeper = await ShopService.getShopkeeperById(userId);
        targetEmail = shopkeeper?.email;
    }

    if (!targetEmail) {
        throw new ApiError(400, 'Email address is required');
    }

    await import('./email-handler').then(m => m.emailReportHandler(
        shopResult.shopId,
        targetEmail,
        timeframe,
        reportDate
    ));

    res.json({ success: true, message: `Report emailed to ${targetEmail}` });
}));

export default router;
