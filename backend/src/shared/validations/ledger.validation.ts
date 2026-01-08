import { z } from 'zod';
import { PaymentType, SaleSource } from '@prisma/client';

export const recordSaleSchema = z.object({
    body: z.object({
        amount: z.number().positive(),
        paymentType: z.nativeEnum(PaymentType),
        source: z.nativeEnum(SaleSource),
        customerId: z.string().uuid().optional(),
    }).refine((data) => {
        if (data.paymentType === 'UDHAAR' && !data.customerId) {
            return false;
        }
        return true;
    }, {
        message: "Customer ID is required for UDHAAR payments",
        path: ["customerId"],
    }),
});

