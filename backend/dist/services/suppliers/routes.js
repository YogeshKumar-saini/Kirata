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
const SupplierService = __importStar(require("./service"));
const ShopService = __importStar(require("../shops/service"));
const router = (0, express_1.Router)();
router.use((0, middleware_1.authMiddleware)(['SHOPKEEPER']));
const requireShop = (0, asyncHandler_1.asyncHandler)(async (req, res, next) => {
    const { userId } = req.user;
    const shop = await ShopService.getShopByOwnerId(userId);
    if (!shop)
        throw new ApiError_1.ApiError(404, 'Shop not found');
    req.shopId = shop.shopId;
    next();
});
router.use(requireShop);
router.post('/', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const shopId = req.shopId;
    // Basic validation inline for now or use Zod if strict
    if (!req.body.name)
        throw new ApiError_1.ApiError(400, 'Name is required');
    const supplier = await SupplierService.createSupplier(shopId, req.body);
    res.status(201).json(supplier);
}));
router.get('/', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const shopId = req.shopId;
    const suppliers = await SupplierService.getSuppliers(shopId);
    res.json(suppliers);
}));
// Get supplier by ID
router.get('/:id', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const shopId = req.shopId;
    const supplier = await SupplierService.getSupplierById(req.params.id, shopId);
    if (!supplier) {
        throw new ApiError_1.ApiError(404, 'Supplier not found');
    }
    res.json(supplier);
}));
// Update supplier
router.patch('/:id', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const shopId = req.shopId;
    const supplier = await SupplierService.updateSupplier(req.params.id, shopId, req.body);
    res.json(supplier);
}));
// Delete supplier
router.delete('/:id', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const shopId = req.shopId;
    await SupplierService.deleteSupplier(req.params.id, shopId);
    res.json({ message: 'Supplier deleted successfully' });
}));
exports.default = router;
