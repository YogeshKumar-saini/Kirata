import { z } from 'zod';

export const createOfferSchema = z.object({
    body: z.object({
        code: z.string().min(3, "Code must be at least 3 characters").max(20, "Code too long").regex(/^[A-Z0-9]+$/, "Code must be uppercase alphanumeric"),
        type: z.enum(['PERCENTAGE', 'FLAT']),
        value: z.number().min(0, "Value must be positive"),
        description: z.string().optional(),
        minOrderValue: z.number().min(0).optional(),
        maxDiscount: z.number().min(0).optional(),
        usageLimit: z.number().int().min(1).optional(),
        validFrom: z.string().datetime().optional(), // Expect ISO string
        validTo: z.string().datetime().optional()
    }).refine((data) => {
        if (data.type === 'PERCENTAGE' && data.value > 100) {
            return false;
        }
        return true;
    }, {
        message: "Percentage discount cannot exceed 100%",
        path: ["value"]
    })
});

export const validateOfferSchema = z.object({
    body: z.object({
        code: z.string(),
        cartValue: z.number().min(0)
    })
});
