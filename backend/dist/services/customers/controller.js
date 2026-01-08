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
exports.createReview = exports.recordPayment = exports.getUpiIntent = exports.exportShopLedger = exports.getTransactionReceipt = exports.getTransactions = exports.getAnalytics = exports.updateProfile = exports.getOrders = exports.getShopLedger = exports.getShops = exports.getDashboard = void 0;
const asyncHandler_1 = require("../../shared/middlewares/asyncHandler");
const CustomerService = __importStar(require("./service"));
exports.getDashboard = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { userId } = req.user;
    const stats = await CustomerService.getCustomerDashboardStats(userId);
    res.json(stats);
});
exports.getShops = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { userId } = req.user;
    const shops = await CustomerService.getCustomerShops(userId);
    res.json(shops);
});
exports.getShopLedger = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { userId } = req.user;
    const { shopId } = req.params;
    const ledger = await CustomerService.getCustomerShopLedger(userId, shopId);
    res.json(ledger);
});
exports.getOrders = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { userId } = req.user;
    const orders = await CustomerService.getCustomerOrders(userId);
    res.json(orders);
});
exports.updateProfile = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { userId } = req.user;
    const updatedCustomer = await CustomerService.updateCustomerProfile(userId, req.body);
    res.json(updatedCustomer);
});
// ... existing methods
exports.getAnalytics = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { userId } = req.user;
    const data = await CustomerService.getCustomerAnalytics(userId);
    res.json(data);
});
exports.getTransactions = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { userId } = req.user;
    const { shopId, paymentType, startDate, endDate, limit } = req.query;
    const transactions = await CustomerService.getCustomerTransactions(userId, {
        shopId: shopId,
        paymentType: paymentType,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        limit: limit ? parseInt(limit) : 50
    });
    res.json(transactions);
});
exports.getTransactionReceipt = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { userId } = req.user;
    const { transactionId } = req.params;
    const pdfBuffer = await CustomerService.getCustomerTransactionReceipt(userId, transactionId);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=receipt-${transactionId}.pdf`);
    res.send(pdfBuffer);
});
exports.exportShopLedger = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { userId } = req.user;
    const { shopId } = req.params;
    const { format } = req.query;
    const data = await CustomerService.exportCustomerLedger(userId, shopId, format);
    if (format === 'csv') {
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=ledger-${shopId}.csv`);
        return res.send(data);
    }
    res.json(data);
});
exports.getUpiIntent = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { shopId } = req.params;
    const { amount } = req.body;
    if (!amount || isNaN(amount) || amount <= 0) {
        throw new Error('Invalid amount');
    }
    const data = await CustomerService.generateUpiIntent(shopId, amount);
    res.json(data);
});
exports.recordPayment = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { userId } = req.user;
    const { shopId } = req.params;
    const { amount, paymentMethod, notes } = req.body;
    if (!amount || isNaN(amount) || amount <= 0) {
        throw new Error('Invalid amount');
    }
    const result = await CustomerService.recordCustomerPayment(userId, shopId, amount, paymentMethod, notes);
    res.json(result);
});
exports.createReview = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { userId } = req.user;
    const { shopId } = req.params;
    const { rating, comment } = req.body;
    if (!rating || rating < 1 || rating > 5) {
        throw new Error('Rating must be between 1 and 5');
    }
    const review = await CustomerService.createShopReview(userId, shopId, rating, comment);
    res.json(review);
});
