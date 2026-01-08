import sharp from 'sharp';
import path from 'path';
import fs from 'fs/promises';
import { logger } from '../utils/logger';

export interface ProcessedImages {
    thumbnail: string;  // 150x150
    medium: string;     // 500x500
    large: string;      // 1200x1200
}

/**
 * Process shop image into multiple sizes
 * Converts to WebP format for better compression
 */
export const processShopImage = async (
    inputPath: string,
    shopId: string
): Promise<ProcessedImages> => {
    const outputDir = path.join(__dirname, '../../../uploads/shop-photos');
    const timestamp = Date.now();

    // Import Cloudinary service
    const { uploadToCloudinary } = await import('./cloudinary.service');

    // Generate local filenames
    const thumbName = `${shopId}-thumb-${timestamp}.webp`;
    const mediumName = `${shopId}-medium-${timestamp}.webp`;
    const largeName = `${shopId}-large-${timestamp}.webp`;

    const thumbPath = path.join(outputDir, thumbName);
    const mediumPath = path.join(outputDir, mediumName);
    const largePath = path.join(outputDir, largeName);

    try {
        // 1. Process images locally with Sharp
        await Promise.all([
            // Thumbnail: 150x150
            sharp(inputPath)
                .resize(150, 150, { fit: 'cover', position: 'center' })
                .webp({ quality: 80 })
                .toFile(thumbPath),

            // Medium: 500x500
            sharp(inputPath)
                .resize(500, 500, { fit: 'cover', position: 'center' })
                .webp({ quality: 85 })
                .toFile(mediumPath),

            // Large: 1200x1200
            sharp(inputPath)
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
            fs.unlink(inputPath).catch(e => logger.warn('Failed to delete original', e)),
            // Cloudinary service handles deletion of uploaded files, but let's be safe if it doesn't
            // Actually `uploadToCloudinary` deletes the file after upload.
        ]);

        logger.info(`Processed & Uploaded shop image for ${shopId}`);

        return {
            thumbnail: thumbUpload.url,
            medium: mediumUpload.url,
            large: largeUpload.url
        };
    } catch (error: any) {
        logger.error(`Error processing image for shop ${shopId}:`, error);
        throw new Error('Image processing and upload failed: ' + error.message);
    }
};

/**
 * Delete shop images (all sizes)
 */
export const deleteShopImages = async (photoUrl: string): Promise<void> => {
    try {
        // Extract base filename
        const filename = path.basename(photoUrl);
        const outputDir = path.join(__dirname, '../../../uploads/shop-photos');

        // Delete all related files
        const files = await fs.readdir(outputDir);
        const relatedFiles = files.filter(f => f.includes(filename.split('-')[0]));

        await Promise.all(
            relatedFiles.map(f => fs.unlink(path.join(outputDir, f)))
        );

        logger.info(`Deleted shop images: ${relatedFiles.length} files`);
    } catch (error) {
        logger.warn('Error deleting shop images:', error);
        // Don't throw - deletion failure shouldn't block other operations
    }
};
