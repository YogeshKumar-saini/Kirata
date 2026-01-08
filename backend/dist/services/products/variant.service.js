"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adjustVariantStock = exports.deleteVariant = exports.updateVariant = exports.getVariantById = exports.getVariants = exports.addVariant = void 0;
const database_1 = require("../../shared/database");
const ApiError_1 = require("../../shared/errors/ApiError");
/**
 * Add a new variant to a product
 */
const addVariant = async (productId, shopId, data) => {
    // Verify product exists and belongs to shop
    const product = await database_1.prisma.product.findFirst({
        where: {
            productId,
            shopId,
            deletedAt: null
        }
    });
    if (!product) {
        throw new ApiError_1.ApiError(404, 'Product not found');
    }
    // Validate data
    if (data.price <= 0) {
        throw new ApiError_1.ApiError(400, 'Price must be greater than 0');
    }
    if (data.stock < 0) {
        throw new ApiError_1.ApiError(400, 'Stock cannot be negative');
    }
    // Check for duplicate SKU if provided
    if (data.sku) {
        const existing = await database_1.prisma.productVariant.findFirst({
            where: { sku: data.sku }
        });
        if (existing) {
            throw new ApiError_1.ApiError(400, 'SKU already exists');
        }
    }
    // Create variant
    return database_1.prisma.productVariant.create({
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
exports.addVariant = addVariant;
/**
 * Get all variants for a product
 */
const getVariants = async (productId, shopId) => {
    // Verify product belongs to shop
    const product = await database_1.prisma.product.findFirst({
        where: {
            productId,
            shopId,
            deletedAt: null
        }
    });
    if (!product) {
        throw new ApiError_1.ApiError(404, 'Product not found');
    }
    return database_1.prisma.productVariant.findMany({
        where: { productId },
        orderBy: { variantId: 'asc' }
    });
};
exports.getVariants = getVariants;
/**
 * Get a single variant by ID
 */
const getVariantById = async (variantId, shopId) => {
    const variant = await database_1.prisma.productVariant.findUnique({
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
        throw new ApiError_1.ApiError(404, 'Variant not found');
    }
    return variant;
};
exports.getVariantById = getVariantById;
/**
 * Update a variant
 */
const updateVariant = async (variantId, shopId, data) => {
    // Verify variant exists and belongs to shop
    const variant = await (0, exports.getVariantById)(variantId, shopId);
    // Validate data
    if (data.price !== undefined && data.price <= 0) {
        throw new ApiError_1.ApiError(400, 'Price must be greater than 0');
    }
    if (data.stock !== undefined && data.stock < 0) {
        throw new ApiError_1.ApiError(400, 'Stock cannot be negative');
    }
    // Check for duplicate SKU if changing
    if (data.sku && data.sku !== variant.sku) {
        const existing = await database_1.prisma.productVariant.findFirst({
            where: { sku: data.sku }
        });
        if (existing) {
            throw new ApiError_1.ApiError(400, 'SKU already exists');
        }
    }
    // Update variant
    return database_1.prisma.productVariant.update({
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
exports.updateVariant = updateVariant;
/**
 * Delete a variant
 */
const deleteVariant = async (variantId, shopId) => {
    // Verify variant exists and belongs to shop
    await (0, exports.getVariantById)(variantId, shopId);
    // For now, just delete the variant
    // In production, you might want to check for references in orders
    return database_1.prisma.productVariant.delete({
        where: { variantId }
    });
};
exports.deleteVariant = deleteVariant;
/**
 * Adjust variant stock
 */
const adjustVariantStock = async (variantId, quantity) => {
    const variant = await database_1.prisma.productVariant.findUnique({
        where: { variantId }
    });
    if (!variant) {
        throw new ApiError_1.ApiError(404, 'Variant not found');
    }
    const newStock = variant.stock + quantity;
    if (newStock < 0) {
        throw new ApiError_1.ApiError(400, 'Insufficient stock');
    }
    return database_1.prisma.productVariant.update({
        where: { variantId },
        data: { stock: newStock }
    });
};
exports.adjustVariantStock = adjustVariantStock;
