"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProductSchema = exports.createProductSchema = void 0;
const zod_1 = require("zod");
const variantSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, "Variant name is required"),
    sku: zod_1.z.string().optional(),
    price: zod_1.z.number().min(0),
    mrp: zod_1.z.number().min(0).optional(),
    costPrice: zod_1.z.number().min(0).optional(),
    stock: zod_1.z.number().int().min(0),
    unit: zod_1.z.string().optional(),
    unitValue: zod_1.z.number().optional()
});
exports.createProductSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(1, "Product name is required").max(100),
        description: zod_1.z.string().optional(),
        price: zod_1.z.number().min(0, "Price must be non-negative"),
        mrp: zod_1.z.number().min(0, "MRP must be non-negative").optional(),
        costPrice: zod_1.z.number().min(0).optional(),
        stock: zod_1.z.number().int().min(0, "Stock must be a non-negative integer"),
        lowStockThreshold: zod_1.z.number().int().optional(),
        category: zod_1.z.string().optional(),
        imageUrl: zod_1.z.string().url("Invalid image URL").optional(),
        images: zod_1.z.array(zod_1.z.string().url()).optional(),
        barcode: zod_1.z.string().optional(),
        supplierId: zod_1.z.string().uuid().optional(),
        variants: zod_1.z.array(variantSchema).optional()
    })
});
exports.updateProductSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(1).max(100).optional(),
        description: zod_1.z.string().optional(),
        price: zod_1.z.number().min(0).optional(),
        mrp: zod_1.z.number().min(0).optional(),
        costPrice: zod_1.z.number().min(0).optional(),
        stock: zod_1.z.number().int().min(0).optional(),
        lowStockThreshold: zod_1.z.number().int().optional(),
        category: zod_1.z.string().optional(),
        imageUrl: zod_1.z.string().url().optional(),
        images: zod_1.z.array(zod_1.z.string().url()).optional(),
        barcode: zod_1.z.string().optional(),
        isActive: zod_1.z.boolean().optional(),
        supplierId: zod_1.z.string().uuid().optional(),
        variants: zod_1.z.array(variantSchema).optional()
    }),
    params: zod_1.z.object({
        id: zod_1.z.string().uuid("Invalid product ID")
    })
});
