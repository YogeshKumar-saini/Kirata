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
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationService = void 0;
const database_1 = require("../../shared/database");
const logger_1 = require("../../shared/utils/logger");
const sms_provider_1 = require("./providers/sms.provider");
const whatsapp_provider_1 = require("./providers/whatsapp.provider");
class NotificationService {
    constructor() {
        const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER, TWILIO_WHATSAPP_NUMBER } = process.env;
        if (TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN && TWILIO_PHONE_NUMBER) {
            this.smsProvider = new sms_provider_1.TwilioSMSProvider(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER);
            logger_1.logger.info('NotificationService: Using Twilio SMS Provider');
        }
        else {
            this.smsProvider = new sms_provider_1.MockSMSProvider();
            logger_1.logger.info('NotificationService: Using Mock SMS Provider');
        }
        if (TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN && TWILIO_WHATSAPP_NUMBER) {
            this.whatsappProvider = new whatsapp_provider_1.TwilioWhatsAppProvider(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_WHATSAPP_NUMBER);
            logger_1.logger.info('NotificationService: Using Twilio WhatsApp Provider');
        }
        else {
            this.whatsappProvider = new whatsapp_provider_1.MockWhatsAppProvider();
            logger_1.logger.info('NotificationService: Using Mock WhatsApp Provider');
        }
    }
    /**
     * Send a payment reminder to a customer
     */
    async sendPaymentReminder(shopId, customerId, amount, channel = 'SMS') {
        const customer = await database_1.prisma.customer.findUnique({
            where: { id: customerId }
        });
        if (!customer) {
            throw new Error('Customer not found');
        }
        const message = `Dear ${customer.name || 'Customer'}, a gentle reminder to pay your outstanding due of ₹${amount}. Thank you!`;
        let sent = false;
        let usedChannel = channel;
        // Try WhatsApp first if requested or as fallback logic
        if (channel === 'WHATSAPP' && customer.phone) {
            try {
                await this.whatsappProvider.sendWhatsApp({ to: customer.phone, message });
                sent = true;
                logger_1.logger.info(`Sent WhatsApp reminder to ${customer.phone}`);
            }
            catch (error) {
                logger_1.logger.warn(`Failed to send WhatsApp to ${customer.phone}, falling back to SMS`);
                usedChannel = 'SMS';
            }
        }
        // Send SMS if channel is SMS or WhatsApp failed
        if (!sent && usedChannel === 'SMS' && customer.phone) {
            try {
                await this.smsProvider.sendSMS({ to: customer.phone, message });
                logger_1.logger.info(`Sent SMS reminder to ${customer.phone}`);
                sent = true;
            }
            catch (error) {
                logger_1.logger.error(`Failed to send SMS to ${customer.phone}`, error);
            }
        }
        // Record notification in database
        await database_1.prisma.notification.create({
            data: {
                shopId,
                customerId,
                type: 'PAYMENT_REMINDER',
                channel: sent ? usedChannel : 'SMS', // Default to SMS on failure record
                status: sent ? 'SENT' : 'FAILED',
                title: 'Payment Reminder',
                message,
                metadata: { amount },
                sentAt: sent ? new Date() : null
            }
        });
        return sent;
    }
    /**
     * Send bulk payment reminders
     */
    async sendBulkPaymentReminders(shopId, customerIds) {
        const customers = await database_1.prisma.customer.findMany({
            where: {
                id: { in: customerIds },
                orders: { some: { shopId } } // Validate customer has interaction with shop
            }
        });
        const results = {
            success: 0,
            failed: 0,
            total: customers.length
        };
        const LedgerService = await Promise.resolve().then(() => __importStar(require('../ledger/service')));
        for (const customer of customers) {
            try {
                // Get current balance
                const balance = await LedgerService.getCustomerBalance(shopId, customer.id);
                if (balance > 0) {
                    const sent = await this.sendPaymentReminder(shopId, customer.id, balance);
                    if (sent)
                        results.success++;
                    else
                        results.failed++;
                }
                else {
                    // Skip customers with no due
                    results.failed++; // Technically not a failure but didn't send
                }
            }
            catch (error) {
                logger_1.logger.error(`Failed to send bulk reminder to ${customer.id}`, error);
                results.failed++;
            }
        }
        return results;
    }
    /**
     * Get notification history
     */
    async getNotificationHistory(shopId, limit = 50, offset = 0) {
        const notifications = await database_1.prisma.notification.findMany({
            where: { shopId },
            include: {
                customer: {
                    select: { name: true, phone: true }
                }
            },
            orderBy: { createdAt: 'desc' },
            take: limit,
            skip: offset
        });
        const total = await database_1.prisma.notification.count({ where: { shopId } });
        return {
            notifications,
            total,
            limit,
            offset
        };
    }
    /**
     * Send OTP via SMS or Email
     * @param identifier - Phone number or email address
     * @param otp - The OTP code to send
     * @param type - 'SMS' or 'EMAIL'
     */
    async sendOTP(identifier, otp, type) {
        const message = `Your OTP code is: ${otp}. This code will expire in 10 minutes. Do not share this code with anyone.`;
        if (type === 'SMS') {
            try {
                await this.smsProvider.sendSMS({ to: identifier, message });
                logger_1.logger.info(`[OTP] Sent SMS OTP to ${identifier}`);
            }
            catch (error) {
                logger_1.logger.error(`[OTP] Failed to send SMS OTP to ${identifier}:`, error);
                // Don't throw - allow user to continue and get OTP from database
                logger_1.logger.warn(`[OTP] SMS delivery failed, but OTP is saved in database for testing`);
            }
        }
        else if (type === 'EMAIL') {
            try {
                // Import email service dynamically to avoid circular dependencies
                const { emailService } = await Promise.resolve().then(() => __importStar(require('../email/service')));
                await emailService.sendOTP(identifier, otp);
                logger_1.logger.info(`[OTP] Sent Email OTP to ${identifier}`);
            }
            catch (error) {
                logger_1.logger.error(`[OTP] Failed to send Email OTP to ${identifier}:`, error);
                throw error;
            }
        }
        else {
            throw new Error(`Invalid OTP type: ${type}`);
        }
    }
}
exports.notificationService = new NotificationService();
