
import { Router } from 'express';
import { authMiddleware } from '../../auth/middleware';
import * as CustomerController from './controller';

const router = Router();

// Protect all routes with Customer role
router.use(authMiddleware(['CUSTOMER']));

router.get('/dashboard', CustomerController.getDashboard);
router.get('/shops', CustomerController.getShops);
router.get('/shops/:shopId/ledger', CustomerController.getShopLedger);
router.get('/orders', CustomerController.getOrders);
router.get('/analytics', CustomerController.getAnalytics);
router.get('/transactions', CustomerController.getTransactions);
router.get('/transactions/:transactionId/receipt', CustomerController.getTransactionReceipt);
router.get('/shops/:shopId/export', CustomerController.exportShopLedger);
router.post('/shops/:shopId/pay/upi', CustomerController.getUpiIntent);
router.post('/shops/:shopId/payments', CustomerController.recordPayment);
router.post('/shops/:shopId/reviews', CustomerController.createReview);
router.patch('/profile', CustomerController.updateProfile);

export default router;
