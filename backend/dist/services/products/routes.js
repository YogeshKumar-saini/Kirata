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
const validate_middleware_1 = require("../../shared/middlewares/validate.middleware");
const product_validation_1 = require("../../shared/validations/product.validation");
const upload_middleware_1 = require("../../shared/middlewares/upload.middleware");
const ProductService = __importStar(require("./service"));
const VariantService = __importStar(require("./variant.service"));
const ShopService = __importStar(require("../shops/service"));
const UploadService = __importStar(require("./upload.service"));
const router = (0, express_1.Router)();
// Protect all routes with Shopkeeper authentication
router.use((0, middleware_1.authMiddleware)(['SHOPKEEPER']));
// Ensure user has a shop before allowing product operations
const requireShop = (0, asyncHandler_1.asyncHandler)(async (req, res, next) => {
    const { userId } = req.user;
    const shop = await ShopService.getShopByOwnerId(userId);
    if (!shop) {
        throw new ApiError_1.ApiError(404, 'You must create a shop before managing products.');
    }
    req.shopId = shop.shopId;
    next();
});
router.use(requireShop);
// Bulk Upload Products
router.post('/bulk-upload', upload_middleware_1.csvUpload.single('file'), (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const shopId = req.shopId;
    if (!req.file) {
        throw new ApiError_1.ApiError(400, 'No CSV file uploaded');
    }
    const result = await UploadService.processBulkImport(req.file.path, shopId);
    // Determine response status based on partial success
    const status = result.success > 0 ? 200 : 400;
    res.status(status).json({
        message: `Import processed. Success: ${result.success}, Failed: ${result.failed}`,
        details: result
    });
}));
// Get Low Stock Products
router.get('/low-stock', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const shopId = req.shopId;
    const products = await ProductService.getLowStockProducts(shopId);
    res.json(products);
}));
// Create Product
router.post('/', (0, validate_middleware_1.validate)(product_validation_1.createProductSchema), (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const shopId = req.shopId;
    const product = await ProductService.createProduct(shopId, req.body);
    res.status(201).json(product);
}));
// List Products
router.get('/', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const shopId = req.shopId;
    const { category, search, active, page, limit } = req.query;
    const pageNum = page ? parseInt(page) : 1;
    const limitNum = limit ? parseInt(limit) : 20;
    const result = await ProductService.getShopProducts(shopId, {
        category: category,
        search: search,
        isActive: active === 'true' ? true : (active === 'false' ? false : undefined)
    }, pageNum, limitNum);
    res.json(result);
}));
// Get Product by ID
router.get('/:id', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const shopId = req.shopId;
    const product = await ProductService.getProductById(req.params.id, shopId);
    if (!product) {
        throw new ApiError_1.ApiError(404, 'Product not found');
    }
    res.json(product);
}));
// Update Product
router.patch('/:id', (0, validate_middleware_1.validate)(product_validation_1.updateProductSchema), (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const shopId = req.shopId;
    const product = await ProductService.updateProduct(req.params.id, shopId, req.body);
    res.json(product);
}));
// Delete Product
router.delete('/:id', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const shopId = req.shopId;
    await ProductService.deleteProduct(req.params.id, shopId);
    res.json({ message: 'Product deleted successfully' });
}));
// ===== VARIANT ROUTES =====
// Create Variant
router.post('/:productId/variants', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const shopId = req.shopId;
    const { productId } = req.params;
    const variant = await VariantService.addVariant(productId, shopId, req.body);
    res.status(201).json(variant);
}));
// List Variants for a Product
router.get('/:productId/variants', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const shopId = req.shopId;
    const { productId } = req.params;
    const variants = await VariantService.getVariants(productId, shopId);
    res.json(variants);
}));
// Get Variant by ID
router.get('/variants/:variantId', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const shopId = req.shopId;
    const { variantId } = req.params;
    const variant = await VariantService.getVariantById(variantId, shopId);
    res.json(variant);
}));
// Update Variant
router.patch('/variants/:variantId', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const shopId = req.shopId;
    const { variantId } = req.params;
    const variant = await VariantService.updateVariant(variantId, shopId, req.body);
    res.json(variant);
}));
// Delete Variant
router.delete('/variants/:variantId', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const shopId = req.shopId;
    const { variantId } = req.params;
    await VariantService.deleteVariant(variantId, shopId);
    res.json({ message: 'Variant deleted successfully' });
}));
exports.default = router;
