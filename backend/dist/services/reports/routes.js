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
const middleware_1 = require("../../auth/middleware");
const asyncHandler_1 = require("../../shared/middlewares/asyncHandler");
const ApiError_1 = require("../../shared/errors/ApiError");
const ShopService = __importStar(require("../shops/service"));
const ReportsService = __importStar(require("./service"));
const router = (0, express_1.Router)();
// Generate PDF Report
router.get('/generate', (0, middleware_1.authMiddleware)(['SHOPKEEPER']), (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { userId } = req.user;
    const { timeframe, date } = req.query;
    if (!timeframe || !['daily', 'weekly', 'monthly'].includes(timeframe)) {
        throw new ApiError_1.ApiError(400, 'Invalid timeframe. Must be daily, weekly, or monthly.');
    }
    const reportDate = date ? new Date(date) : new Date();
    if (isNaN(reportDate.getTime())) {
        throw new ApiError_1.ApiError(400, 'Invalid date format');
    }
    const shopResult = await ShopService.getShopByOwnerId(userId);
    if (!shopResult)
        throw new ApiError_1.ApiError(404, 'Shop not found');
    const pdfBuffer = await ReportsService.generatePDFReport(shopResult.shopId, {
        timeframe: timeframe,
        date: reportDate
    });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=report-${timeframe}-${reportDate.toISOString().split('T')[0]}.pdf`);
    res.send(pdfBuffer);
}));
// Get Dashboard Analytics
router.get('/dashboard', (0, middleware_1.authMiddleware)(['SHOPKEEPER']), (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { userId } = req.user;
    const { timeframe = 'monthly' } = req.query; // default to monthly view (last 30 days)
    const shopResult = await ShopService.getShopByOwnerId(userId);
    if (!shopResult)
        throw new ApiError_1.ApiError(404, 'Shop not found');
    const data = await ReportsService.getReportData(shopResult.shopId, timeframe);
    res.json(data);
}));
// Email Report
router.post('/email', (0, middleware_1.authMiddleware)(['SHOPKEEPER']), (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { userId } = req.user;
    const { timeframe, date, email } = req.body;
    if (!timeframe || !['daily', 'weekly', 'monthly'].includes(timeframe)) {
        throw new ApiError_1.ApiError(400, 'Invalid timeframe. Must be daily, weekly, or monthly.');
    }
    const reportDate = date ? new Date(date) : new Date();
    if (isNaN(reportDate.getTime())) {
        throw new ApiError_1.ApiError(400, 'Invalid date format');
    }
    const shopResult = await ShopService.getShopByOwnerId(userId);
    if (!shopResult)
        throw new ApiError_1.ApiError(404, 'Shop not found');
    // Use provided email or fallback to shopkeeper's registered email
    // We need to fetch shopkeeper email if not provided.
    let targetEmail = email;
    if (!targetEmail) {
        // Assuming user object from authMiddleware has email, or we fetch it.
        // user in authMiddleware is { userId, role, ... } usually.
        // Let's assume we need to fetch it or client sends it.
        // For now, let's require client to send it OR fetch from DB.
        // To be safe, let's fetch shopkeeper details.
        const shopkeeper = await ShopService.getShopkeeperById(userId);
        targetEmail = shopkeeper?.email;
    }
    if (!targetEmail) {
        throw new ApiError_1.ApiError(400, 'Email address is required');
    }
    await Promise.resolve().then(() => __importStar(require('./email-handler'))).then(m => m.emailReportHandler(shopResult.shopId, targetEmail, timeframe, reportDate));
    res.json({ success: true, message: `Report emailed to ${targetEmail}` });
}));
exports.default = router;
