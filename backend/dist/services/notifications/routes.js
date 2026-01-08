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
const service_1 = require("./service");
const ApiError_1 = require("../../shared/errors/ApiError");
const router = (0, express_1.Router)();
router.use((0, middleware_1.authMiddleware)(['SHOPKEEPER']));
// Send a manual payment reminder
router.post('/remind/payment', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { customerId, amount } = req.body;
    const { user } = req;
    if (!customerId || !amount) {
        throw new ApiError_1.ApiError(400, 'Customer ID and amount are required');
    }
    // Get shop ID - assuming updated ShopService or user extraction
    // Ideally we get shopId from user/middleware. For now assuming we can get it via service or it's attached.
    // Let's fetch shop first.
    const ShopService = await Promise.resolve().then(() => __importStar(require('../shops/service')));
    const shop = await ShopService.getShopByOwnerId(user.userId);
    if (!shop)
        throw new ApiError_1.ApiError(404, 'Shop not found');
    const success = await service_1.notificationService.sendPaymentReminder(shop.shopId, customerId, Number(amount));
    if (!success) {
        throw new ApiError_1.ApiError(400, 'Failed to send reminder. Check if customer has a valid phone number.');
    }
    res.json({ message: 'Reminder sent successfully' });
}));
// Send bulk payment reminders
router.post('/remind/payment/bulk', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { customerIds } = req.body;
    const { user } = req;
    if (!customerIds || !Array.isArray(customerIds) || customerIds.length === 0) {
        throw new ApiError_1.ApiError(400, 'Customer IDs array is required');
    }
    const ShopService = await Promise.resolve().then(() => __importStar(require('../shops/service')));
    const shop = await ShopService.getShopByOwnerId(user.userId);
    if (!shop)
        throw new ApiError_1.ApiError(404, 'Shop not found');
    const results = await service_1.notificationService.sendBulkPaymentReminders(shop.shopId, customerIds);
    res.json(results);
}));
// Get notification history
router.get('/history', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { limit, offset } = req.query;
    const { user } = req;
    const ShopService = await Promise.resolve().then(() => __importStar(require('../shops/service')));
    const shop = await ShopService.getShopByOwnerId(user.userId);
    if (!shop)
        throw new ApiError_1.ApiError(404, 'Shop not found');
    const history = await service_1.notificationService.getNotificationHistory(shop.shopId, Number(limit) || 50, Number(offset) || 0);
    res.json(history);
}));
exports.default = router;
