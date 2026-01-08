"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationService = void 0;
const logger_1 = require("../utils/logger");
// Console implementation (current behavior)
class ConsoleNotificationService {
    async sendOTP(identifier, otp, type) {
        logger_1.logger.info(`[${type}] OTP for ${identifier}: ${otp}`);
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
exports.notificationService = new ConsoleNotificationService();
