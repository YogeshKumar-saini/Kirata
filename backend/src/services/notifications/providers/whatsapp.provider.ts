import { logger } from '../../../shared/utils/logger';

export interface WhatsAppProvider {
    sendWhatsApp(param: { to: string; message: string }): Promise<boolean>;
}

export class MockWhatsAppProvider implements WhatsAppProvider {
    async sendWhatsApp({ to, message }: { to: string; message: string }): Promise<boolean> {
        logger.info(`[MOCK WHATSAPP] To: ${to} | Message: ${message}`);
        return true;
    }
}

export class TwilioWhatsAppProvider implements WhatsAppProvider {
    private client: any;

    constructor(accountSid: string, authToken: string, private fromNumber: string) {
        const twilio = require('twilio');
        this.client = twilio(accountSid, authToken);
    }

    async sendWhatsApp({ to, message }: { to: string; message: string }): Promise<boolean> {
        try {
            // Ensure numbers have whatsapp: prefix
            const formattedFrom = this.fromNumber.startsWith('whatsapp:') ? this.fromNumber : `whatsapp:${this.fromNumber}`;
            const formattedTo = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`;

            await this.client.messages.create({
                body: message,
                from: formattedFrom,
                to: formattedTo
            });
            logger.info(`[TWILIO WHATSAPP] Sent to ${to}`);
            return true;
        } catch (error) {
            logger.error(`[TWILIO WHATSAPP] Failed to send to ${to}:`, error);
            throw error;
        }
    }
}
