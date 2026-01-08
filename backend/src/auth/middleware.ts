import { Request, Response, NextFunction } from 'express';
import { verifyToken } from './utils';
import { asyncHandler } from '../shared/middlewares/asyncHandler';
import { ApiError } from '../shared/errors/ApiError';
import * as AuthService from './service';

export const authMiddleware = (roles: string[] = []) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ error: 'No token provided' });
        }

        const token = authHeader.split(' ')[1];
        try {
            const decoded = verifyToken(token);
            (req as any).user = decoded;

            if (roles.length > 0 && !roles.includes(decoded.role)) {
                return res.status(403).json({ error: 'Insufficient permissions' });
            }

            next();
        } catch (error: any) {
            return res.status(401).json({ error: 'Invalid token' });
        }
    };
};

// WhatsApp Webhook Signature Verification (Placeholder)
export const verifyWebhookSignature = (req: Request, res: Response, next: NextFunction) => {
    // In production, verify X-Hub-Signature-256
    // const signature = req.headers['x-hub-signature-256'];
    // ... validation logic ...
    next();
};

export const pinMiddleware = asyncHandler(async (req: any, res: Response, next: NextFunction) => {
    const pin = req.headers['x-transaction-pin'] as string;
    const user = req.user;

    if (!user) throw new ApiError(401, "User not authenticated");

    // Only enforce for Shopkeepers for now
    if (user.role === 'SHOPKEEPER') {
        if (!pin) throw new ApiError(403, "Transaction PIN required");

        const isValid = await AuthService.verifyTransactionPin(user.userId, user.role, pin);
        if (!isValid) throw new ApiError(403, "Invalid Transaction PIN");
    }

    next();
});
