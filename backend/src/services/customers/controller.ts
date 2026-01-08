
import { Request, Response } from 'express';
import { asyncHandler } from '../../shared/middlewares/asyncHandler';
import * as CustomerService from './service';

export const getDashboard = asyncHandler(async (req: Request, res: Response) => {
    const { userId } = (req as any).user;
    const stats = await CustomerService.getCustomerDashboardStats(userId);
    res.json(stats);
});

export const getShops = asyncHandler(async (req: Request, res: Response) => {
    const { userId } = (req as any).user;
    const shops = await CustomerService.getCustomerShops(userId);
    res.json(shops);
});

export const getShopLedger = asyncHandler(async (req: Request, res: Response) => {
    const { userId } = (req as any).user;
    const { shopId } = req.params;
    const ledger = await CustomerService.getCustomerShopLedger(userId, shopId);
    res.json(ledger);
});

export const getOrders = asyncHandler(async (req: Request, res: Response) => {
    const { userId } = (req as any).user;
    const orders = await CustomerService.getCustomerOrders(userId);
    res.json(orders);
});

export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
    const { userId } = (req as any).user;
    const updatedCustomer = await CustomerService.updateCustomerProfile(userId, req.body);
    res.json(updatedCustomer);
});
// ... existing methods
export const getAnalytics = asyncHandler(async (req: Request, res: Response) => {
    const { userId } = (req as any).user;
    const data = await CustomerService.getCustomerAnalytics(userId);
    res.json(data);
});

export const getTransactions = asyncHandler(async (req: Request, res: Response) => {
    const { userId } = (req as any).user;
    const { shopId, paymentType, startDate, endDate, limit } = req.query;
    const transactions = await CustomerService.getCustomerTransactions(userId, {
        shopId: shopId as string,
        paymentType: paymentType as string,
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
        limit: limit ? parseInt(limit as string) : 50
    });
    res.json(transactions);
});

export const getTransactionReceipt = asyncHandler(async (req: Request, res: Response) => {
    const { userId } = (req as any).user;
    const { transactionId } = req.params;

    const pdfBuffer = await CustomerService.getCustomerTransactionReceipt(userId, transactionId);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=receipt-${transactionId}.pdf`);
    res.send(pdfBuffer);
});

export const exportShopLedger = asyncHandler(async (req: Request, res: Response) => {
    const { userId } = (req as any).user;
    const { shopId } = req.params;
    const { format } = req.query;

    const data = await CustomerService.exportCustomerLedger(userId, shopId, format as string);

    if (format === 'csv') {
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=ledger-${shopId}.csv`);
        return res.send(data);
    }

    res.json(data);
});

export const getUpiIntent = asyncHandler(async (req: Request, res: Response) => {
    const { shopId } = req.params;
    const { amount } = req.body;

    if (!amount || isNaN(amount) || amount <= 0) {
        throw new Error('Invalid amount');
    }

    const data = await CustomerService.generateUpiIntent(shopId, amount);
    res.json(data);
});

export const recordPayment = asyncHandler(async (req: Request, res: Response) => {
    const { userId } = (req as any).user;
    const { shopId } = req.params;
    const { amount, paymentMethod, notes } = req.body;

    if (!amount || isNaN(amount) || amount <= 0) {
        throw new Error('Invalid amount');
    }

    const result = await CustomerService.recordCustomerPayment(userId, shopId, amount, paymentMethod, notes);
    res.json(result);
});

export const createReview = asyncHandler(async (req: Request, res: Response) => {
    const { userId } = (req as any).user;
    const { shopId } = req.params;
    const { rating, comment } = req.body;

    if (!rating || rating < 1 || rating > 5) {
        throw new Error('Rating must be between 1 and 5');
    }

    const review = await CustomerService.createShopReview(userId, shopId, rating, comment);
    res.json(review);
});
