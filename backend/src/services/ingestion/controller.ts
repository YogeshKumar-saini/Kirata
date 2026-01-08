import { Request, Response } from 'express';
import { prisma } from '../../shared/database';
import { logger } from '../../shared/utils/logger';
import { v4 as uuidv4 } from 'uuid';
import { routeMessage } from '../router';
import { config } from '../../shared/config';

export const handleWebhook = async (req: Request, res: Response) => {
    try {
        const body = req.body;
        logger.info('Webhook received', { body });

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
        const existing = await prisma.messageLog.findUnique({ where: { messageId } });
        if (existing) {
            logger.info(`Message ${messageId} already processed`);
            return res.status(200).send('Duplicate');
        }

        // Persist Raw Message
        await prisma.messageLog.create({
            data: {
                messageId,
                phone,
                rawMessage,
                processed: false,
            },
        });

        // Emit to Intent Router
        try {
            await routeMessage(messageId, phone, message.text?.body || '');
            await prisma.messageLog.update({ where: { messageId }, data: { processed: true } });
        } catch (routeError) {
            logger.error('Routing Failed', routeError);
        }

        return res.status(200).send('Received');
    } catch (error) {
        logger.error('Webhook Error', error);
        return res.status(500).send('Internal Error');
    }
};

export const verifyWebhook = (req: Request, res: Response) => {
    // Verification mode for WA
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode && token) {
        if (mode === 'subscribe' && token === config.webhookVerifyToken) {
            logger.info('WEBHOOK_VERIFIED');
            res.status(200).send(challenge);
        } else {
            res.sendStatus(403);
        }
    }
};
