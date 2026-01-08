import { Router } from 'express';
import { authMiddleware } from '../../auth/middleware';
import { asyncHandler } from '../../shared/middlewares/asyncHandler';
import { ApiError } from '../../shared/errors/ApiError';
import * as SupplierService from './service';
import * as ShopService from '../shops/service';

const router = Router();

router.use(authMiddleware(['SHOPKEEPER']));

const requireShop = asyncHandler(async (req, res, next) => {
    const { userId } = (req as any).user;
    const shop = await ShopService.getShopByOwnerId(userId);
    if (!shop) throw new ApiError(404, 'Shop not found');
    (req as any).shopId = shop.shopId;
    next();
});

router.use(requireShop);

router.post('/', asyncHandler(async (req, res) => {
    const shopId = (req as any).shopId;
    // Basic validation inline for now or use Zod if strict
    if (!req.body.name) throw new ApiError(400, 'Name is required');

    const supplier = await SupplierService.createSupplier(shopId, req.body);
    res.status(201).json(supplier);
}));

router.get('/', asyncHandler(async (req, res) => {
    const shopId = (req as any).shopId;
    const suppliers = await SupplierService.getSuppliers(shopId);
    res.json(suppliers);
}));

// Get supplier by ID
router.get('/:id', asyncHandler(async (req, res) => {
    const shopId = (req as any).shopId;
    const supplier = await SupplierService.getSupplierById(req.params.id, shopId);

    if (!supplier) {
        throw new ApiError(404, 'Supplier not found');
    }

    res.json(supplier);
}));

// Update supplier
router.patch('/:id', asyncHandler(async (req, res) => {
    const shopId = (req as any).shopId;
    const supplier = await SupplierService.updateSupplier(
        req.params.id,
        shopId,
        req.body
    );
    res.json(supplier);
}));

// Delete supplier
router.delete('/:id', asyncHandler(async (req, res) => {
    const shopId = (req as any).shopId;
    await SupplierService.deleteSupplier(req.params.id, shopId);
    res.json({ message: 'Supplier deleted successfully' });
}));

export default router;
