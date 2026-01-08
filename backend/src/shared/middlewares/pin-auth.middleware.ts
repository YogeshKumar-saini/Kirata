
import { Request, Response, NextFunction } from 'express';
import { prisma } from '../database';
import { ApiError } from '../errors/ApiError';
import bcrypt from 'bcryptjs';

declare global {
    namespace Express {
        interface Request {
            shopkeeper?: any;
            user?: any;
        }
    }
}

export const verifyPinMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const pin = req.headers['x-transaction-pin'] as string;
        const shopkeeperId = req.user?.userId; // Assumes authMiddleware has run

        if (!shopkeeperId) {
            throw new ApiError(401, 'User not authenticated');
        }

        if (!pin) {
            throw new ApiError(400, 'Transaction PIN is required');
        }

        const shopkeeper = await prisma.shopkeeper.findUnique({
            where: { id: shopkeeperId }
        });

        if (!shopkeeper || !shopkeeper.transactionPin) {
            // If no PIN set, maybe allow default or block
            // For now, let's treat unset PIN as strictly blocking -> they must set it first
            // But for Phase 7 initial rollout, we might want to check against "1234" if null?
            // Plan says: "Initial Setup: The PIN will default to 1234 for existing users"
            // Let's implement that logic here or in a migration.
            // Better: If null, check against default "1234" hash? 
            // Or simpler: strictly require it. 
            // Let's go with strict check against DB value. If null, fail.
            throw new ApiError(403, 'Transaction PIN not set. Please set up your security PIN.');
        }

        const isValid = await bcrypt.compare(pin, shopkeeper.transactionPin);

        if (!isValid) {
            throw new ApiError(403, 'Invalid Transaction PIN');
        }

        next();
    } catch (error) {
        next(error);
    }
};
