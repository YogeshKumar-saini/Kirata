import { prisma } from '../../shared/database';
import { ApiError } from '../../shared/errors/ApiError';

export interface CreateSupplierInput {
    name: string;
    phone?: string;
    email?: string;
    address?: string;
}

export const createSupplier = async (shopId: string, data: CreateSupplierInput) => {
    return prisma.supplier.create({
        data: {
            shopId,
            ...data
        }
    });
};

export const getSuppliers = async (shopId: string) => {
    return prisma.supplier.findMany({
        where: { shopId },
        include: {
            _count: {
                select: {
                    products: true
                }
            }
        },
        orderBy: { createdAt: 'desc' }
    });
};

export const getSupplierById = async (supplierId: string, shopId: string) => {
    const supplier = await prisma.supplier.findUnique({
        where: { id: supplierId }
    });

    if (!supplier || supplier.shopId !== shopId) {
        return null;
    }
    return supplier;
};

export const updateSupplier = async (
    supplierId: string,
    shopId: string,
    data: Partial<CreateSupplierInput>
) => {
    const supplier = await getSupplierById(supplierId, shopId);
    if (!supplier) {
        throw new ApiError(404, 'Supplier not found');
    }

    return prisma.supplier.update({
        where: { id: supplierId },
        data
    });
};

export const deleteSupplier = async (supplierId: string, shopId: string) => {
    const supplier = await getSupplierById(supplierId, shopId);
    if (!supplier) {
        throw new ApiError(404, 'Supplier not found');
    }

    // Check if supplier has products
    const productCount = await prisma.product.count({
        where: { supplierId, deletedAt: null }
    });

    if (productCount > 0) {
        throw new ApiError(400, `Cannot delete supplier with ${productCount} linked products. Please reassign or delete products first.`);
    }

    return prisma.supplier.delete({
        where: { id: supplierId }
    });
};
