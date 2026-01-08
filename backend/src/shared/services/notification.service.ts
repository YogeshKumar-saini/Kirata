
import { logger } from '../utils/logger';

export interface NotificationService {
    sendOTP(identifier: string, otp: string, type: 'SMS' | 'EMAIL'): Promise<void>;
}

// Console implementation (current behavior)
class ConsoleNotificationService implements NotificationService {
    async sendOTP(identifier: string, otp: string, type: 'SMS' | 'EMAIL'): Promise<void> {
        logger.info(`[${type}] OTP for ${identifier}: ${otp}`);
    }
}

// Future: SMS implementation (Twilio, etc.)
// class SMSNotificationService implements NotificationService {
//     async sendOTP(phone: string, otp: string): Promise<void> {
//         // await twilioClient.messages.create({ to: phone, body: `Your OTP is: ${otp}` });
//     }
// }

// Future: Email implementation (AWS SES, SendGrid, etc.)
// class EmailNotificationService implements NotificationService {
//     async sendOTP(email: string, otp: string): Promise<void> {
//         // await sesClient.sendEmail({ to: email, subject: 'Your OTP', body: `Your OTP is: ${otp}` });
//     }
// }

// Export singleton instance
export const notificationService: NotificationService = new ConsoleNotificationService();
