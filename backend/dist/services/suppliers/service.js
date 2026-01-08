"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteSupplier = exports.updateSupplier = exports.getSupplierById = exports.getSuppliers = exports.createSupplier = void 0;
const database_1 = require("../../shared/database");
const ApiError_1 = require("../../shared/errors/ApiError");
const createSupplier = async (shopId, data) => {
    return database_1.prisma.supplier.create({
        data: {
            shopId,
            ...data
        }
    });
};
exports.createSupplier = createSupplier;
const getSuppliers = async (shopId) => {
    return database_1.prisma.supplier.findMany({
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
exports.getSuppliers = getSuppliers;
const getSupplierById = async (supplierId, shopId) => {
    const supplier = await database_1.prisma.supplier.findUnique({
        where: { id: supplierId }
    });
    if (!supplier || supplier.shopId !== shopId) {
        return null;
    }
    return supplier;
};
exports.getSupplierById = getSupplierById;
const updateSupplier = async (supplierId, shopId, data) => {
    const supplier = await (0, exports.getSupplierById)(supplierId, shopId);
    if (!supplier) {
        throw new ApiError_1.ApiError(404, 'Supplier not found');
    }
    return database_1.prisma.supplier.update({
        where: { id: supplierId },
        data
    });
};
exports.updateSupplier = updateSupplier;
const deleteSupplier = async (supplierId, shopId) => {
    const supplier = await (0, exports.getSupplierById)(supplierId, shopId);
    if (!supplier) {
        throw new ApiError_1.ApiError(404, 'Supplier not found');
    }
    // Check if supplier has products
    const productCount = await database_1.prisma.product.count({
        where: { supplierId, deletedAt: null }
    });
    if (productCount > 0) {
        throw new ApiError_1.ApiError(400, `Cannot delete supplier with ${productCount} linked products. Please reassign or delete products first.`);
    }
    return database_1.prisma.supplier.delete({
        where: { id: supplierId }
    });
};
exports.deleteSupplier = deleteSupplier;
