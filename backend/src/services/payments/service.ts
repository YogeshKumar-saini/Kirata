import Razorpay from 'razorpay';
import crypto from 'crypto';
import { prisma } from '../../shared/database';
import { ApiError } from '../../shared/errors/ApiError';
import { logger } from '../../shared/utils/logger';

class PaymentService {
    private razorpay: any;

    constructor() {
        const key_id = process.env.RAZORPAY_KEY_ID;
        const key_secret = process.env.RAZORPAY_KEY_SECRET;

        if (key_id && key_secret) {
            this.razorpay = new Razorpay({ key_id, key_secret });
        } else {
            logger.warn('Razorpay credentials missing');
        }
    }

    async createOrder(amount: number, currency = 'INR', notes: any = {}) {
        if (!this.razorpay) throw new ApiError(500, 'Payment gateway not configured');

        const options = {
            amount: Math.round(amount * 100), // paise
            currency,
            receipt: `rcpt_${Date.now()}`,
            notes
        };

        try {
            const order = await this.razorpay.orders.create(options);
            return order;
        } catch (error) {
            logger.error('Razorpay create order failed', error);
            throw new ApiError(502, 'Failed to create payment order');
        }
    }

    verifySignature(orderId: string, paymentId: string, signature: string) {
        if (!process.env.RAZORPAY_KEY_SECRET) return false;

        const body = orderId + "|" + paymentId;
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest('hex');

        return expectedSignature === signature;
    }

    async processSuccessfulPayment(data: {
        gatewayOrderId: string;
        gatewayPaymentId: string;
        gatewaySignature: string;
        amount: number;
        shopId: string;
        customerId: string;
        orderId?: string;
    }) {
        // Check if payment already exists
        const existing = await prisma.payment.findUnique({
            where: { gatewayOrderId: data.gatewayOrderId }
        });

        if (existing) return existing;

        return prisma.$transaction(async (tx) => {
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
                const LedgerService = await import('../ledger/service');
                await LedgerService.recordPayment(
                    data.shopId,
                    data.customerId,
                    data.amount,
                    'UPI',
                    `Online Payment ${data.gatewayPaymentId}` // Notes
                    // Transaction pass-through? No, recordPayment handles it.
                );
            } else {
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

export const paymentService = new PaymentService();
