"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireShopRole = exports.requireRole = void 0;
const database_1 = require("../database");
const ApiError_1 = require("../errors/ApiError");
const requireRole = (...allowedRoles) => {
    return (req, res, next) => {
        const user = req.user;
        if (!user || !allowedRoles.includes(user.role)) {
            return next(new ApiError_1.ApiError(403, 'Insufficient permissions'));
        }
        next();
    };
};
exports.requireRole = requireRole;
const requireShopRole = (allowedRoles) => {
    return async (req, res, next) => {
        try {
            const userId = req.user.userId;
            const shopId = req.params.shopId || req.body.shopId || req.query.shopId;
            if (!shopId) {
                // If no shopId is explicit, we might be in a route that infers it.
                // For now, fail safe.
                return next(new ApiError_1.ApiError(400, 'Shop ID context required for permission check'));
            }
            // 1. Check Owner (Always allowed)
            const shop = await database_1.prisma.shop.findUnique({
                where: { shopId },
                select: { ownerId: true }
            });
            if (!shop) {
                return next(new ApiError_1.ApiError(404, 'Shop not found'));
            }
            if (shop.ownerId === userId) {
                return next();
            }
            // 2. Check Staff Role
            const staffRecord = await database_1.prisma.shopStaff.findUnique({
                where: {
                    shopId_userId: {
                        shopId,
                        userId
                    }
                }
            });
            if (!staffRecord || !staffRecord.isActive) {
                return next(new ApiError_1.ApiError(403, 'You do not have access to this shop'));
            }
            if (!allowedRoles.includes(staffRecord.role)) {
                return next(new ApiError_1.ApiError(403, 'Insufficient permissions'));
            }
            next();
        }
        catch (error) {
            next(error);
        }
    };
};
exports.requireShopRole = requireShopRole;
