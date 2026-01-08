import { prisma } from '../../shared/database';
import { ApiError } from '../../shared/errors/ApiError';

export interface CreateVariantInput {
    name: string;
    sku?: string;
    price: number;
    mrp?: number;
    costPrice?: number;
    stock: number;
    unit?: string;
    unitValue?: number;
}

export interface UpdateVariantInput {
    name?: string;
    sku?: string;
    price?: number;
    mrp?: number;
    costPrice?: number;
    stock?: number;
    unit?: string;
    unitValue?: number;
    isActive?: boolean;
}

/**
 * Add a new variant to a product
 */
export const addVariant = async (
    productId: string,
    shopId: string,
    data: CreateVariantInput
) => {
    // Verify product exists and belongs to shop
    const product = await prisma.product.findFirst({
        where: {
            productId,
            shopId,
            deletedAt: null
        }
    });

    if (!product) {
        throw new ApiError(404, 'Product not found');
    }

    // Validate data
    if (data.price <= 0) {
        throw new ApiError(400, 'Price must be greater than 0');
    }

    if (data.stock < 0) {
        throw new ApiError(400, 'Stock cannot be negative');
    }

    // Check for duplicate SKU if provided
    if (data.sku) {
        const existing = await prisma.productVariant.findFirst({
            where: { sku: data.sku }
        });

        if (existing) {
            throw new ApiError(400, 'SKU already exists');
        }
    }

    // Create variant
    return prisma.productVariant.create({
        data: {
            productId,
            name: data.name,
            sku: data.sku,
            price: data.price,
            mrp: data.mrp,
            costPrice: data.costPrice,
            stock: data.stock,
            unit: data.unit,
            unitValue: data.unitValue
        }
    });
};

/**
 * Get all variants for a product
 */
export const getVariants = async (productId: string, shopId: string) => {
    // Verify product belongs to shop
    const product = await prisma.product.findFirst({
        where: {
            productId,
            shopId,
            deletedAt: null
        }
    });

    if (!product) {
        throw new ApiError(404, 'Product not found');
    }

    return prisma.productVariant.findMany({
        where: { productId },
        orderBy: { variantId: 'asc' }
    });
};

/**
 * Get a single variant by ID
 */
export const getVariantById = async (variantId: string, shopId: string) => {
    const variant = await prisma.productVariant.findUnique({
        where: { variantId },
        include: {
            product: {
                select: {
                    shopId: true,
                    name: true
                }
            }
        }
    });

    if (!variant || variant.product.shopId !== shopId) {
        throw new ApiError(404, 'Variant not found');
    }

    return variant;
};

/**
 * Update a variant
 */
export const updateVariant = async (
    variantId: string,
    shopId: string,
    data: UpdateVariantInput
) => {
    // Verify variant exists and belongs to shop
    const variant = await getVariantById(variantId, shopId);

    // Validate data
    if (data.price !== undefined && data.price <= 0) {
        throw new ApiError(400, 'Price must be greater than 0');
    }

    if (data.stock !== undefined && data.stock < 0) {
        throw new ApiError(400, 'Stock cannot be negative');
    }

    // Check for duplicate SKU if changing
    if (data.sku && data.sku !== variant.sku) {
        const existing = await prisma.productVariant.findFirst({
            where: { sku: data.sku }
        });

        if (existing) {
            throw new ApiError(400, 'SKU already exists');
        }
    }

    // Update variant
    return prisma.productVariant.update({
        where: { variantId },
        data: {
            name: data.name,
            sku: data.sku,
            price: data.price,
            mrp: data.mrp,
            costPrice: data.costPrice,
            stock: data.stock,
            unit: data.unit,
            unitValue: data.unitValue,
            isActive: data.isActive
        }
    });
};

/**
 * Delete a variant
 */
export const deleteVariant = async (variantId: string, shopId: string) => {
    // Verify variant exists and belongs to shop
    await getVariantById(variantId, shopId);

    // For now, just delete the variant
    // In production, you might want to check for references in orders
    return prisma.productVariant.delete({
        where: { variantId }
    });
};

/**
 * Adjust variant stock
 */
export const adjustVariantStock = async (
    variantId: string,
    quantity: number
) => {
    const variant = await prisma.productVariant.findUnique({
        where: { variantId }
    });

    if (!variant) {
        throw new ApiError(404, 'Variant not found');
    }

    const newStock = variant.stock + quantity;

    if (newStock < 0) {
        throw new ApiError(400, 'Insufficient stock');
    }

    return prisma.productVariant.update({
        where: { variantId },
        data: { stock: newStock }
    });
};
