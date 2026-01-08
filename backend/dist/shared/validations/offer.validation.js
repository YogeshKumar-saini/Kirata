"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateOfferSchema = exports.createOfferSchema = void 0;
const zod_1 = require("zod");
exports.createOfferSchema = zod_1.z.object({
    body: zod_1.z.object({
        code: zod_1.z.string().min(3, "Code must be at least 3 characters").max(20, "Code too long").regex(/^[A-Z0-9]+$/, "Code must be uppercase alphanumeric"),
        type: zod_1.z.enum(['PERCENTAGE', 'FLAT']),
        value: zod_1.z.number().min(0, "Value must be positive"),
        description: zod_1.z.string().optional(),
        minOrderValue: zod_1.z.number().min(0).optional(),
        maxDiscount: zod_1.z.number().min(0).optional(),
        usageLimit: zod_1.z.number().int().min(1).optional(),
        validFrom: zod_1.z.string().datetime().optional(), // Expect ISO string
        validTo: zod_1.z.string().datetime().optional()
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
exports.validateOfferSchema = zod_1.z.object({
    body: zod_1.z.object({
        code: zod_1.z.string(),
        cartValue: zod_1.z.number().min(0)
    })
});
