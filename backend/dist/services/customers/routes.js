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
const CustomerController = __importStar(require("./controller"));
const router = (0, express_1.Router)();
// Protect all routes with Customer role
router.use((0, middleware_1.authMiddleware)(['CUSTOMER']));
router.get('/dashboard', CustomerController.getDashboard);
router.get('/shops', CustomerController.getShops);
router.get('/shops/:shopId/ledger', CustomerController.getShopLedger);
router.get('/orders', CustomerController.getOrders);
router.get('/analytics', CustomerController.getAnalytics);
router.get('/transactions', CustomerController.getTransactions);
router.get('/transactions/:transactionId/receipt', CustomerController.getTransactionReceipt);
router.get('/shops/:shopId/export', CustomerController.exportShopLedger);
router.post('/shops/:shopId/pay/upi', CustomerController.getUpiIntent);
router.post('/shops/:shopId/payments', CustomerController.recordPayment);
router.post('/shops/:shopId/reviews', CustomerController.createReview);
router.patch('/profile', CustomerController.updateProfile);
exports.default = router;
