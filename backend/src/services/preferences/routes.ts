import { Router } from 'express';
import { prismaRaw } from '../../shared/database';
import { authMiddleware } from '../../auth/middleware';
import { asyncHandler } from '../../shared/middlewares/asyncHandler';
import { ApiError } from '../../shared/errors/ApiError';

const router = Router();

router.use(authMiddleware(['SHOPKEEPER']));

// GET /preferences - Get current user's preferences
router.get('/', asyncHandler(async (req, res) => {
    const { userId } = (req as any).user;

    let prefs = await prismaRaw.userPreferences.findUnique({
        where: { userId }
    });

    if (!prefs) {
        // Verify user exists first to avoid FK error
        const userExists = await prismaRaw.shopkeeper.findUnique({ where: { id: userId } });
        if (!userExists) {
            throw new ApiError(401, 'User not found');
        }

        // Create default if not exists
        prefs = await prismaRaw.userPreferences.create({
            data: { userId }
        });
    }

    res.json({ preferences: prefs });
}));

// PATCH /preferences - Update preferences
router.patch('/', asyncHandler(async (req, res) => {
    const { userId } = (req as any).user;
    const { notificationPrefs, reminderTemplates, filterPresets } = req.body;

    const updatedPrefs = await prismaRaw.userPreferences.upsert({
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

export default router;
