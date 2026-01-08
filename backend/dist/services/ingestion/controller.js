"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyWebhook = exports.handleWebhook = void 0;
const database_1 = require("../../shared/database");
const logger_1 = require("../../shared/utils/logger");
const router_1 = require("../router");
const config_1 = require("../../shared/config");
const handleWebhook = async (req, res) => {
    try {
        const body = req.body;
        logger_1.logger.info('Webhook received', { body });
        // Deduplication check (if message_id exists)
        // Simplified assumption: WA payload structure
        const entry = body.entry?.[0];
        const changes = entry?.changes?.[0];
        const value = changes?.value;
        const message = value?.messages?.[0];
        if (!message) {
            return res.status(200).send('No message found');
        }
        const messageId = message.id;
        const phone = message.from;
        const rawMessage = JSON.stringify(body);
        // Idempotency: Check if message exists
        const existing = await database_1.prisma.messageLog.findUnique({ where: { messageId } });
        if (existing) {
            logger_1.logger.info(`Message ${messageId} already processed`);
            return res.status(200).send('Duplicate');
        }
        // Persist Raw Message
        await database_1.prisma.messageLog.create({
            data: {
                messageId,
                phone,
                rawMessage,
                processed: false,
            },
        });
        // Emit to Intent Router
        try {
            await (0, router_1.routeMessage)(messageId, phone, message.text?.body || '');
            await database_1.prisma.messageLog.update({ where: { messageId }, data: { processed: true } });
        }
        catch (routeError) {
            logger_1.logger.error('Routing Failed', routeError);
        }
        return res.status(200).send('Received');
    }
    catch (error) {
        logger_1.logger.error('Webhook Error', error);
        return res.status(500).send('Internal Error');
    }
};
exports.handleWebhook = handleWebhook;
const verifyWebhook = (req, res) => {
    // Verification mode for WA
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];
    if (mode && token) {
        if (mode === 'subscribe' && token === config_1.config.webhookVerifyToken) {
            logger_1.logger.info('WEBHOOK_VERIFIED');
            res.status(200).send(challenge);
        }
        else {
            res.sendStatus(403);
        }
    }
};
exports.verifyWebhook = verifyWebhook;
