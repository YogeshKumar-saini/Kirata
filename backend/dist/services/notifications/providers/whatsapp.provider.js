"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TwilioWhatsAppProvider = exports.MockWhatsAppProvider = void 0;
const logger_1 = require("../../../shared/utils/logger");
class MockWhatsAppProvider {
    async sendWhatsApp({ to, message }) {
        logger_1.logger.info(`[MOCK WHATSAPP] To: ${to} | Message: ${message}`);
        return true;
    }
}
exports.MockWhatsAppProvider = MockWhatsAppProvider;
class TwilioWhatsAppProvider {
    constructor(accountSid, authToken, fromNumber) {
        this.fromNumber = fromNumber;
        const twilio = require('twilio');
        this.client = twilio(accountSid, authToken);
    }
    async sendWhatsApp({ to, message }) {
        try {
            // Ensure numbers have whatsapp: prefix
            const formattedFrom = this.fromNumber.startsWith('whatsapp:') ? this.fromNumber : `whatsapp:${this.fromNumber}`;
            const formattedTo = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`;
            await this.client.messages.create({
                body: message,
                from: formattedFrom,
                to: formattedTo
            });
            logger_1.logger.info(`[TWILIO WHATSAPP] Sent to ${to}`);
            return true;
        }
        catch (error) {
            logger_1.logger.error(`[TWILIO WHATSAPP] Failed to send to ${to}:`, error);
            throw error;
        }
    }
}
exports.TwilioWhatsAppProvider = TwilioWhatsAppProvider;
