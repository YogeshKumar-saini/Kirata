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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentService = void 0;
const razorpay_1 = __importDefault(require("razorpay"));
const crypto_1 = __importDefault(require("crypto"));
const database_1 = require("../../shared/database");
const ApiError_1 = require("../../shared/errors/ApiError");
const logger_1 = require("../../shared/utils/logger");
class PaymentService {
    constructor() {
        const key_id = process.env.RAZORPAY_KEY_ID;
        const key_secret = process.env.RAZORPAY_KEY_SECRET;
        if (key_id && key_secret) {
            this.razorpay = new razorpay_1.default({ key_id, key_secret });
        }
        else {
            logger_1.logger.warn('Razorpay credentials missing');
        }
    }
    async createOrder(amount, currency = 'INR', notes = {}) {
        if (!this.razorpay)
            throw new ApiError_1.ApiError(500, 'Payment gateway not configured');
        const options = {
            amount: Math.round(amount * 100), // paise
            currency,
            receipt: `rcpt_${Date.now()}`,
            notes
        };
        try {
            const order = await this.razorpay.orders.create(options);
            return order;
        }
        catch (error) {
            logger_1.logger.error('Razorpay create order failed', error);
            throw new ApiError_1.ApiError(502, 'Failed to create payment order');
        }
    }
    verifySignature(orderId, paymentId, signature) {
        if (!process.env.RAZORPAY_KEY_SECRET)
            return false;
        const body = orderId + "|" + paymentId;
        const expectedSignature = crypto_1.default
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest('hex');
        return expectedSignature === signature;
    }
    async processSuccessfulPayment(data) {
        // Check if payment already exists
        const existing = await database_1.prisma.payment.findUnique({
            where: { gatewayOrderId: data.gatewayOrderId }
        });
        if (existing)
            return existing;
        return database_1.prisma.$transaction(async (tx) => {
            // Create Payment Record
            const payment = await tx.payment.create({
                data: {
                    shopId: data.shopId,
                    customerId: data.customerId,
                    orderId: data.orderId,
                    amount: data.amount,
                    gatewayOrderId: data.gatewayOrderId,
                    gatewayPaymentId: data.gatewayPaymentId,
                    gatewaySignature: data.gatewaySignature,
                    status: 'SUCCESS',
                    method: 'UPI' // Generic for now, could get from Razorpay details
                }
            });
            // If it's a generic payment (not linked to specific order), record as Udhaar payment
            if (!data.orderId) {
                const LedgerService = await Promise.resolve().then(() => __importStar(require('../ledger/service')));
                await LedgerService.recordPayment(data.shopId, data.customerId, data.amount, 'UPI', `Online Payment ${data.gatewayPaymentId}` // Notes
                // Transaction pass-through? No, recordPayment handles it.
                );
            }
            else {
                // If it IS linked to an order, we might want to update the order Payment Preference to UPI 
                // and potentially mark something? For now, we just record the payment link.
                // The actual "Sale" is recorded when order is COLLECTED. 
                // But we should prevent "Cash" collection if already paid.
                // We'll leave that logic for order status update.
            }
            return payment;
        });
    }
}
exports.paymentService = new PaymentService();
