"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.csvUpload = exports.shopPhotoUpload = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const ApiError_1 = require("../errors/ApiError");
// Storage configuration
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './uploads/shop-photos/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = `${Date.now()}-${Math.random().toString(36).substring(7)}`;
        const ext = path_1.default.extname(file.originalname);
        cb(null, `shop-${uniqueSuffix}${ext}`);
    }
});
// File filter
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const extname = allowedTypes.test(path_1.default.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
        cb(null, true);
    }
    else {
        cb(new ApiError_1.ApiError(400, 'Only image files (JPEG, PNG, WebP) are allowed'));
    }
};
// Multer configuration
exports.shopPhotoUpload = (0, multer_1.default)({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB max
    },
    fileFilter
});
// CSV Storage configuration
const csvStorage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, '/tmp/'); // Use system temp directory
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = `${Date.now()}-${Math.random().toString(36).substring(7)}`;
        cb(null, `import-${uniqueSuffix}.csv`);
    }
});
// CSV File filter
const csvFileFilter = (req, file, cb) => {
    const allowedTypes = /csv/;
    const extname = allowedTypes.test(path_1.default.extname(file.originalname).toLowerCase());
    const mimetype = file.mimetype === 'text/csv' || file.mimetype === 'application/vnd.ms-excel'; // Standard CSV mimetypes
    if (extname) {
        cb(null, true);
    }
    else {
        cb(new ApiError_1.ApiError(400, 'Only CSV files are allowed'));
    }
};
exports.csvUpload = (0, multer_1.default)({
    storage: csvStorage,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB max
    },
    fileFilter: csvFileFilter
});
