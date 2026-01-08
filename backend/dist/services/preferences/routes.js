"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const database_1 = require("../../shared/database");
const middleware_1 = require("../../auth/middleware");
const asyncHandler_1 = require("../../shared/middlewares/asyncHandler");
const ApiError_1 = require("../../shared/errors/ApiError");
const router = (0, express_1.Router)();
router.use((0, middleware_1.authMiddleware)(['SHOPKEEPER']));
// GET /preferences - Get current user's preferences
router.get('/', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { userId } = req.user;
    let prefs = await database_1.prismaRaw.userPreferences.findUnique({
        where: { userId }
    });
    if (!prefs) {
        // Verify user exists first to avoid FK error
        const userExists = await database_1.prismaRaw.shopkeeper.findUnique({ where: { id: userId } });
        if (!userExists) {
            throw new ApiError_1.ApiError(401, 'User not found');
        }
        // Create default if not exists
        prefs = await database_1.prismaRaw.userPreferences.create({
            data: { userId }
        });
    }
    res.json({ preferences: prefs });
}));
// PATCH /preferences - Update preferences
router.patch('/', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { userId } = req.user;
    const { notificationPrefs, reminderTemplates, filterPresets } = req.body;
    const updatedPrefs = await database_1.prismaRaw.userPreferences.upsert({
        where: { userId },
        update: {
            notificationPrefs: notificationPrefs !== undefined ? notificationPrefs : undefined,
            reminderTemplates: reminderTemplates !== undefined ? reminderTemplates : undefined,
            filterPresets: filterPresets !== undefined ? filterPresets : undefined
        },
        create: {
            userId,
            notificationPrefs: notificationPrefs || {},
            reminderTemplates: reminderTemplates || [],
            filterPresets: filterPresets || []
        }
    });
    res.json({ preferences: updatedPrefs, message: 'Preferences updated successfully' });
}));
exports.default = router;
