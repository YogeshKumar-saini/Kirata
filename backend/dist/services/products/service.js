"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteProduct = exports.updateProduct = exports.getProductById = exports.getLowStockProducts = exports.getShopProducts = exports.createProduct = void 0;
const database_1 = require("../../shared/database");
const ApiError_1 = require("../../shared/errors/ApiError");
/**
 * Create a new product for a shop
 */
const createProduct = async (shopId, data) => {
    const { variants, ...productData } = data;
    return database_1.prisma.product.create({
        data: {
            shopId,
            ...productData,
            images: data.images, // Cast JSON array
            variants: variants ? {
                create: variants
            } : undefined
        },
        include: {
            variants: true
        }
    });
};
exports.createProduct = createProduct;
/**
 * Get all products for a shop with filters and pagination
 */
/**
 * Get all products for a shop with filters and pagination
 */
const getShopProducts = async (shopId, filters, page = 1, limit = 20) => {
    const where = {
        shopId,
        deletedAt: null
    };
    if (filters.isActive !== undefined) {
        where.isActive = filters.isActive;
    }
    if (filters.category) {
        where.category = filters.category;
    }
    if (filters.search) {
        where.OR = [
            { name: { contains: filters.search, mode: 'insensitive' } },
            { barcode: { contains: filters.search } }
        ];
    }
    const total = await database_1.prisma.product.count({ where });
    const totalPages = Math.ceil(total / limit);
    const products = await database_1.prisma.product.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
            variants: {
                where: { isActive: true }
            }
        }
    });
    return {
        products,
        meta: {
            total,
            page,
            limit,
            totalPages
        }
    };
};
exports.getShopProducts = getShopProducts;
/**
 * Get low stock products using raw query for column comparison
 */
const getLowStockProducts = async (shopId) => {
    // Prisma doesn't support "where column A <= column B" in generated types easily
    // So we use queryRaw for performance
    const products = await database_1.prisma.$queryRaw `
        SELECT * FROM "products"
        WHERE "shop_id" = ${shopId}
        AND "stock" <= "low_stock_threshold"
        AND "deleted_at" IS NULL
        AND "is_active" = true
        ORDER BY "stock" ASC
    `;
    return products;
};
exports.getLowStockProducts = getLowStockProducts;
/**
 * Get a single product by ID
 */
const getProductById = async (productId, shopId) => {
    const product = await database_1.prisma.product.findUnique({
        where: { productId },
        include: {
            variants: {
                where: { isActive: true }
            },
            supplier: true
        }
    });
    if (!product || product.shopId !== shopId || product.deletedAt) {
        return null;
    }
    return product;
};
exports.getProductById = getProductById;
/**
 * Update a product
 */
const updateProduct = async (productId, shopId, data) => {
    // Verify ownership
    const product = await (0, exports.getProductById)(productId, shopId);
    if (!product) {
        throw new ApiError_1.ApiError(404, 'Product not found');
    }
    const { variants, ...updateData } = data;
    // Handle variants update separately if needed
    // For now, allow simple addition/update of product level fields
    return database_1.prisma.product.update({
        where: { productId },
        data: {
            ...updateData,
            images: updateData.images,
            // Simple variant creation on update if provided
            variants: variants ? {
                create: variants
            } : undefined
        },
        include: {
            variants: true
        }
    });
};
exports.updateProduct = updateProduct;
/**
 * Soft delete a product
 */
const deleteProduct = async (productId, shopId) => {
    // Verify ownership
    const product = await (0, exports.getProductById)(productId, shopId);
    if (!product) {
        throw new ApiError_1.ApiError(404, 'Product not found');
    }
    return database_1.prisma.product.update({
        where: { productId },
        data: { deletedAt: new Date(), isActive: false }
    });
};
exports.deleteProduct = deleteProduct;
