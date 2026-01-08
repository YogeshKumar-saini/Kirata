import { Router } from 'express';
import { asyncHandler } from '../../shared/middlewares/asyncHandler';
import { authMiddleware } from '../../auth/middleware';
import * as ShopService from '../shops/service';
import { ApiError } from '../../shared/errors/ApiError';
import { uploadToCloudinary, uploadMultipleToCloudinary } from '../../shared/services/cloudinary.service';

const router = Router();

// ==========================================
// SHOPKEEPER ROUTES
// ==========================================

// Upload shop logo
router.post('/logo', authMiddleware(['SHOPKEEPER']), asyncHandler(async (req, res, next) => {
    const { userId } = (req as any).user;
    const shop = await ShopService.getShopByOwnerId(userId);

    if (!shop) {
        throw new ApiError(404, 'No shop found');
    }

    const { shopPhotoUpload } = await import('../../shared/middlewares/upload.middleware');

    shopPhotoUpload.single('logo')(req, res, async (err: any) => {
        if (err) return next(new ApiError(400, err.message));
        if (!req.file) return next(new ApiError(400, 'No logo file provided'));

        try {
            // Upload to Cloudinary
            const result = await uploadToCloudinary(
                req.file.path,
                `shops/${shop.shopId}/logo`
            );

            // Update shop
            await ShopService.updateShop(shop.shopId, userId, {
                logoUrl: result.url
            } as any);

            res.json({
                message: 'Logo uploaded successfully',
                logoUrl: result.url
            });
        } catch (error: any) {
            next(new ApiError(500, error.message || 'Image upload failed'));
        }
    });
}));

// Upload multiple shop photos (up to 10)
router.post('/photos', authMiddleware(['SHOPKEEPER']), asyncHandler(async (req, res, next) => {
    const { userId } = (req as any).user;
    const shop = await ShopService.getShopByOwnerId(userId);

    if (!shop) {
        throw new ApiError(404, 'No shop found');
    }

    const { shopPhotoUpload } = await import('../../shared/middlewares/upload.middleware');

    shopPhotoUpload.array('photos', 10)(req, res, async (err: any) => {
        if (err) return next(new ApiError(400, err.message));

        const files = req.files as Express.Multer.File[];
        if (!files || files.length === 0) {
            return next(new ApiError(400, 'No photos provided'));
        }

        try {
            // Upload all to Cloudinary
            const filePaths = files.map(f => f.path);
            const results = await uploadMultipleToCloudinary(
                filePaths,
                `shops/${shop.shopId}/photos`
            );

            // Get current photos
            const currentPhotos = (shop.photoUrls as string[]) || [];
            const newPhotos = results.map(r => r.url);

            // Combine and limit to 10
            const allPhotos = [...currentPhotos, ...newPhotos].slice(0, 10);

            // Update shop
            await ShopService.updateShop(shop.shopId, userId, {
                photoUrls: allPhotos
            } as any);

            res.json({
                message: `${newPhotos.length} photos uploaded successfully`,
                photoUrls: allPhotos,
                totalPhotos: allPhotos.length
            });
        } catch (error: any) {
            next(new ApiError(500, error.message || 'Image upload failed'));
        }
    });
}));

// Delete a shop photo
router.delete('/photos/:index', authMiddleware(['SHOPKEEPER']), asyncHandler(async (req, res) => {
    const { userId } = (req as any).user;
    const { index } = req.params;
    const photoIndex = parseInt(index);

    const shop = await ShopService.getShopByOwnerId(userId);
    if (!shop) {
        throw new ApiError(404, 'No shop found');
    }

    const currentPhotos = (shop.photoUrls as string[]) || [];

    if (photoIndex < 0 || photoIndex >= currentPhotos.length) {
        throw new ApiError(400, 'Invalid photo index');
    }

    // Remove photo at index
    const updatedPhotos = currentPhotos.filter((_, i) => i !== photoIndex);

    // Update shop
    await ShopService.updateShop(shop.shopId, userId, {
        photoUrls: updatedPhotos
    } as any);

    res.json({
        message: 'Photo deleted successfully',
        photoUrls: updatedPhotos
    });
}));


// ==========================================
// CUSTOMER ROUTES
// ==========================================

// Upload review photos (up to 5)
router.post('/reviews', authMiddleware(['CUSTOMER']), asyncHandler(async (req, res, next) => {
    const { userId } = (req as any).user;

    // Reuse upload middleware but maybe we need a specific one for reviews? 
    // For now, reusing shopPhotoUpload is fine as it validates images, just creates temp files.
    const { shopPhotoUpload } = await import('../../shared/middlewares/upload.middleware');

    shopPhotoUpload.array('photos', 5)(req, res, async (err: any) => {
        if (err) return next(new ApiError(400, err.message));

        const files = req.files as Express.Multer.File[];
        if (!files || files.length === 0) {
            return next(new ApiError(400, 'No photos provided'));
        }

        try {
            const timestamp = Date.now();
            const filePaths = files.map(f => f.path);

            // Upload to Cloudinary under generic reviews folder or user specific
            const results = await uploadMultipleToCloudinary(
                filePaths,
                `reviews/${userId}/${timestamp}`
            );

            const photoUrls = results.map(r => r.url);

            res.json({
                message: 'Review photos uploaded successfully',
                photoUrls
            });
        } catch (error: any) {
            next(new ApiError(500, error.message || 'Image upload failed'));
        }
    });
}));

export default router;
