
import { prisma } from '../../shared/database';
import { ApiError } from '../../shared/errors/ApiError';
import bcrypt from 'bcryptjs';

class ShopkeeperService {
    /**
     * Set or Update Transaction PIN
     */
    async setTransactionPin(shopkeeperId: string, pin: string) {
        if (!/^\d{4}$/.test(pin)) {
            throw new ApiError(400, 'PIN must be exactly 4 digits');
        }

        const hashedPin = await bcrypt.hash(pin, 10);

        await prisma.shopkeeper.update({
            where: { id: shopkeeperId },
            data: { transactionPin: hashedPin }
        });

        return { message: 'Transaction PIN updated successfully' };
    }

    /**
     * Verify Transaction PIN (Helper for other services if needed)
     */
    async verifyTransactionPin(shopkeeperId: string, pin: string): Promise<boolean> {
        const shopkeeper = await prisma.shopkeeper.findUnique({
            where: { id: shopkeeperId }
        });

        if (!shopkeeper || !shopkeeper.transactionPin) {
            return false;
        }

        return bcrypt.compare(pin, shopkeeper.transactionPin);
    }
}

export const shopkeeperService = new ShopkeeperService();
