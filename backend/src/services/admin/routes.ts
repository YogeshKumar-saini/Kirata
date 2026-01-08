import { Router } from 'express';
import { asyncHandler } from '../../shared/middlewares/asyncHandler';
import { authMiddleware } from '../../auth/middleware';
import { prisma } from '../../shared/database';
import { ApiError } from '../../shared/errors/ApiError';

const router = Router();

// Admin only routes
router.use(authMiddleware(['ADMIN']));

// Get pending verifications
router.get('/shops/pending', asyncHandler(async (req, res) => {
    const shops = await prisma.shop.findMany({
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
router.get('/shops', asyncHandler(async (req, res) => {
    const { status, verified } = req.query;

    const where: any = { deletedAt: null };

    if (status) {
        where.verificationStatus = status;
    }

    if (verified !== undefined) {
        where.isVerified = verified === 'true';
    }

    const shops = await prisma.shop.findMany({
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
router.post('/shops/:shopId/verify', asyncHandler(async (req, res) => {
    const { shopId } = req.params;
    const { notes } = req.body;
    const { userId } = (req as any).user;

    const shop = await prisma.shop.update({
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
router.post('/shops/:shopId/reject', asyncHandler(async (req, res) => {
    const { shopId } = req.params;
    const { reason } = req.body;
    const { userId } = (req as any).user;

    if (!reason) {
        throw new ApiError(400, 'Rejection reason is required');
    }

    const shop = await prisma.shop.update({
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
router.get('/shops/:shopId', asyncHandler(async (req, res) => {
    const { shopId } = req.params;

    const shop = await prisma.shop.findUnique({
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
        throw new ApiError(404, 'Shop not found');
    }

    res.json(shop);
}));

export default router;
