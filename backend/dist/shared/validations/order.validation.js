"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateOrderStatusSchema = exports.createOrderSchema = void 0;
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
exports.createOrderSchema = zod_1.z.object({
    body: zod_1.z.object({
        shopId: zod_1.z.string().uuid(),
        items: zod_1.z.array(zod_1.z.object({
            productId: zod_1.z.string().uuid().optional(),
            name: zod_1.z.string(),
            quantity: zod_1.z.number().int().positive(),
            price: zod_1.z.number().min(0).optional()
        })),
        customerId: zod_1.z.string().uuid().optional(), // For shopkeeper created orders
        offerCode: zod_1.z.string().optional(),
        paymentPreference: zod_1.z.enum(['CASH', 'UPI', 'UDHAAR']).optional(),
        fulfillmentMethod: zod_1.z.enum(['PICKUP', 'DELIVERY']).optional()
    }),
});
exports.updateOrderStatusSchema = zod_1.z.object({
    body: zod_1.z.object({
        status: zod_1.z.nativeEnum(client_1.OrderStatus),
    }),
    params: zod_1.z.object({
        orderId: zod_1.z.string().uuid(),
    }),
});
