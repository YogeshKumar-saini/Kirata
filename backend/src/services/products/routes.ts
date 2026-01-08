import { Router } from 'express';
import { authMiddleware } from '../../auth/middleware';
import { asyncHandler } from '../../shared/middlewares/asyncHandler';
import { ApiError } from '../../shared/errors/ApiError';
import { validate } from '../../shared/middlewares/validate.middleware';
import { createProductSchema, updateProductSchema } from '../../shared/validations/product.validation';
import { csvUpload } from '../../shared/middlewares/upload.middleware';
import * as ProductService from './service';
import * as VariantService from './variant.service';
import * as ShopService from '../shops/service';
import * as UploadService from './upload.service';

const router = Router();

// Protect all routes with Shopkeeper authentication
router.use(authMiddleware(['SHOPKEEPER']));

// Ensure user has a shop before allowing product operations
const requireShop = asyncHandler(async (req, res, next) => {
    const { userId } = (req as any).user;
    const shop = await ShopService.getShopByOwnerId(userId);

    if (!shop) {
        throw new ApiError(404, 'You must create a shop before managing products.');
    }

    (req as any).shopId = shop.shopId;
    next();
});

router.use(requireShop);

// Bulk Upload Products
router.post('/bulk-upload', csvUpload.single('file'), asyncHandler(async (req, res) => {
    const shopId = (req as any).shopId;
    if (!req.file) {
        throw new ApiError(400, 'No CSV file uploaded');
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
router.get('/low-stock', asyncHandler(async (req, res) => {
    const shopId = (req as any).shopId;
    const products = await ProductService.getLowStockProducts(shopId);
    res.json(products);
}));

// Create Product
router.post('/', validate(createProductSchema), asyncHandler(async (req, res) => {
    const shopId = (req as any).shopId;
    const product = await ProductService.createProduct(shopId, req.body);
    res.status(201).json(product);
}));

// List Products
router.get('/', asyncHandler(async (req, res) => {
    const shopId = (req as any).shopId;
    const { category, search, active, page, limit } = req.query;

    const pageNum = page ? parseInt(page as string) : 1;
    const limitNum = limit ? parseInt(limit as string) : 20;

    const result = await ProductService.getShopProducts(shopId, {
        category: category as string,
        search: search as string,
        isActive: active === 'true' ? true : (active === 'false' ? false : undefined)
    }, pageNum, limitNum);

    res.json(result);
}));

// Get Product by ID
router.get('/:id', asyncHandler(async (req, res) => {
    const shopId = (req as any).shopId;
    const product = await ProductService.getProductById(req.params.id, shopId);

    if (!product) {
        throw new ApiError(404, 'Product not found');
    }

    res.json(product);
}));

// Update Product
router.patch('/:id', validate(updateProductSchema), asyncHandler(async (req, res) => {
    const shopId = (req as any).shopId;
    const product = await ProductService.updateProduct(req.params.id, shopId, req.body);
    res.json(product);
}));

// Delete Product
router.delete('/:id', asyncHandler(async (req, res) => {
    const shopId = (req as any).shopId;
    await ProductService.deleteProduct(req.params.id, shopId);
    res.json({ message: 'Product deleted successfully' });
}));

// ===== VARIANT ROUTES =====

// Create Variant
router.post('/:productId/variants', asyncHandler(async (req, res) => {
    const shopId = (req as any).shopId;
    const { productId } = req.params;

    const variant = await VariantService.addVariant(productId, shopId, req.body);
    res.status(201).json(variant);
}));

// List Variants for a Product
router.get('/:productId/variants', asyncHandler(async (req, res) => {
    const shopId = (req as any).shopId;
    const { productId } = req.params;

    const variants = await VariantService.getVariants(productId, shopId);
    res.json(variants);
}));

// Get Variant by ID
router.get('/variants/:variantId', asyncHandler(async (req, res) => {
    const shopId = (req as any).shopId;
    const { variantId } = req.params;

    const variant = await VariantService.getVariantById(variantId, shopId);
    res.json(variant);
}));

// Update Variant
router.patch('/variants/:variantId', asyncHandler(async (req, res) => {
    const shopId = (req as any).shopId;
    const { variantId } = req.params;

    const variant = await VariantService.updateVariant(variantId, shopId, req.body);
    res.json(variant);
}));

// Delete Variant
router.delete('/variants/:variantId', asyncHandler(async (req, res) => {
    const shopId = (req as any).shopId;
    const { variantId } = req.params;

    await VariantService.deleteVariant(variantId, shopId);
    res.json({ message: 'Variant deleted successfully' });
}));

export default router;
