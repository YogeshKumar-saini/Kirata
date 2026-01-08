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
const AnalyticsService = __importStar(require("./service"));
const ShopService = __importStar(require("../shops/service"));
const ApiError_1 = require("../../shared/errors/ApiError");
const router = (0, express_1.Router)();
// Protected routes - shopkeepers only
router.use((0, middleware_1.authMiddleware)(['SHOPKEEPER']));
// Get my shop analytics
router.get('/my', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { userId } = req.user;
    const shop = await ShopService.getShopByOwnerId(userId);
    if (!shop) {
        throw new ApiError_1.ApiError(404, 'No shop found');
    }
    // Get date range from query params
    const days = parseInt(req.query.days) || 30;
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const analytics = await AnalyticsService.getShopAnalytics(shop.shopId, startDate, endDate);
    res.json(analytics);
}));
// Get today's analytics
router.get('/my/today', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { userId } = req.user;
    const shop = await ShopService.getShopByOwnerId(userId);
    if (!shop) {
        throw new ApiError_1.ApiError(404, 'No shop found');
    }
    const today = await AnalyticsService.getTodayAnalytics(shop.shopId);
    res.json(today);
}));
exports.default = router;
