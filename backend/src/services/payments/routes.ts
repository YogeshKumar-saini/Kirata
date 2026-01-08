import { Router, Request, Response } from 'express';
import { authMiddleware } from '../../auth/middleware';
import { asyncHandler } from '../../shared/middlewares/asyncHandler';
import { paymentService } from './service';
import { ApiError } from '../../shared/errors/ApiError';

const router = Router();

// Create Payment Order
router.post('/create-order', authMiddleware(['CUSTOMER']), asyncHandler(async (req: any, res: Response) => {
    const { amount, shopId, orderId } = req.body;
    const { userId } = req.user;

    if (!amount || !shopId) {
        throw new ApiError(400, 'Amount and Shop ID are required');
    }

    const order = await paymentService.createOrder(amount, 'INR', {
        shopId,
        customerId: userId,
        orderId
    });

    res.json(order);
}));

// Verify Payment
router.post('/verify', authMiddleware(['CUSTOMER']), asyncHandler(async (req: any, res: Response) => {
    const {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        amount,
        shopId,
        orderId
    } = req.body;

    const { userId } = req.user;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
        throw new ApiError(400, 'Missing payment details');
    }

    const isValid = paymentService.verifySignature(
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature
    );

    if (!isValid) {
        throw new ApiError(400, 'Invalid payment signature');
    }

    const payment = await paymentService.processSuccessfulPayment({
        gatewayOrderId: razorpay_order_id,
        gatewayPaymentId: razorpay_payment_id,
        gatewaySignature: razorpay_signature,
        amount: parseFloat(amount),
        shopId,
        customerId: userId,
        orderId
    });

    res.json({ success: true, payment });
}));

export default router;
