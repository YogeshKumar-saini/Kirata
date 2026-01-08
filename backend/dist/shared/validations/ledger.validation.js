"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.recordSaleSchema = void 0;
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
exports.recordSaleSchema = zod_1.z.object({
    body: zod_1.z.object({
        amount: zod_1.z.number().positive(),
        paymentType: zod_1.z.nativeEnum(client_1.PaymentType),
        source: zod_1.z.nativeEnum(client_1.SaleSource),
        customerId: zod_1.z.string().uuid().optional(),
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
