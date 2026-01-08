import { v2 as cloudinary } from 'cloudinary';
import { logger } from '../utils/logger';
import fs from 'fs/promises';

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

export interface CloudinaryUploadResult {
    url: string;
    publicId: string;
    width: number;
    height: number;
    format: string;
}

/**
 * Upload image to Cloudinary with automatic optimization
 */
export const uploadToCloudinary = async (
    filePath: string,
    folder: string,
    transformation?: any
): Promise<CloudinaryUploadResult> => {
    try {
        const result = await cloudinary.uploader.upload(filePath, {
            folder,
            transformation: transformation || [
                { width: 1200, height: 1200, crop: 'limit' },
                { quality: 'auto' },
                { fetch_format: 'auto' }
            ],
            resource_type: 'image'
        });

        // Delete local file after upload
        await fs.unlink(filePath).catch(err =>
            logger.warn('Failed to delete local file:', err)
        );

        logger.info(`Uploaded to Cloudinary: ${result.secure_url}`);

        return {
            url: result.secure_url,
            publicId: result.public_id,
            width: result.width,
            height: result.height,
            format: result.format
        };
    } catch (error) {
        logger.error('Cloudinary upload failed:', error);
        throw new Error('Failed to upload image to cloud storage');
    }
};

/**
 * Upload multiple images to Cloudinary
 */
export const uploadMultipleToCloudinary = async (
    filePaths: string[],
    folder: string
): Promise<CloudinaryUploadResult[]> => {
    const uploadPromises = filePaths.map(filePath =>
        uploadToCloudinary(filePath, folder)
    );

    return await Promise.all(uploadPromises);
};

/**
 * Delete image from Cloudinary
 */
export const deleteFromCloudinary = async (publicId: string): Promise<void> => {
    try {
        await cloudinary.uploader.destroy(publicId);
        logger.info(`Deleted from Cloudinary: ${publicId}`);
    } catch (error) {
        logger.error('Cloudinary delete failed:', error);
        throw new Error('Failed to delete image from cloud storage');
    }
};

/**
 * Delete multiple images from Cloudinary
 */
export const deleteMultipleFromCloudinary = async (
    publicIds: string[]
): Promise<void> => {
    const deletePromises = publicIds.map(publicId =>
        deleteFromCloudinary(publicId)
    );

    await Promise.all(deletePromises);
};

/**
 * Get optimized image URL with transformations
 */
export const getOptimizedUrl = (
    publicId: string,
    width?: number,
    height?: number,
    quality: 'auto' | number = 'auto'
): string => {
    return cloudinary.url(publicId, {
        transformation: [
            { width, height, crop: 'limit' },
            { quality },
            { fetch_format: 'auto' }
        ]
    });
};

/**
 * Generate thumbnail URL from Cloudinary image
 */
export const getThumbnailUrl = (publicId: string): string => {
    return cloudinary.url(publicId, {
        transformation: [
            { width: 150, height: 150, crop: 'fill', gravity: 'auto' },
            { quality: 80 },
            { fetch_format: 'auto' }
        ]
    });
};
