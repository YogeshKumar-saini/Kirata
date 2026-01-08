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
const validate_middleware_1 = require("../../shared/middlewares/validate.middleware");
const asyncHandler_1 = require("../../shared/middlewares/asyncHandler");
const middleware_1 = require("../../auth/middleware");
const pin_auth_middleware_1 = require("../../shared/middlewares/pin-auth.middleware");
const ledger_validation_1 = require("../../shared/validations/ledger.validation");
const LedgerService = __importStar(require("./service"));
const ShopService = __importStar(require("../shops/service")); // To get shopId
const ApiError_1 = require("../../shared/errors/ApiError");
const router = (0, express_1.Router)();
// Shopkeeper Routes
router.post('/sale', (0, middleware_1.authMiddleware)(['SHOPKEEPER']), (0, validate_middleware_1.validate)(ledger_validation_1.recordSaleSchema), (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { amount, paymentType, source, customerId, notes, bypassCreditLimit } = req.body;
    const { userId } = req.user;
    // Get Shop ID for this shopkeeper
    const shopResult = await ShopService.getShopByOwnerId(userId);
    if (!shopResult)
        throw new ApiError_1.ApiError(404, 'Shop not found for this user');
    const sale = await LedgerService.recordSale(shopResult.shopId, amount, paymentType, source, customerId, notes, bypassCreditLimit);
    res.status(201).json(sale);
}));
router.get('/balance/:customerId', (0, middleware_1.authMiddleware)(['SHOPKEEPER']), (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { customerId } = req.params;
    const { userId } = req.user;
    const shopResult = await ShopService.getShopByOwnerId(userId);
    if (!shopResult)
        throw new ApiError_1.ApiError(404, 'Shop not found');
    const balance = await LedgerService.getCustomerBalance(shopResult.shopId, customerId);
    res.json({ balance });
}));
// Get all sales for shop with advanced filtering
router.get('/sales', (0, middleware_1.authMiddleware)(['SHOPKEEPER']), (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { userId } = req.user;
    const limit = req.query.limit ? parseInt(req.query.limit) : 100;
    const paymentType = req.query.paymentType;
    const customerId = req.query.customerId;
    const startDate = req.query.startDate;
    const endDate = req.query.endDate;
    const minAmount = req.query.minAmount ? parseFloat(req.query.minAmount) : undefined;
    const maxAmount = req.query.maxAmount ? parseFloat(req.query.maxAmount) : undefined;
    const groupBy = req.query.groupBy;
    const cursor = req.query.cursor;
    const search = req.query.search;
    const shopResult = await ShopService.getShopByOwnerId(userId);
    if (!shopResult)
        throw new ApiError_1.ApiError(404, 'Shop not found');
    const result = await LedgerService.getAllSales(shopResult.shopId, limit, {
        paymentType,
        customerId,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        minAmount,
        maxAmount,
        groupBy,
        cursor,
        search
    });
    res.json(result);
}));
// Get sales summary/analytics
router.get('/summary', (0, middleware_1.authMiddleware)(['SHOPKEEPER']), (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { userId } = req.user;
    const startDate = req.query.startDate;
    const endDate = req.query.endDate;
    const shopResult = await ShopService.getShopByOwnerId(userId);
    if (!shopResult)
        throw new ApiError_1.ApiError(404, 'Shop not found');
    const summary = await LedgerService.getSalesSummary(shopResult.shopId, {
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined
    });
    res.json(summary);
}));
// Get customer-specific transactions
router.get('/customer/:customerId/transactions', (0, middleware_1.authMiddleware)(['SHOPKEEPER']), (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { customerId } = req.params;
    const { userId } = req.user;
    const shopResult = await ShopService.getShopByOwnerId(userId);
    if (!shopResult)
        throw new ApiError_1.ApiError(404, 'Shop not found');
    const transactions = await LedgerService.getCustomerTransactions(shopResult.shopId, customerId);
    res.json(transactions);
}));
// Record payment against udhaar OR record new udhaar
router.post('/payment', (0, middleware_1.authMiddleware)(['SHOPKEEPER']), (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { customerId, amount, paymentMethod, notes } = req.body;
    const { userId } = req.user;
    const shopResult = await ShopService.getShopByOwnerId(userId);
    if (!shopResult)
        throw new ApiError_1.ApiError(404, 'Shop not found');
    // If payment method is UDHAAR, create a new sale with UDHAAR payment type
    if (paymentMethod === 'UDHAAR') {
        const sale = await LedgerService.recordSale(shopResult.shopId, amount, 'UDHAAR', 'MANUAL', customerId, notes);
        res.status(201).json(sale);
    }
    else {
        // Otherwise, record payment against existing udhaar
        try {
            const result = await LedgerService.recordPayment(shopResult.shopId, customerId, amount, paymentMethod, notes);
            res.status(201).json(result);
        }
        catch (error) {
            // If no outstanding udhaar, just record as a regular sale
            if (error.message && error.message.includes('No outstanding udhaar')) {
                const sale = await LedgerService.recordSale(shopResult.shopId, amount, paymentMethod, 'MANUAL', customerId, notes);
                res.status(201).json(sale);
            }
            else {
                throw error;
            }
        }
    }
}));
// Bulk update transactions
router.patch('/transaction/bulk', (0, middleware_1.authMiddleware)(['SHOPKEEPER']), pin_auth_middleware_1.verifyPinMiddleware, (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    try {
        const { saleIds, paymentType, tags } = req.body;
        const { userId } = req.user;
        if (!Array.isArray(saleIds) || saleIds.length === 0) {
            throw new ApiError_1.ApiError(400, 'No transaction IDs provided');
        }
        const shopResult = await ShopService.getShopByOwnerId(userId);
        if (!shopResult)
            throw new ApiError_1.ApiError(404, 'Shop not found');
        const result = await LedgerService.bulkUpdateTransactions(shopResult.shopId, {
            saleIds,
            paymentType,
            tags,
            userId
        });
        res.json({ success: true, count: result.count });
    }
    catch (error) {
        if (error instanceof ApiError_1.ApiError) {
            res.status(error.statusCode).json({ error: error.message });
        }
        else {
            console.error('Bulk update error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
}));
// Update transaction
router.patch('/transaction/:id', (0, middleware_1.authMiddleware)(['SHOPKEEPER']), (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const { amount, paymentType, notes, editReason } = req.body;
    const { userId } = req.user;
    const shopResult = await ShopService.getShopByOwnerId(userId);
    if (!shopResult)
        throw new ApiError_1.ApiError(404, 'Shop not found');
    const updated = await LedgerService.updateTransaction(id, shopResult.shopId, {
        amount,
        paymentType,
        notes,
        editReason,
        userId
    });
    res.json(updated);
}));
router.delete('/transaction/bulk', (0, middleware_1.authMiddleware)(['SHOPKEEPER']), pin_auth_middleware_1.verifyPinMiddleware, (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { userId } = req.user;
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
        throw new ApiError_1.ApiError(400, 'Invalid or empty IDs list');
    }
    const shopResult = await ShopService.getShopByOwnerId(userId);
    if (!shopResult)
        throw new ApiError_1.ApiError(404, 'Shop not found');
    const result = await LedgerService.deleteTransactions(ids, shopResult.shopId, userId);
    res.json(result);
}));
router.delete('/transaction/:id', (0, middleware_1.authMiddleware)(['SHOPKEEPER']), pin_auth_middleware_1.verifyPinMiddleware, (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const { userId } = req.user;
    const shopResult = await ShopService.getShopByOwnerId(userId);
    if (!shopResult)
        throw new ApiError_1.ApiError(404, 'Shop not found');
    const result = await LedgerService.deleteTransaction(id, shopResult.shopId, userId);
    res.json(result);
}));
// Export sales to Excel
router.get('/export/excel', (0, middleware_1.authMiddleware)(['SHOPKEEPER']), (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { userId } = req.user;
    const paymentType = req.query.paymentType;
    const customerId = req.query.customerId;
    const startDate = req.query.startDate;
    const endDate = req.query.endDate;
    const minAmount = req.query.minAmount ? parseFloat(req.query.minAmount) : undefined;
    const maxAmount = req.query.maxAmount ? parseFloat(req.query.maxAmount) : undefined;
    const ids = req.query.ids ? req.query.ids.split(',') : undefined;
    const shopResult = await ShopService.getShopByOwnerId(userId);
    if (!shopResult)
        throw new ApiError_1.ApiError(404, 'Shop not found');
    const buffer = await LedgerService.exportSalesToExcel(shopResult.shopId, {
        paymentType,
        customerId,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        minAmount,
        maxAmount,
        ids
    });
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=sales-export.xlsx');
    res.send(buffer);
}));
// Download Receipt PDF
router.get('/transaction/:id/receipt', (0, middleware_1.authMiddleware)(['SHOPKEEPER']), (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const { userId } = req.user;
    const shopResult = await ShopService.getShopByOwnerId(userId);
    if (!shopResult)
        throw new ApiError_1.ApiError(404, 'Shop not found');
    const pdfBuffer = await LedgerService.generateTransactionReceipt(shopResult.shopId, id);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=receipt-${id}.pdf`);
    res.send(pdfBuffer);
}));
// Customer Routes
router.get('/shop/:shopId/balance', (0, middleware_1.authMiddleware)(['CUSTOMER']), (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { shopId } = req.params;
    const { userId } = req.user;
    const balance = await LedgerService.getCustomerBalance(shopId, userId);
    res.json({ balance });
}));
exports.default = router;
