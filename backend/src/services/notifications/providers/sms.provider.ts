import { logger } from '../../../shared/utils/logger';

export interface SMSProvider {
    sendSMS(param: { to: string; message: string }): Promise<boolean>;
}

export class MockSMSProvider implements SMSProvider {
    async sendSMS({ to, message }: { to: string; message: string }): Promise<boolean> {
        logger.info(`[MOCK SMS] To: ${to} | Message: ${message}`);
        return true;
    }
}

export class TwilioSMSProvider implements SMSProvider {
    private client: any;

    constructor(accountSid: string, authToken: string, private fromNumber: string) {
        // Dynamic import or require to avoid issues if dependency is missing during build (though I installed it)
        const twilio = require('twilio');
        this.client = twilio(accountSid, authToken);
    }

    async sendSMS({ to, message }: { to: string; message: string }): Promise<boolean> {
        try {
            await this.client.messages.create({
                body: message,
                from: this.fromNumber,
                to: to
            });
            logger.info(`[TWILIO SMS] Sent to ${to}`);
            return true;
        } catch (error) {
            logger.error(`[TWILIO SMS] Failed to send to ${to}:`, error);
            throw error;
        }
    }
}
