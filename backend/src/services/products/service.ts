import { prisma } from '../../shared/database';
import { ApiError } from '../../shared/errors/ApiError';
import { logger } from '../../shared/utils/logger';

export interface CreateProductVariantInput {
    name: string;
    sku?: string;
    price: number;
    mrp?: number;
    costPrice?: number;
    stock: number;
    unit?: string;
    unitValue?: number;
}

export interface CreateProductInput {
    name: string;
    description?: string;
    price: number;
    mrp?: number;
    costPrice?: number;
    stock: number;
    category?: string;
    imageUrl?: string;
    images?: string[];
    barcode?: string;
    supplierId?: string;
    lowStockThreshold?: number;
    variants?: CreateProductVariantInput[];
}

export interface UpdateProductInput extends Partial<CreateProductInput> {
    isActive?: boolean;
}

/**
 * Create a new product for a shop
 */
export const createProduct = async (shopId: string, data: CreateProductInput) => {
    const { variants, ...productData } = data;

    return prisma.product.create({
        data: {
            shopId,
            ...productData,
            images: data.images as any, // Cast JSON array
            variants: variants ? {
                create: variants
            } : undefined
        },
        include: {
            variants: true
        }
    });
};

/**
 * Get all products for a shop with filters and pagination
 */
/**
 * Get all products for a shop with filters and pagination
 */
export const getShopProducts = async (
    shopId: string,
    filters: { category?: string; search?: string; isActive?: boolean },
    page: number = 1,
    limit: number = 20
) => {
    const where: any = {
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

    const total = await prisma.product.count({ where });
    const totalPages = Math.ceil(total / limit);

    const products = await prisma.product.findMany({
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

/**
 * Get low stock products using raw query for column comparison
 */
export const getLowStockProducts = async (shopId: string) => {
    // Prisma doesn't support "where column A <= column B" in generated types easily
    // So we use queryRaw for performance
    const products = await prisma.$queryRaw`
        SELECT * FROM "products"
        WHERE "shop_id" = ${shopId}
        AND "stock" <= "low_stock_threshold"
        AND "deleted_at" IS NULL
        AND "is_active" = true
        ORDER BY "stock" ASC
    `;

    return products;
};

/**
 * Get a single product by ID
 */
export const getProductById = async (productId: string, shopId: string) => {
    const product = await prisma.product.findUnique({
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

/**
 * Update a product
 */
export const updateProduct = async (productId: string, shopId: string, data: UpdateProductInput) => {
    // Verify ownership
    const product = await getProductById(productId, shopId);
    if (!product) {
        throw new ApiError(404, 'Product not found');
    }

    const { variants, ...updateData } = data;

    // Handle variants update separately if needed
    // For now, allow simple addition/update of product level fields

    return prisma.product.update({
        where: { productId },
        data: {
            ...updateData,
            images: updateData.images as any,
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

/**
 * Soft delete a product
 */
export const deleteProduct = async (productId: string, shopId: string) => {
    // Verify ownership
    const product = await getProductById(productId, shopId);
    if (!product) {
        throw new ApiError(404, 'Product not found');
    }

    return prisma.product.update({
        where: { productId },
        data: { deletedAt: new Date(), isActive: false }
    });
};
