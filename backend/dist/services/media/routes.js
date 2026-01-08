"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const asyncHandler_1 = require("../../shared/middlewares/asyncHandler");
const middleware_1 = require("../../auth/middleware");
const ShopService = __importStar(require("../shops/service"));
const ApiError_1 = require("../../shared/errors/ApiError");
const cloudinary_service_1 = require("../../shared/services/cloudinary.service");
const router = (0, express_1.Router)();
// ==========================================
// SHOPKEEPER ROUTES
// ==========================================
// Upload shop logo
router.post('/logo', (0, middleware_1.authMiddleware)(['SHOPKEEPER']), (0, asyncHandler_1.asyncHandler)(async (req, res, next) => {
    const { userId } = req.user;
    const shop = await ShopService.getShopByOwnerId(userId);
    if (!shop) {
        throw new ApiError_1.ApiError(404, 'No shop found');
    }
    const { shopPhotoUpload } = await Promise.resolve().then(() => __importStar(require('../../shared/middlewares/upload.middleware')));
    shopPhotoUpload.single('logo')(req, res, async (err) => {
        if (err)
            return next(new ApiError_1.ApiError(400, err.message));
        if (!req.file)
            return next(new ApiError_1.ApiError(400, 'No logo file provided'));
        try {
            // Upload to Cloudinary
            const result = await (0, cloudinary_service_1.uploadToCloudinary)(req.file.path, `shops/${shop.shopId}/logo`);
            // Update shop
            await ShopService.updateShop(shop.shopId, userId, {
                logoUrl: result.url
            });
            res.json({
                message: 'Logo uploaded successfully',
                logoUrl: result.url
            });
        }
        catch (error) {
            next(new ApiError_1.ApiError(500, error.message || 'Image upload failed'));
        }
    });
}));
// Upload multiple shop photos (up to 10)
router.post('/photos', (0, middleware_1.authMiddleware)(['SHOPKEEPER']), (0, asyncHandler_1.asyncHandler)(async (req, res, next) => {
    const { userId } = req.user;
    const shop = await ShopService.getShopByOwnerId(userId);
    if (!shop) {
        throw new ApiError_1.ApiError(404, 'No shop found');
    }
    const { shopPhotoUpload } = await Promise.resolve().then(() => __importStar(require('../../shared/middlewares/upload.middleware')));
    shopPhotoUpload.array('photos', 10)(req, res, async (err) => {
        if (err)
            return next(new ApiError_1.ApiError(400, err.message));
        const files = req.files;
        if (!files || files.length === 0) {
            return next(new ApiError_1.ApiError(400, 'No photos provided'));
        }
        try {
            // Upload all to Cloudinary
            const filePaths = files.map(f => f.path);
            const results = await (0, cloudinary_service_1.uploadMultipleToCloudinary)(filePaths, `shops/${shop.shopId}/photos`);
            // Get current photos
            const currentPhotos = shop.photoUrls || [];
            const newPhotos = results.map(r => r.url);
            // Combine and limit to 10
            const allPhotos = [...currentPhotos, ...newPhotos].slice(0, 10);
            // Update shop
            await ShopService.updateShop(shop.shopId, userId, {
                photoUrls: allPhotos
            });
            res.json({
                message: `${newPhotos.length} photos uploaded successfully`,
                photoUrls: allPhotos,
                totalPhotos: allPhotos.length
            });
        }
        catch (error) {
            next(new ApiError_1.ApiError(500, error.message || 'Image upload failed'));
        }
    });
}));
// Delete a shop photo
router.delete('/photos/:index', (0, middleware_1.authMiddleware)(['SHOPKEEPER']), (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { userId } = req.user;
    const { index } = req.params;
    const photoIndex = parseInt(index);
    const shop = await ShopService.getShopByOwnerId(userId);
    if (!shop) {
        throw new ApiError_1.ApiError(404, 'No shop found');
    }
    const currentPhotos = shop.photoUrls || [];
    if (photoIndex < 0 || photoIndex >= currentPhotos.length) {
        throw new ApiError_1.ApiError(400, 'Invalid photo index');
    }
    // Remove photo at index
    const updatedPhotos = currentPhotos.filter((_, i) => i !== photoIndex);
    // Update shop
    await ShopService.updateShop(shop.shopId, userId, {
        photoUrls: updatedPhotos
    });
    res.json({
        message: 'Photo deleted successfully',
        photoUrls: updatedPhotos
    });
}));
// ==========================================
// CUSTOMER ROUTES
// ==========================================
// Upload review photos (up to 5)
router.post('/reviews', (0, middleware_1.authMiddleware)(['CUSTOMER']), (0, asyncHandler_1.asyncHandler)(async (req, res, next) => {
    const { userId } = req.user;
    // Reuse upload middleware but maybe we need a specific one for reviews? 
    // For now, reusing shopPhotoUpload is fine as it validates images, just creates temp files.
    const { shopPhotoUpload } = await Promise.resolve().then(() => __importStar(require('../../shared/middlewares/upload.middleware')));
    shopPhotoUpload.array('photos', 5)(req, res, async (err) => {
        if (err)
            return next(new ApiError_1.ApiError(400, err.message));
        const files = req.files;
        if (!files || files.length === 0) {
            return next(new ApiError_1.ApiError(400, 'No photos provided'));
        }
        try {
            const timestamp = Date.now();
            const filePaths = files.map(f => f.path);
            // Upload to Cloudinary under generic reviews folder or user specific
            const results = await (0, cloudinary_service_1.uploadMultipleToCloudinary)(filePaths, `reviews/${userId}/${timestamp}`);
            const photoUrls = results.map(r => r.url);
            res.json({
                message: 'Review photos uploaded successfully',
                photoUrls
            });
        }
        catch (error) {
            next(new ApiError_1.ApiError(500, error.message || 'Image upload failed'));
        }
    });
}));
exports.default = router;
