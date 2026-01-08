import multer from 'multer';
import path from 'path';
import { Request } from 'express';
import { ApiError } from '../errors/ApiError';

// Storage configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './uploads/shop-photos/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = `${Date.now()}-${Math.random().toString(36).substring(7)}`;
        const ext = path.extname(file.originalname);
        cb(null, `shop-${uniqueSuffix}${ext}`);
    }
});

// File filter
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
        cb(null, true);
    } else {
        cb(new ApiError(400, 'Only image files (JPEG, PNG, WebP) are allowed'));
    }
};

// Multer configuration
export const shopPhotoUpload = multer({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB max
    },
    fileFilter
});

// CSV Storage configuration
const csvStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, '/tmp/'); // Use system temp directory
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = `${Date.now()}-${Math.random().toString(36).substring(7)}`;
        cb(null, `import-${uniqueSuffix}.csv`);
    }
});

// CSV File filter
const csvFileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    const allowedTypes = /csv/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = file.mimetype === 'text/csv' || file.mimetype === 'application/vnd.ms-excel'; // Standard CSV mimetypes

    if (extname) {
        cb(null, true);
    } else {
        cb(new ApiError(400, 'Only CSV files are allowed'));
    }
};

export const csvUpload = multer({
    storage: csvStorage,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB max
    },
    fileFilter: csvFileFilter
});
