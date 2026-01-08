"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const middleware_1 = require("../../auth/middleware");
const asyncHandler_1 = require("../../shared/middlewares/asyncHandler");
const service_1 = require("./service");
const ApiError_1 = require("../../shared/errors/ApiError");
const router = (0, express_1.Router)();
// Create Payment Order
router.post('/create-order', (0, middleware_1.authMiddleware)(['CUSTOMER']), (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { amount, shopId, orderId } = req.body;
    const { userId } = req.user;
    if (!amount || !shopId) {
        throw new ApiError_1.ApiError(400, 'Amount and Shop ID are required');
    }
    const order = await service_1.paymentService.createOrder(amount, 'INR', {
        shopId,
        customerId: userId,
        orderId
    });
    res.json(order);
}));
// Verify Payment
router.post('/verify', (0, middleware_1.authMiddleware)(['CUSTOMER']), (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, amount, shopId, orderId } = req.body;
    const { userId } = req.user;
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
        throw new ApiError_1.ApiError(400, 'Missing payment details');
    }
    const isValid = service_1.paymentService.verifySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature);
    if (!isValid) {
        throw new ApiError_1.ApiError(400, 'Invalid payment signature');
    }
    const payment = await service_1.paymentService.processSuccessfulPayment({
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
exports.default = router;
