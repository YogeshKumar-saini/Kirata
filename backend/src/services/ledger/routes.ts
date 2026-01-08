import { Router } from 'express';
import { validate } from '../../shared/middlewares/validate.middleware';
import { asyncHandler } from '../../shared/middlewares/asyncHandler';
import { authMiddleware } from '../../auth/middleware';
import { verifyPinMiddleware } from '../../shared/middlewares/pin-auth.middleware';
import { recordSaleSchema } from '../../shared/validations/ledger.validation';
import * as LedgerService from './service';
import * as ShopService from '../shops/service'; // To get shopId
import { ApiError } from '../../shared/errors/ApiError';

const router = Router();

// Shopkeeper Routes
router.post('/sale', authMiddleware(['SHOPKEEPER']), validate(recordSaleSchema), asyncHandler(async (req, res) => {
    const { amount, paymentType, source, customerId, notes, bypassCreditLimit } = req.body;
    const { userId } = (req as any).user;

    // Get Shop ID for this shopkeeper
    const shopResult = await ShopService.getShopByOwnerId(userId);
    if (!shopResult) throw new ApiError(404, 'Shop not found for this user');

    const sale = await LedgerService.recordSale(shopResult.shopId, amount, paymentType, source, customerId, notes, bypassCreditLimit);
    res.status(201).json(sale);
}));

router.get('/balance/:customerId', authMiddleware(['SHOPKEEPER']), asyncHandler(async (req, res) => {
    const { customerId } = req.params;
    const { userId } = (req as any).user;

    const shopResult = await ShopService.getShopByOwnerId(userId);
    if (!shopResult) throw new ApiError(404, 'Shop not found');

    const balance = await LedgerService.getCustomerBalance(shopResult.shopId, customerId);
    res.json({ balance });
}));

// Get all sales for shop with advanced filtering
router.get('/sales', authMiddleware(['SHOPKEEPER']), asyncHandler(async (req, res) => {
    const { userId } = (req as any).user;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 100;
    const paymentType = req.query.paymentType as string | undefined;
    const customerId = req.query.customerId as string | undefined;
    const startDate = req.query.startDate as string | undefined;
    const endDate = req.query.endDate as string | undefined;
    const minAmount = req.query.minAmount ? parseFloat(req.query.minAmount as string) : undefined;
    const maxAmount = req.query.maxAmount ? parseFloat(req.query.maxAmount as string) : undefined;
    const groupBy = req.query.groupBy as 'customer' | 'date' | undefined;
    const cursor = req.query.cursor as string | undefined;
    const search = req.query.search as string | undefined;

    const shopResult = await ShopService.getShopByOwnerId(userId);
    if (!shopResult) throw new ApiError(404, 'Shop not found');

    const result = await LedgerService.getAllSales(shopResult.shopId, limit, {
        paymentType,
        customerId,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        minAmount,
        maxAmount,
        groupBy,
        cursor,
        search
    });

    res.json(result);
}));

// Get sales summary/analytics
router.get('/summary', authMiddleware(['SHOPKEEPER']), asyncHandler(async (req, res) => {
    const { userId } = (req as any).user;
    const startDate = req.query.startDate as string | undefined;
    const endDate = req.query.endDate as string | undefined;

    const shopResult = await ShopService.getShopByOwnerId(userId);
    if (!shopResult) throw new ApiError(404, 'Shop not found');

    const summary = await LedgerService.getSalesSummary(shopResult.shopId, {
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined
    });

    res.json(summary);
}));

// Get customer-specific transactions
router.get('/customer/:customerId/transactions', authMiddleware(['SHOPKEEPER']), asyncHandler(async (req, res) => {
    const { customerId } = req.params;
    const { userId } = (req as any).user;

    const shopResult = await ShopService.getShopByOwnerId(userId);
    if (!shopResult) throw new ApiError(404, 'Shop not found');

    const transactions = await LedgerService.getCustomerTransactions(shopResult.shopId, customerId);
    res.json(transactions);
}));

// Record payment against udhaar OR record new udhaar
router.post('/payment', authMiddleware(['SHOPKEEPER']), asyncHandler(async (req, res) => {
    const { customerId, amount, paymentMethod, notes } = req.body;
    const { userId } = (req as any).user;

    const shopResult = await ShopService.getShopByOwnerId(userId);
    if (!shopResult) throw new ApiError(404, 'Shop not found');

    // If payment method is UDHAAR, create a new sale with UDHAAR payment type
    if (paymentMethod === 'UDHAAR') {
        const sale = await LedgerService.recordSale(
            shopResult.shopId,
            amount,
            'UDHAAR',
            'MANUAL',
            customerId,
            notes
        );
        res.status(201).json(sale);
    } else {
        // Otherwise, record payment against existing udhaar
        try {
            const result = await LedgerService.recordPayment(
                shopResult.shopId,
                customerId,
                amount,
                paymentMethod,
                notes
            );
            res.status(201).json(result);
        } catch (error: any) {
            // If no outstanding udhaar, just record as a regular sale
            if (error.message && error.message.includes('No outstanding udhaar')) {
                const sale = await LedgerService.recordSale(
                    shopResult.shopId,
                    amount,
                    paymentMethod as any,
                    'MANUAL',
                    customerId,
                    notes
                );
                res.status(201).json(sale);
            } else {
                throw error;
            }
        }
    }
}));

// Bulk update transactions
router.patch('/transaction/bulk', authMiddleware(['SHOPKEEPER']), verifyPinMiddleware, asyncHandler(async (req, res) => {
    try {
        const { saleIds, paymentType, tags } = req.body;
        const { userId } = (req as any).user;

        if (!Array.isArray(saleIds) || saleIds.length === 0) {
            throw new ApiError(400, 'No transaction IDs provided');
        }

        const shopResult = await ShopService.getShopByOwnerId(userId);
        if (!shopResult) throw new ApiError(404, 'Shop not found');

        const result = await LedgerService.bulkUpdateTransactions(shopResult.shopId, {
            saleIds,
            paymentType,
            tags,
            userId
        });

        res.json({ success: true, count: result.count });
    } catch (error) {
        if (error instanceof ApiError) {
            res.status(error.statusCode).json({ error: error.message });
        } else {
            console.error('Bulk update error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
}));

// Update transaction
router.patch('/transaction/:id', authMiddleware(['SHOPKEEPER']), asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { amount, paymentType, notes, editReason } = req.body;
    const { userId } = (req as any).user;

    const shopResult = await ShopService.getShopByOwnerId(userId);
    if (!shopResult) throw new ApiError(404, 'Shop not found');

    const updated = await LedgerService.updateTransaction(id, shopResult.shopId, {
        amount,
        paymentType,
        notes,
        editReason,
        userId
    });

    res.json(updated);
}));

router.delete('/transaction/bulk', authMiddleware(['SHOPKEEPER']), verifyPinMiddleware, asyncHandler(async (req, res) => {
    const { userId } = (req as any).user;
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
        throw new ApiError(400, 'Invalid or empty IDs list');
    }

    const shopResult = await ShopService.getShopByOwnerId(userId);
    if (!shopResult) throw new ApiError(404, 'Shop not found');

    const result = await LedgerService.deleteTransactions(ids, shopResult.shopId, userId);
    res.json(result);
}));

router.delete('/transaction/:id', authMiddleware(['SHOPKEEPER']), verifyPinMiddleware, asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { userId } = (req as any).user;

    const shopResult = await ShopService.getShopByOwnerId(userId);
    if (!shopResult) throw new ApiError(404, 'Shop not found');

    const result = await LedgerService.deleteTransaction(id, shopResult.shopId, userId);
    res.json(result);
}));

// Export sales to Excel
router.get('/export/excel', authMiddleware(['SHOPKEEPER']), asyncHandler(async (req, res) => {
    const { userId } = (req as any).user;
    const paymentType = req.query.paymentType as string | undefined;
    const customerId = req.query.customerId as string | undefined;
    const startDate = req.query.startDate as string | undefined;
    const endDate = req.query.endDate as string | undefined;
    const minAmount = req.query.minAmount ? parseFloat(req.query.minAmount as string) : undefined;
    const maxAmount = req.query.maxAmount ? parseFloat(req.query.maxAmount as string) : undefined;
    const ids = req.query.ids ? (req.query.ids as string).split(',') : undefined;

    const shopResult = await ShopService.getShopByOwnerId(userId);
    if (!shopResult) throw new ApiError(404, 'Shop not found');

    const buffer = await LedgerService.exportSalesToExcel(shopResult.shopId, {
        paymentType,
        customerId,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        minAmount,
        maxAmount,
        ids
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=sales-export.xlsx');
    res.send(buffer);
}));

// Download Receipt PDF
router.get('/transaction/:id/receipt', authMiddleware(['SHOPKEEPER']), asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { userId } = (req as any).user;

    const shopResult = await ShopService.getShopByOwnerId(userId);
    if (!shopResult) throw new ApiError(404, 'Shop not found');

    const pdfBuffer = await LedgerService.generateTransactionReceipt(shopResult.shopId, id);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=receipt-${id}.pdf`);
    res.send(pdfBuffer);
}));

// Customer Routes
router.get('/shop/:shopId/balance', authMiddleware(['CUSTOMER']), asyncHandler(async (req, res) => {
    const { shopId } = req.params;
    const { userId } = (req as any).user;

    const balance = await LedgerService.getCustomerBalance(shopId, userId);
    res.json({ balance });
}));

export default router;
