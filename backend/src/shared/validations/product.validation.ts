import { z } from 'zod';

const variantSchema = z.object({
    name: z.string().min(1, "Variant name is required"),
    sku: z.string().optional(),
    price: z.number().min(0),
    mrp: z.number().min(0).optional(),
    costPrice: z.number().min(0).optional(),
    stock: z.number().int().min(0),
    unit: z.string().optional(),
    unitValue: z.number().optional()
});

export const createProductSchema = z.object({
    body: z.object({
        name: z.string().min(1, "Product name is required").max(100),
        description: z.string().optional(),
        price: z.number().min(0, "Price must be non-negative"),
        mrp: z.number().min(0, "MRP must be non-negative").optional(),
        costPrice: z.number().min(0).optional(),
        stock: z.number().int().min(0, "Stock must be a non-negative integer"),
        lowStockThreshold: z.number().int().optional(),
        category: z.string().optional(),
        imageUrl: z.string().url("Invalid image URL").optional(),
        images: z.array(z.string().url()).optional(),
        barcode: z.string().optional(),
        supplierId: z.string().uuid().optional(),
        variants: z.array(variantSchema).optional()
    })
});

export const updateProductSchema = z.object({
    body: z.object({
        name: z.string().min(1).max(100).optional(),
        description: z.string().optional(),
        price: z.number().min(0).optional(),
        mrp: z.number().min(0).optional(),
        costPrice: z.number().min(0).optional(),
        stock: z.number().int().min(0).optional(),
        lowStockThreshold: z.number().int().optional(),
        category: z.string().optional(),
        imageUrl: z.string().url().optional(),
        images: z.array(z.string().url()).optional(),
        barcode: z.string().optional(),
        isActive: z.boolean().optional(),
        supplierId: z.string().uuid().optional(),
        variants: z.array(variantSchema).optional()
    }),
    params: z.object({
        id: z.string().uuid("Invalid product ID")
    })
});
