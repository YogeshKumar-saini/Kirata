"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const asyncHandler_1 = require("../../shared/middlewares/asyncHandler");
const middleware_1 = require("../../auth/middleware");
const database_1 = require("../../shared/database");
const ApiError_1 = require("../../shared/errors/ApiError");
const router = (0, express_1.Router)();
// Admin only routes
router.use((0, middleware_1.authMiddleware)(['ADMIN']));
// Get pending verifications
router.get('/shops/pending', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const shops = await database_1.prisma.shop.findMany({
        where: {
            verificationStatus: 'PENDING',
            deletedAt: null
        },
        include: {
            owner: {
                select: { id: true, name: true, phone: true }
            }
        },
        orderBy: { createdAt: 'asc' }
    });
    res.json({ shops, count: shops.length });
}));
// Get all shops with filters
router.get('/shops', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { status, verified } = req.query;
    const where = { deletedAt: null };
    if (status) {
        where.verificationStatus = status;
    }
    if (verified !== undefined) {
        where.isVerified = verified === 'true';
    }
    const shops = await database_1.prisma.shop.findMany({
        where,
        include: {
            owner: {
                select: { id: true, name: true, phone: true }
            }
        },
        orderBy: { createdAt: 'desc' }
    });
    res.json({ shops, count: shops.length });
}));
// Approve shop verification
router.post('/shops/:shopId/verify', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { shopId } = req.params;
    const { notes } = req.body;
    const { userId } = req.user;
    const shop = await database_1.prisma.shop.update({
        where: { shopId },
        data: {
            verificationStatus: 'APPROVED',
            verifiedBy: userId,
            verificationNotes: notes
        }
    });
    res.json({
        message: 'Shop verified successfully',
        shop: {
            shopId: shop.shopId,
            name: shop.name,
            verificationStatus: shop.verificationStatus,
            verifiedBy: shop.verifiedBy
        }
    });
}));
// Reject shop verification
router.post('/shops/:shopId/reject', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { shopId } = req.params;
    const { reason } = req.body;
    const { userId } = req.user;
    if (!reason) {
        throw new ApiError_1.ApiError(400, 'Rejection reason is required');
    }
    const shop = await database_1.prisma.shop.update({
        where: { shopId },
        data: {
            verificationStatus: 'REJECTED',
            verifiedBy: userId,
            verificationNotes: reason
        }
    });
    res.json({
        message: 'Shop verification rejected',
        shop: {
            shopId: shop.shopId,
            name: shop.name,
            verificationStatus: shop.verificationStatus,
            reason
        }
    });
}));
// Get shop details for verification
router.get('/shops/:shopId', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { shopId } = req.params;
    const shop = await database_1.prisma.shop.findUnique({
        where: { shopId },
        include: {
            owner: {
                select: { id: true, name: true, phone: true, email: true }
            },
            Review: {
                take: 5,
                orderBy: { createdAt: 'desc' }
            }
        }
    });
    if (!shop) {
        throw new ApiError_1.ApiError(404, 'Shop not found');
    }
    res.json(shop);
}));
exports.default = router;
