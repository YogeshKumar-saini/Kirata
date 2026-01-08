"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const database_1 = require("../../shared/database");
const middleware_1 = require("../../auth/middleware");
const ApiError_1 = require("../../shared/errors/ApiError");
const asyncHandler_1 = require("../../shared/middlewares/asyncHandler");
const service_1 = require("../shops/service");
const router = (0, express_1.Router)();
// Middleware to ensure user is logged in
router.use((0, middleware_1.authMiddleware)(['SHOPKEEPER']));
// GET /staff - List all staff for the current user's shop
router.get('/', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { userId } = req.user;
    // Get the shop owned by this user
    const shop = await (0, service_1.getShopByOwnerId)(userId);
    if (!shop) {
        throw new ApiError_1.ApiError(404, 'Shop not found. Only owners can manage staff currently.');
    }
    const staff = await database_1.prisma.shopStaff.findMany({
        where: { shopId: shop.shopId },
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    phone: true,
                    email: true
                }
            }
        },
        orderBy: { createdAt: 'desc' }
    });
    res.json({ staff });
}));
// POST /staff - Add staff member
router.post('/', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { userId } = req.user;
    const { phone, role } = req.body;
    if (!phone || !role) {
        throw new ApiError_1.ApiError(400, 'Phone and role are required');
    }
    if (!['MANAGER', 'STAFF'].includes(role)) {
        throw new ApiError_1.ApiError(400, 'Invalid role');
    }
    const shop = await (0, service_1.getShopByOwnerId)(userId);
    if (!shop) {
        throw new ApiError_1.ApiError(403, 'Only shop owners can add staff');
    }
    // Find user by phone
    const userToAdd = await database_1.prisma.shopkeeper.findUnique({
        where: { phone }
    });
    if (!userToAdd) {
        throw new ApiError_1.ApiError(404, 'User with this phone number not found. They must register first.');
    }
    if (userToAdd.id === userId) {
        throw new ApiError_1.ApiError(400, 'You cannot add yourself as staff');
    }
    // Check if already staff
    const existingStaff = await database_1.prisma.shopStaff.findUnique({
        where: {
            shopId_userId: {
                shopId: shop.shopId,
                userId: userToAdd.id
            }
        }
    });
    if (existingStaff) {
        throw new ApiError_1.ApiError(400, 'User is already a staff member');
    }
    const newStaff = await database_1.prisma.shopStaff.create({
        data: {
            shopId: shop.shopId,
            userId: userToAdd.id,
            role,
            isActive: true
        },
        include: {
            user: {
                select: { name: true, phone: true }
            }
        }
    });
    res.json({ staff: newStaff, message: 'Staff user added successfully' });
}));
// DELETE /staff/:staffId - Remove staff
router.delete('/:id', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { userId } = req.user;
    const staffId = req.params.id; // This is the ShopStaff ID, OR User ID? Let's use ShopStaff ID (UUID) or userId?
    // Let's assume ID passed is the 'id' (primary key) of ShopStaff table for uniqueness
    // Validate Owner
    const shop = await (0, service_1.getShopByOwnerId)(userId);
    if (!shop)
        throw new ApiError_1.ApiError(403, 'Only owners can remove staff');
    // Verify staff belongs to this shop
    const staffRecord = await database_1.prisma.shopStaff.findUnique({
        where: { id: staffId }
    });
    if (!staffRecord || staffRecord.shopId !== shop.shopId) {
        throw new ApiError_1.ApiError(404, 'Staff record not found');
    }
    await database_1.prisma.shopStaff.delete({
        where: { id: staffId }
    });
    res.json({ success: true, message: 'Staff removed successfully' });
}));
exports.default = router;
