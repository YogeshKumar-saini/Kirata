import { Request, Response, NextFunction } from 'express';
import { prisma } from '../database';
import { ApiError } from '../errors/ApiError';
import { ShopRole } from '@prisma/client';

export const requireRole = (...allowedRoles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const user = (req as any).user;
        if (!user || !allowedRoles.includes(user.role)) {
            return next(new ApiError(403, 'Insufficient permissions'));
        }
        next();
    };
};

export const requireShopRole = (allowedRoles: ShopRole[]) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = (req as any).user.userId;
            const shopId = req.params.shopId || req.body.shopId || req.query.shopId;

            if (!shopId) {
                // If no shopId is explicit, we might be in a route that infers it.
                // For now, fail safe.
                return next(new ApiError(400, 'Shop ID context required for permission check'));
            }

            // 1. Check Owner (Always allowed)
            const shop = await prisma.shop.findUnique({
                where: { shopId },
                select: { ownerId: true }
            });

            if (!shop) {
                return next(new ApiError(404, 'Shop not found'));
            }

            if (shop.ownerId === userId) {
                return next();
            }

            // 2. Check Staff Role
            const staffRecord = await prisma.shopStaff.findUnique({
                where: {
                    shopId_userId: {
                        shopId,
                        userId
                    }
                }
            });

            if (!staffRecord || !staffRecord.isActive) {
                return next(new ApiError(403, 'You do not have access to this shop'));
            }

            if (!allowedRoles.includes(staffRecord.role)) {
                return next(new ApiError(403, 'Insufficient permissions'));
            }

            next();
        } catch (error) {
            next(error);
        }
    };
};
