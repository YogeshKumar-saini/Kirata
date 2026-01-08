import { IntentStrategy } from './IntentStrategy';
import * as LedgerService from '../../ledger/service';
import * as ShopService from '../../shops/service';
import { logger } from '../../../shared/utils/logger';

export class SaleStrategy implements IntentStrategy {
    canHandle(text: string, user: any): boolean {
        return user.role === 'SHOPKEEPER' && text.toLowerCase().startsWith('sale');
    }

    async execute(text: string, user: any): Promise<void> {
        const parts = text.split(' ');
        const amount = parseFloat(parts[1]);

        if (isNaN(amount)) {
            logger.warn('Invalid sale amount', { text });
            return;
        }

        // Ideally fetch shop by user.id/phone
        const shop = await ShopService.getShopByOwner(user.phone);
        if (!shop) {
            logger.warn('Shopkeeper has no shop', { phone: user.phone });
            return;
        }

        await LedgerService.recordSale(shop.shopId, amount, 'CASH', 'MANUAL');
        logger.info(`Recorded sale of ${amount} for shop ${shop.shopId}`);
    }
}

export class UdhaarStrategy implements IntentStrategy {
    canHandle(text: string, user: any): boolean {
        const lower = text.toLowerCase();
        return user.role === 'SHOPKEEPER' && (lower.startsWith('udhaar') || lower.startsWith('credit'));
    }

    async execute(text: string, user: any): Promise<void> {
        const parts = text.split(' ');
        const amount = parseFloat(parts[1]);
        const customerName = parts.slice(2).join(' ');

        if (isNaN(amount) || !customerName) {
            logger.warn('Invalid udhaar format', { text });
            return;
        }

        const shop = await ShopService.getShopByOwner(user.phone);
        if (!shop) return;

        logger.info(`Processing Udhaar for ${customerName} amount ${amount}`);
        // Placeholder: Logic to find customer and record udhaar would go here
    }
}
