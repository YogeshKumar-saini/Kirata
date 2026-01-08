import { z } from 'zod';
import { OrderStatus } from '@prisma/client';

export const createOrderSchema = z.object({
    body: z.object({
        shopId: z.string().uuid(),
        items: z.array(z.object({
            productId: z.string().uuid().optional(),
            name: z.string(),
            quantity: z.number().int().positive(),
            price: z.number().min(0).optional()
        })),
        customerId: z.string().uuid().optional(), // For shopkeeper created orders
        offerCode: z.string().optional(),
        paymentPreference: z.enum(['CASH', 'UPI', 'UDHAAR']).optional(),
        fulfillmentMethod: z.enum(['PICKUP', 'DELIVERY']).optional()
    }),
});

export const updateOrderStatusSchema = z.object({
    body: z.object({
        status: z.nativeEnum(OrderStatus),
    }),
    params: z.object({
        orderId: z.string().uuid(),
    }),
});
