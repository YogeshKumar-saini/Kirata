import { Router } from 'express';
import { validate } from '../../shared/middlewares/validate.middleware';
import { asyncHandler } from '../../shared/middlewares/asyncHandler';
import { authMiddleware } from '../../auth/middleware';
import { createOrderSchema, updateOrderStatusSchema } from '../../shared/validations/order.validation';
import * as OrderService from './service';
import { ApiError } from '../../shared/errors/ApiError';
import { z } from 'zod';

const router = Router();

const updateOrderSchema = z.object({
    body: z.object({
        items: z.array(z.object({
            name: z.string(),
            quantity: z.number().positive(),
            price: z.number().min(0)
        })),
        status: z.string().optional()
    })
});

// Create order
router.post('/', authMiddleware(['CUSTOMER', 'SHOPKEEPER']), validate(createOrderSchema), asyncHandler(async (req, res) => {
    // If shopkeeper, customerId must be in body. If customer, get from token.
    const user = (req as any).user;
    let customerId = user.userId;

    if (user.role === 'SHOPKEEPER') {
        if (!req.body.customerId) {
            throw new ApiError(400, 'Customer ID is required when creating order as Shopkeeper');
        }
        customerId = req.body.customerId;
    }

    const { shopId, items, offerCode, paymentPreference, fulfillmentMethod } = req.body;
    const order = await OrderService.createOrder(
        shopId,
        customerId,
        items,
        offerCode,
        paymentPreference,
        fulfillmentMethod
    );
    res.status(201).json(order);
}));

router.get('/my', authMiddleware(['CUSTOMER']), asyncHandler(async (req, res) => {
    const { userId } = (req as any).user;
    const orders = await OrderService.getOrdersByCustomer(userId);
    res.json(orders);
}));

// Shopkeeper Routes - Get orders for my shop
router.get('/shop/my', authMiddleware(['SHOPKEEPER']), asyncHandler(async (req, res) => {
    const { userId } = (req as any).user;

    // Get shop for this shopkeeper
    const ShopService = await import('../shops/service');
    const shop = await ShopService.getShopByOwnerId(userId);

    if (!shop) {
        throw new ApiError(404, 'No shop found');
    }

    const orders = await OrderService.getOrdersByShop(shop.shopId);
    res.json(orders);
}));

// Get order by ID (Customer or Shopkeeper)
router.get('/:orderId', authMiddleware(['CUSTOMER', 'SHOPKEEPER']), asyncHandler(async (req, res) => {
    const { orderId } = req.params;
    const { userId, role } = (req as any).user;

    const order = await OrderService.getOrderById(orderId);

    if (!order) {
        throw new ApiError(404, 'Order not found');
    }

    // Verify access: customer must own the order, shopkeeper must own the shop
    if (role === 'CUSTOMER' && order.customerId !== userId) {
        throw new ApiError(403, 'Access denied');
    }

    if (role === 'SHOPKEEPER') {
        const ShopService = await import('../shops/service');
        const shop = await ShopService.getShopByOwnerId(userId);
        if (!shop || order.shopId !== shop.shopId) {
            throw new ApiError(403, 'Access denied');
        }
    }

    res.json(order);
}));

// Shopkeeper/Admin Routes
router.patch('/:orderId/status', authMiddleware(['CUSTOMER', 'SHOPKEEPER', 'SUPER_ADMIN', 'SHOP_MANAGER_ADMIN']), validate(updateOrderStatusSchema), asyncHandler(async (req, res) => {
    const { orderId } = req.params;
    const { status } = req.body;
    const { userId, role } = (req as any).user;

    const order = await OrderService.getOrderById(orderId);
    if (!order) {
        throw new ApiError(404, 'Order not found');
    }

    // Customer can only cancel their own PENDING orders
    if (role === 'CUSTOMER') {
        if (order.customerId !== userId) {
            throw new ApiError(403, 'You can only manage your own orders');
        }
        if (status !== 'CANCELLED') {
            throw new ApiError(403, 'Customers can only cancel orders');
        }
        if (order.status !== 'PENDING') {
            throw new ApiError(400, 'Orders can only be cancelled while PENDING');
        }
    }

    // Verify shopkeeper owns the shop of this order
    if (role === 'SHOPKEEPER') {
        const ShopService = await import('../shops/service');
        const shop = await ShopService.getShopByOwnerId(userId);

        if (!shop || order.shopId !== shop.shopId) {
            throw new ApiError(403, 'Access denied. You can only update orders for your own shop.');
        }
    }

    const updatedOrder = await OrderService.updateOrderStatus(orderId, status);
    res.json(updatedOrder);
}));

router.put('/:orderId', authMiddleware(['SHOPKEEPER', 'SUPER_ADMIN', 'SHOP_MANAGER_ADMIN']), validate(updateOrderSchema), asyncHandler(async (req, res) => {
    const { orderId } = req.params;
    const { items, status } = req.body;
    const { userId, role } = (req as any).user;

    const order = await OrderService.getOrderById(orderId);
    if (!order) {
        throw new ApiError(404, 'Order not found');
    }

    // Verify shopkeeper owns the shop of this order
    if (role === 'SHOPKEEPER') {
        const ShopService = await import('../shops/service');
        const shop = await ShopService.getShopByOwnerId(userId);

        if (!shop || order.shopId !== shop.shopId) {
            throw new ApiError(403, 'Access denied. You can only update orders for your own shop.');
        }
    }

    const updatedOrder = await OrderService.updateOrderItems(orderId, items, status);
    res.json(updatedOrder);
}));

// Verify order prices (Shopkeeper only)
router.post('/:orderId/verify-price', authMiddleware(['SHOPKEEPER']), asyncHandler(async (req, res) => {
    const { orderId } = req.params;
    const { userId } = (req as any).user;

    const order = await OrderService.getOrderById(orderId);
    if (!order) {
        throw new ApiError(404, 'Order not found');
    }

    // Verify shopkeeper owns the shop
    const ShopService = await import('../shops/service');
    const shop = await ShopService.getShopByOwnerId(userId);

    if (!shop || order.shopId !== shop.shopId) {
        throw new ApiError(403, 'Access denied. You can only verify orders for your own shop.');
    }

    // Only allow verification for PENDING orders
    if (order.status !== 'PENDING') {
        throw new ApiError(400, 'Only pending orders can have prices verified');
    }

    // Mark as verified
    const verified = await OrderService.verifyOrderPrice(orderId, userId);
    res.json(verified);
}));

export default router;
