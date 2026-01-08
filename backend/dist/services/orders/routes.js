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
const order_validation_1 = require("../../shared/validations/order.validation");
const OrderService = __importStar(require("./service"));
const ApiError_1 = require("../../shared/errors/ApiError");
const zod_1 = require("zod");
const router = (0, express_1.Router)();
const updateOrderSchema = zod_1.z.object({
    body: zod_1.z.object({
        items: zod_1.z.array(zod_1.z.object({
            name: zod_1.z.string(),
            quantity: zod_1.z.number().positive(),
            price: zod_1.z.number().min(0)
        })),
        status: zod_1.z.string().optional()
    })
});
// Create order
router.post('/', (0, middleware_1.authMiddleware)(['CUSTOMER', 'SHOPKEEPER']), (0, validate_middleware_1.validate)(order_validation_1.createOrderSchema), (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    // If shopkeeper, customerId must be in body. If customer, get from token.
    const user = req.user;
    let customerId = user.userId;
    if (user.role === 'SHOPKEEPER') {
        if (!req.body.customerId) {
            throw new ApiError_1.ApiError(400, 'Customer ID is required when creating order as Shopkeeper');
        }
        customerId = req.body.customerId;
    }
    const { shopId, items, offerCode, paymentPreference, fulfillmentMethod } = req.body;
    const order = await OrderService.createOrder(shopId, customerId, items, offerCode, paymentPreference, fulfillmentMethod);
    res.status(201).json(order);
}));
router.get('/my', (0, middleware_1.authMiddleware)(['CUSTOMER']), (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { userId } = req.user;
    const orders = await OrderService.getOrdersByCustomer(userId);
    res.json(orders);
}));
// Shopkeeper Routes - Get orders for my shop
router.get('/shop/my', (0, middleware_1.authMiddleware)(['SHOPKEEPER']), (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { userId } = req.user;
    // Get shop for this shopkeeper
    const ShopService = await Promise.resolve().then(() => __importStar(require('../shops/service')));
    const shop = await ShopService.getShopByOwnerId(userId);
    if (!shop) {
        throw new ApiError_1.ApiError(404, 'No shop found');
    }
    const orders = await OrderService.getOrdersByShop(shop.shopId);
    res.json(orders);
}));
// Get order by ID (Customer or Shopkeeper)
router.get('/:orderId', (0, middleware_1.authMiddleware)(['CUSTOMER', 'SHOPKEEPER']), (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { orderId } = req.params;
    const { userId, role } = req.user;
    const order = await OrderService.getOrderById(orderId);
    if (!order) {
        throw new ApiError_1.ApiError(404, 'Order not found');
    }
    // Verify access: customer must own the order, shopkeeper must own the shop
    if (role === 'CUSTOMER' && order.customerId !== userId) {
        throw new ApiError_1.ApiError(403, 'Access denied');
    }
    if (role === 'SHOPKEEPER') {
        const ShopService = await Promise.resolve().then(() => __importStar(require('../shops/service')));
        const shop = await ShopService.getShopByOwnerId(userId);
        if (!shop || order.shopId !== shop.shopId) {
            throw new ApiError_1.ApiError(403, 'Access denied');
        }
    }
    res.json(order);
}));
// Shopkeeper/Admin Routes
router.patch('/:orderId/status', (0, middleware_1.authMiddleware)(['CUSTOMER', 'SHOPKEEPER', 'SUPER_ADMIN', 'SHOP_MANAGER_ADMIN']), (0, validate_middleware_1.validate)(order_validation_1.updateOrderStatusSchema), (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { orderId } = req.params;
    const { status } = req.body;
    const { userId, role } = req.user;
    const order = await OrderService.getOrderById(orderId);
    if (!order) {
        throw new ApiError_1.ApiError(404, 'Order not found');
    }
    // Customer can only cancel their own PENDING orders
    if (role === 'CUSTOMER') {
        if (order.customerId !== userId) {
            throw new ApiError_1.ApiError(403, 'You can only manage your own orders');
        }
        if (status !== 'CANCELLED') {
            throw new ApiError_1.ApiError(403, 'Customers can only cancel orders');
        }
        if (order.status !== 'PENDING') {
            throw new ApiError_1.ApiError(400, 'Orders can only be cancelled while PENDING');
        }
    }
    // Verify shopkeeper owns the shop of this order
    if (role === 'SHOPKEEPER') {
        const ShopService = await Promise.resolve().then(() => __importStar(require('../shops/service')));
        const shop = await ShopService.getShopByOwnerId(userId);
        if (!shop || order.shopId !== shop.shopId) {
            throw new ApiError_1.ApiError(403, 'Access denied. You can only update orders for your own shop.');
        }
    }
    const updatedOrder = await OrderService.updateOrderStatus(orderId, status);
    res.json(updatedOrder);
}));
router.put('/:orderId', (0, middleware_1.authMiddleware)(['SHOPKEEPER', 'SUPER_ADMIN', 'SHOP_MANAGER_ADMIN']), (0, validate_middleware_1.validate)(updateOrderSchema), (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { orderId } = req.params;
    const { items, status } = req.body;
    const { userId, role } = req.user;
    const order = await OrderService.getOrderById(orderId);
    if (!order) {
        throw new ApiError_1.ApiError(404, 'Order not found');
    }
    // Verify shopkeeper owns the shop of this order
    if (role === 'SHOPKEEPER') {
        const ShopService = await Promise.resolve().then(() => __importStar(require('../shops/service')));
        const shop = await ShopService.getShopByOwnerId(userId);
        if (!shop || order.shopId !== shop.shopId) {
            throw new ApiError_1.ApiError(403, 'Access denied. You can only update orders for your own shop.');
        }
    }
    const updatedOrder = await OrderService.updateOrderItems(orderId, items, status);
    res.json(updatedOrder);
}));
// Verify order prices (Shopkeeper only)
router.post('/:orderId/verify-price', (0, middleware_1.authMiddleware)(['SHOPKEEPER']), (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { orderId } = req.params;
    const { userId } = req.user;
    const order = await OrderService.getOrderById(orderId);
    if (!order) {
        throw new ApiError_1.ApiError(404, 'Order not found');
    }
    // Verify shopkeeper owns the shop
    const ShopService = await Promise.resolve().then(() => __importStar(require('../shops/service')));
    const shop = await ShopService.getShopByOwnerId(userId);
    if (!shop || order.shopId !== shop.shopId) {
        throw new ApiError_1.ApiError(403, 'Access denied. You can only verify orders for your own shop.');
    }
    // Only allow verification for PENDING orders
    if (order.status !== 'PENDING') {
        throw new ApiError_1.ApiError(400, 'Only pending orders can have prices verified');
    }
    // Mark as verified
    const verified = await OrderService.verifyOrderPrice(orderId, userId);
    res.json(verified);
}));
exports.default = router;
