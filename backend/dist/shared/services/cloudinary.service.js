"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getThumbnailUrl = exports.getOptimizedUrl = exports.deleteMultipleFromCloudinary = exports.deleteFromCloudinary = exports.uploadMultipleToCloudinary = exports.uploadToCloudinary = void 0;
const cloudinary_1 = require("cloudinary");
const logger_1 = require("../utils/logger");
const promises_1 = __importDefault(require("fs/promises"));
// Configure Cloudinary
cloudinary_1.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});
/**
 * Upload image to Cloudinary with automatic optimization
 */
const uploadToCloudinary = async (filePath, folder, transformation) => {
    try {
        const result = await cloudinary_1.v2.uploader.upload(filePath, {
            folder,
            transformation: transformation || [
                { width: 1200, height: 1200, crop: 'limit' },
                { quality: 'auto' },
                { fetch_format: 'auto' }
            ],
            resource_type: 'image'
        });
        // Delete local file after upload
        await promises_1.default.unlink(filePath).catch(err => logger_1.logger.warn('Failed to delete local file:', err));
        logger_1.logger.info(`Uploaded to Cloudinary: ${result.secure_url}`);
        return {
            url: result.secure_url,
            publicId: result.public_id,
            width: result.width,
            height: result.height,
            format: result.format
        };
    }
    catch (error) {
        logger_1.logger.error('Cloudinary upload failed:', error);
        throw new Error('Failed to upload image to cloud storage');
    }
};
exports.uploadToCloudinary = uploadToCloudinary;
/**
 * Upload multiple images to Cloudinary
 */
const uploadMultipleToCloudinary = async (filePaths, folder) => {
    const uploadPromises = filePaths.map(filePath => (0, exports.uploadToCloudinary)(filePath, folder));
    return await Promise.all(uploadPromises);
};
exports.uploadMultipleToCloudinary = uploadMultipleToCloudinary;
/**
 * Delete image from Cloudinary
 */
const deleteFromCloudinary = async (publicId) => {
    try {
        await cloudinary_1.v2.uploader.destroy(publicId);
        logger_1.logger.info(`Deleted from Cloudinary: ${publicId}`);
    }
    catch (error) {
        logger_1.logger.error('Cloudinary delete failed:', error);
        throw new Error('Failed to delete image from cloud storage');
    }
};
exports.deleteFromCloudinary = deleteFromCloudinary;
/**
 * Delete multiple images from Cloudinary
 */
const deleteMultipleFromCloudinary = async (publicIds) => {
    const deletePromises = publicIds.map(publicId => (0, exports.deleteFromCloudinary)(publicId));
    await Promise.all(deletePromises);
};
exports.deleteMultipleFromCloudinary = deleteMultipleFromCloudinary;
/**
 * Get optimized image URL with transformations
 */
const getOptimizedUrl = (publicId, width, height, quality = 'auto') => {
    return cloudinary_1.v2.url(publicId, {
        transformation: [
            { width, height, crop: 'limit' },
            { quality },
            { fetch_format: 'auto' }
        ]
    });
};
exports.getOptimizedUrl = getOptimizedUrl;
/**
 * Generate thumbnail URL from Cloudinary image
 */
const getThumbnailUrl = (publicId) => {
    return cloudinary_1.v2.url(publicId, {
        transformation: [
            { width: 150, height: 150, crop: 'fill', gravity: 'auto' },
            { quality: 80 },
            { fetch_format: 'auto' }
        ]
    });
};
exports.getThumbnailUrl = getThumbnailUrl;
