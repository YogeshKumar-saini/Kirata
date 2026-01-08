"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TwilioSMSProvider = exports.MockSMSProvider = void 0;
const logger_1 = require("../../../shared/utils/logger");
class MockSMSProvider {
    async sendSMS({ to, message }) {
        logger_1.logger.info(`[MOCK SMS] To: ${to} | Message: ${message}`);
        return true;
    }
}
exports.MockSMSProvider = MockSMSProvider;
class TwilioSMSProvider {
    constructor(accountSid, authToken, fromNumber) {
        this.fromNumber = fromNumber;
        // Dynamic import or require to avoid issues if dependency is missing during build (though I installed it)
        const twilio = require('twilio');
        this.client = twilio(accountSid, authToken);
    }
    async sendSMS({ to, message }) {
        try {
            await this.client.messages.create({
                body: message,
                from: this.fromNumber,
                to: to
            });
            logger_1.logger.info(`[TWILIO SMS] Sent to ${to}`);
            return true;
        }
        catch (error) {
            logger_1.logger.error(`[TWILIO SMS] Failed to send to ${to}:`, error);
            throw error;
        }
    }
}
exports.TwilioSMSProvider = TwilioSMSProvider;
