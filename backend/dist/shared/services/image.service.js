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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteShopImages = exports.processShopImage = void 0;
const sharp_1 = __importDefault(require("sharp"));
const path_1 = __importDefault(require("path"));
const promises_1 = __importDefault(require("fs/promises"));
const logger_1 = require("../utils/logger");
/**
 * Process shop image into multiple sizes
 * Converts to WebP format for better compression
 */
const processShopImage = async (inputPath, shopId) => {
    const outputDir = path_1.default.join(__dirname, '../../../uploads/shop-photos');
    const timestamp = Date.now();
    // Import Cloudinary service
    const { uploadToCloudinary } = await Promise.resolve().then(() => __importStar(require('./cloudinary.service')));
    // Generate local filenames
    const thumbName = `${shopId}-thumb-${timestamp}.webp`;
    const mediumName = `${shopId}-medium-${timestamp}.webp`;
    const largeName = `${shopId}-large-${timestamp}.webp`;
    const thumbPath = path_1.default.join(outputDir, thumbName);
    const mediumPath = path_1.default.join(outputDir, mediumName);
    const largePath = path_1.default.join(outputDir, largeName);
    try {
        // 1. Process images locally with Sharp
        await Promise.all([
            // Thumbnail: 150x150
            (0, sharp_1.default)(inputPath)
                .resize(150, 150, { fit: 'cover', position: 'center' })
                .webp({ quality: 80 })
                .toFile(thumbPath),
            // Medium: 500x500
            (0, sharp_1.default)(inputPath)
                .resize(500, 500, { fit: 'cover', position: 'center' })
                .webp({ quality: 85 })
                .toFile(mediumPath),
            // Large: 1200x1200
            (0, sharp_1.default)(inputPath)
                .resize(1200, 1200, { fit: 'inside' })
                .webp({ quality: 90 })
                .toFile(largePath)
        ]);
        // 2. Upload to Cloudinary
        const [thumbUpload, mediumUpload, largeUpload] = await Promise.all([
            uploadToCloudinary(thumbPath, 'shop-photos/thumbnails'),
            uploadToCloudinary(mediumPath, 'shop-photos/medium'),
            uploadToCloudinary(largePath, 'shop-photos/large')
        ]);
        // 3. Cleanup local files (including original)
        await Promise.all([
            promises_1.default.unlink(inputPath).catch(e => logger_1.logger.warn('Failed to delete original', e)),
            // Cloudinary service handles deletion of uploaded files, but let's be safe if it doesn't
            // Actually `uploadToCloudinary` deletes the file after upload.
        ]);
        logger_1.logger.info(`Processed & Uploaded shop image for ${shopId}`);
        return {
            thumbnail: thumbUpload.url,
            medium: mediumUpload.url,
            large: largeUpload.url
        };
    }
    catch (error) {
        logger_1.logger.error(`Error processing image for shop ${shopId}:`, error);
        throw new Error('Image processing and upload failed: ' + error.message);
    }
};
exports.processShopImage = processShopImage;
/**
 * Delete shop images (all sizes)
 */
const deleteShopImages = async (photoUrl) => {
    try {
        // Extract base filename
        const filename = path_1.default.basename(photoUrl);
        const outputDir = path_1.default.join(__dirname, '../../../uploads/shop-photos');
        // Delete all related files
        const files = await promises_1.default.readdir(outputDir);
        const relatedFiles = files.filter(f => f.includes(filename.split('-')[0]));
        await Promise.all(relatedFiles.map(f => promises_1.default.unlink(path_1.default.join(outputDir, f))));
        logger_1.logger.info(`Deleted shop images: ${relatedFiles.length} files`);
    }
    catch (error) {
        logger_1.logger.warn('Error deleting shop images:', error);
        // Don't throw - deletion failure shouldn't block other operations
    }
};
exports.deleteShopImages = deleteShopImages;
