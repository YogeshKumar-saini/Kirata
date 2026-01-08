import { prisma } from '../../shared/database';
import { logger } from '../../shared/utils/logger';
import { MockSMSProvider, SMSProvider, TwilioSMSProvider } from './providers/sms.provider';
import { MockWhatsAppProvider, WhatsAppProvider, TwilioWhatsAppProvider } from './providers/whatsapp.provider';

class NotificationService {
    private smsProvider: SMSProvider;
    private whatsappProvider: WhatsAppProvider;

    constructor() {
        const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER, TWILIO_WHATSAPP_NUMBER } = process.env;

        if (TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN && TWILIO_PHONE_NUMBER) {
            this.smsProvider = new TwilioSMSProvider(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER);
            logger.info('NotificationService: Using Twilio SMS Provider');
        } else {
            this.smsProvider = new MockSMSProvider();
            logger.info('NotificationService: Using Mock SMS Provider');
        }

        if (TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN && TWILIO_WHATSAPP_NUMBER) {
            this.whatsappProvider = new TwilioWhatsAppProvider(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_WHATSAPP_NUMBER);
            logger.info('NotificationService: Using Twilio WhatsApp Provider');
        } else {
            this.whatsappProvider = new MockWhatsAppProvider();
            logger.info('NotificationService: Using Mock WhatsApp Provider');
        }
    }

    /**
     * Send a payment reminder to a customer
     */
    async sendPaymentReminder(
        shopId: string,
        customerId: string,
        amount: number,
        channel: 'SMS' | 'WHATSAPP' = 'SMS'
    ) {
        const customer = await prisma.customer.findUnique({
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
                logger.info(`Sent WhatsApp reminder to ${customer.phone}`);
            } catch (error) {
                logger.warn(`Failed to send WhatsApp to ${customer.phone}, falling back to SMS`);
                usedChannel = 'SMS';
            }
        }

        // Send SMS if channel is SMS or WhatsApp failed
        if (!sent && usedChannel === 'SMS' && customer.phone) {
            try {
                await this.smsProvider.sendSMS({ to: customer.phone, message });
                logger.info(`Sent SMS reminder to ${customer.phone}`);
                sent = true;
            } catch (error) {
                logger.error(`Failed to send SMS to ${customer.phone}`, error);
            }
        }

        // Record notification in database
        await prisma.notification.create({
            data: {
                shopId,
                customerId,
                type: 'PAYMENT_REMINDER',
                channel: sent ? (usedChannel as any) : 'SMS', // Default to SMS on failure record
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
    async sendBulkPaymentReminders(shopId: string, customerIds: string[]) {
        const customers = await prisma.customer.findMany({
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

        const LedgerService = await import('../ledger/service');

        for (const customer of customers) {
            try {
                // Get current balance
                const balance = await LedgerService.getCustomerBalance(shopId, customer.id);

                if (balance > 0) {
                    const sent = await this.sendPaymentReminder(shopId, customer.id, balance);
                    if (sent) results.success++;
                    else results.failed++;
                } else {
                    // Skip customers with no due
                    results.failed++; // Technically not a failure but didn't send
                }
            } catch (error) {
                logger.error(`Failed to send bulk reminder to ${customer.id}`, error);
                results.failed++;
            }
        }

        return results;
    }

    /**
     * Get notification history
     */
    async getNotificationHistory(shopId: string, limit = 50, offset = 0) {
        const notifications = await prisma.notification.findMany({
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

        const total = await prisma.notification.count({ where: { shopId } });

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
    async sendOTP(identifier: string, otp: string, type: 'SMS' | 'EMAIL'): Promise<void> {
        const message = `Your OTP code is: ${otp}. This code will expire in 10 minutes. Do not share this code with anyone.`;

        if (type === 'SMS') {
            try {
                await this.smsProvider.sendSMS({ to: identifier, message });
                logger.info(`[OTP] Sent SMS OTP to ${identifier}`);
            } catch (error) {
                logger.error(`[OTP] Failed to send SMS OTP to ${identifier}:`, error);
                // Don't throw - allow user to continue and get OTP from database
                logger.warn(`[OTP] SMS delivery failed, but OTP is saved in database for testing`);
            }
        } else if (type === 'EMAIL') {
            try {
                // Import email service dynamically to avoid circular dependencies
                const { emailService } = await import('../email/service');
                await emailService.sendOTP(identifier, otp);
                logger.info(`[OTP] Sent Email OTP to ${identifier}`);
            } catch (error) {
                logger.error(`[OTP] Failed to send Email OTP to ${identifier}:`, error);
                throw error;
            }
        } else {
            throw new Error(`Invalid OTP type: ${type}`);
        }
    }
}

export const notificationService = new NotificationService();
