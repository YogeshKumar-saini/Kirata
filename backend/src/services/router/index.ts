import { logger } from '../../shared/utils/logger';
import { prisma } from '../../shared/database';
import * as ShopService from '../shops/service';
import { strategies } from './strategies';

export const routeMessage = async (messageId: string, phone: string, text: string) => {
    logger.info(`Routing message ${messageId}: ${text}`);

    try {
        // 1. Identify User Context
        // Try Shopkeeper
        let user: any = await prisma.shopkeeper.findUnique({ where: { phone } });
        let role = 'SHOPKEEPER';

        if (!user) {
            // Try Customer
            user = await prisma.customer.findUnique({ where: { phone } });
            role = 'CUSTOMER';

            if (!user) {
                // New Customer Registration Flow could be a strategy too, 
                // but for now let's auto-create as per original logic if it was a customer flow.
                // Or better, let strategies decide. 
                // But strategies need a user object.
                // Let's keep the auto-create logic here for now to maintain behavior.
                user = await ShopService.findOrCreateCustomer(phone);
                role = 'CUSTOMER';
            }
        }

        // Attach role to user object for strategies
        user.role = role;

        // 2. Find and Execute Strategy
        for (const strategy of strategies) {
            if (strategy.canHandle(text, user)) {
                await strategy.execute(text, user);
                return;
            }
        }

        logger.info(`No strategy found for message: ${text}`);

    } catch (err) {
        logger.error('Routing Error', err);
    }
};
