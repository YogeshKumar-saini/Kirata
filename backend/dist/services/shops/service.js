"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkProfileCompletion = exports.getPrimaryShop = exports.getShopsByOwnerId = exports.getShopByOwnerId = exports.getShopByOwner = exports.createShopByOwnerId = exports.createShop = exports.softDeleteShop = exports.updateShop = exports.uploadShopPhoto = exports.createDetailedShop = exports.updateCustomer = exports.findOrCreateCustomer = exports.findOrCreateShopkeeper = void 0;
exports.getShopById = getShopById;
exports.getShopkeeperById = getShopkeeperById;
exports.getQuickSelectCustomers = getQuickSelectCustomers;
const database_1 = require("../../shared/database");
const logger_1 = require("../../shared/utils/logger");
const service_1 = require("../../auth/service");
// ===== SHOPKEEPER HELPERS =====
const findOrCreateShopkeeper = async (phone, name) => {
    return database_1.prisma.shopkeeper.upsert({
        where: { phone },
        update: { name: name || undefined },
        create: { phone, name, uniqueId: (0, service_1.generateReadableId)(phone, name) }
    });
};
exports.findOrCreateShopkeeper = findOrCreateShopkeeper;
// ===== CUSTOMER HELPERS =====
// ===== CUSTOMER HELPERS =====
const findOrCreateCustomer = async (phone, name) => {
    return database_1.prisma.customer.upsert({
        where: { phone },
        update: { name: name || undefined },
        create: { phone, name, uniqueId: (0, service_1.generateReadableId)(phone, name) }
    });
};
exports.findOrCreateCustomer = findOrCreateCustomer;
const updateCustomer = async (customerId, data) => {
    return database_1.prisma.customer.update({
        where: { id: customerId },
        data: {
            name: data.name,
            creditLimit: data.creditLimit, // Type checked against generated Prisma Client
            tags: data.tags,
            notes: data.notes
        }
    });
};
exports.updateCustomer = updateCustomer;
// ===== SHOP QUERIES =====
// Get shop by ID (public)
async function getShopById(shopId) {
    return database_1.prisma.shop.findUnique({
        where: { shopId },
        include: {
            Review: {
                take: 5,
                orderBy: { createdAt: 'desc' }
            }
        }
    });
}
// ===== SHOP CREATION =====
/**
 * Create shop with comprehensive details
 * RESTRICTION: One shop per shopkeeper account
 */
const createDetailedShop = async (ownerId, shopData) => {
    // ENFORCE: One shop per account
    const existingShops = await database_1.prisma.shop.findMany({
        where: {
            ownerId,
            deletedAt: null
        }
    });
    if (existingShops.length > 0) {
        throw new Error('You already have a shop. Only one shop per account is allowed. Please update your existing shop instead.');
    }
    const shop = await database_1.prisma.shop.create({
        data: {
            name: shopData.name,
            category: shopData.category,
            ownerId,
            // Address
            addressLine1: shopData.addressLine1,
            addressLine2: shopData.addressLine2,
            city: shopData.city,
            state: shopData.state,
            pincode: shopData.pincode,
            latitude: shopData.latitude,
            longitude: shopData.longitude,
            // Contact
            phone: shopData.phone,
            alternatePhone: shopData.alternatePhone,
            email: shopData.email,
            whatsappNumber: shopData.whatsappNumber,
            // Business
            gstNumber: shopData.gstNumber,
            businessHours: shopData.businessHours,
            // Legacy
            location: shopData.location,
            // Auto-calculate profile completion
            isProfileComplete: checkIfProfileComplete(shopData),
        },
    });
    // Set as primary shop if shopkeeper doesn't have one
    await setPrimaryShopIfNeeded(ownerId, shop.shopId);
    // Mark shopkeeper as having completed shop setup AND sync address from shop
    const legacyAddress = [
        shopData.addressLine1,
        shopData.addressLine2,
        shopData.city,
        shopData.state,
        shopData.pincode
    ].filter(Boolean).join(', ');
    await database_1.prisma.shopkeeper.update({
        where: { id: ownerId },
        data: {
            hasCompletedShopSetup: true,
            // Sync Onboarding Address to Profile
            addressLine1: shopData.addressLine1,
            addressLine2: shopData.addressLine2,
            city: shopData.city,
            state: shopData.state,
            pincode: shopData.pincode,
            address: legacyAddress
        }
    });
    logger_1.logger.info(`Created detailed shop ${shop.name} (${shop.shopId}) for ownerId ${ownerId}`);
    return shop;
};
exports.createDetailedShop = createDetailedShop;
/**
 * Upload shop photo
 */
const uploadShopPhoto = async (shopId, ownerId, photoPath) => {
    // Verify ownership
    const shop = await database_1.prisma.shop.findUnique({
        where: { shopId }
    });
    if (!shop) {
        throw new Error('Shop not found');
    }
    if (shop.ownerId !== ownerId) {
        throw new Error('You do not own this shop');
    }
    // Update photo URL
    const updatedShop = await database_1.prisma.shop.update({
        where: { shopId },
        data: { photoUrl: photoPath }
    });
    logger_1.logger.info(`Updated photo for shop ${shopId}`);
    return updatedShop;
};
exports.uploadShopPhoto = uploadShopPhoto;
/**
 * Update shop details
 */
const updateShop = async (shopId, ownerId, updates) => {
    // Verify ownership
    const shop = await database_1.prisma.shop.findUnique({
        where: { shopId }
    });
    if (!shop) {
        throw new Error('Shop not found');
    }
    if (shop.ownerId !== ownerId) {
        throw new Error('You do not own this shop');
    }
    // Merge current shop data with updates for profile completion check
    const mergedData = { ...shop, ...updates };
    // Update shop
    const updatedShop = await database_1.prisma.shop.update({
        where: { shopId },
        data: {
            ...updates,
            isProfileComplete: checkIfProfileComplete(mergedData)
        }
    });
    // Check if any address fields were updated and sync to Profile
    if (updates.addressLine1 || updates.addressLine2 || updates.city || updates.state || updates.pincode) {
        const legacyAddress = [
            updatedShop.addressLine1,
            updatedShop.addressLine2,
            updatedShop.city,
            updatedShop.state,
            updatedShop.pincode
        ].filter(Boolean).join(', ');
        await database_1.prisma.shopkeeper.update({
            where: { id: ownerId },
            data: {
                addressLine1: updatedShop.addressLine1,
                addressLine2: updatedShop.addressLine2,
                city: updatedShop.city,
                state: updatedShop.state,
                pincode: updatedShop.pincode,
                address: legacyAddress
            }
        });
    }
    logger_1.logger.info(`Updated shop ${shopId} and synced address to profile`);
    return updatedShop;
};
exports.updateShop = updateShop;
/**
 * Soft delete shop
 */
const softDeleteShop = async (shopId, ownerId) => {
    // Verify ownership
    const shop = await database_1.prisma.shop.findUnique({
        where: { shopId }
    });
    if (!shop) {
        throw new Error('Shop not found');
    }
    if (shop.ownerId !== ownerId) {
        throw new Error('You do not own this shop');
    }
    // Soft delete
    await database_1.prisma.shop.update({
        where: { shopId },
        data: { deletedAt: new Date() }
    });
    // Update shopkeeper status
    await database_1.prisma.shopkeeper.update({
        where: { id: ownerId },
        data: { hasCompletedShopSetup: false }
    });
    logger_1.logger.info(`Soft deleted shop ${shopId}`);
};
exports.softDeleteShop = softDeleteShop;
/**
 * Legacy: Create shop with basic details (for backward compatibility)
 */
const createShop = async (ownerPhone, shopName, category) => {
    const owner = await (0, exports.findOrCreateShopkeeper)(ownerPhone);
    const shop = await database_1.prisma.shop.create({
        data: {
            name: shopName,
            category,
            ownerId: owner.id,
        },
    });
    await setPrimaryShopIfNeeded(owner.id, shop.shopId);
    logger_1.logger.info(`Created shop ${shop.name} (${shop.shopId}) for owner ${ownerPhone}`);
    return shop;
};
exports.createShop = createShop;
/**
 * Legacy: Create shop by owner ID (basic)
 */
const createShopByOwnerId = async (ownerId, shopName, category) => {
    const shop = await database_1.prisma.shop.create({
        data: {
            name: shopName,
            category,
            ownerId,
        },
    });
    await setPrimaryShopIfNeeded(ownerId, shop.shopId);
    logger_1.logger.info(`Created shop ${shop.name} (${shop.shopId}) for ownerId ${ownerId}`);
    return shop;
};
exports.createShopByOwnerId = createShopByOwnerId;
// ===== SHOP RETRIEVAL =====
const getShopByOwner = async (phone) => {
    const shopkeeper = await database_1.prisma.shopkeeper.findUnique({
        where: { phone },
        include: { shops: { where: { deletedAt: null } } }
    });
    if (!shopkeeper || shopkeeper.shops.length === 0)
        return null;
    return shopkeeper.shops[0];
};
exports.getShopByOwner = getShopByOwner;
const getShopByOwnerId = async (ownerId) => {
    return database_1.prisma.shop.findFirst({
        where: { ownerId, deletedAt: null }
    });
};
exports.getShopByOwnerId = getShopByOwnerId;
const getShopsByOwnerId = async (ownerId) => {
    return database_1.prisma.shop.findMany({
        where: { ownerId, deletedAt: null },
        orderBy: { createdAt: 'asc' }
    });
};
exports.getShopsByOwnerId = getShopsByOwnerId;
const getPrimaryShop = async (ownerId) => {
    const shopkeeper = await database_1.prisma.shopkeeper.findUnique({
        where: { id: ownerId },
        select: { primaryShopId: true }
    });
    if (!shopkeeper?.primaryShopId) {
        // Fallback to first shop
        return (0, exports.getShopByOwnerId)(ownerId);
    }
    return database_1.prisma.shop.findUnique({
        where: { shopId: shopkeeper.primaryShopId }
    });
};
exports.getPrimaryShop = getPrimaryShop;
// ===== PROFILE COMPLETION =====
const checkProfileCompletion = async (shopId) => {
    const shop = await database_1.prisma.shop.findUnique({ where: { shopId } });
    if (!shop) {
        throw new Error('Shop not found');
    }
    const requiredFields = [
        'name', 'category', 'addressLine1', 'city', 'state', 'pincode'
    ];
    const recommendedFields = [
        'phone', 'email', 'whatsappNumber', 'photoUrl', 'businessHours'
    ];
    const missingRequired = [];
    const missingRecommended = [];
    requiredFields.forEach(field => {
        if (!shop[field]) {
            missingRequired.push(field);
        }
    });
    recommendedFields.forEach(field => {
        if (!shop[field]) {
            missingRecommended.push(field);
        }
    });
    const totalFields = requiredFields.length + recommendedFields.length;
    const filledFields = totalFields - missingRequired.length - missingRecommended.length;
    const completionPercentage = Math.round((filledFields / totalFields) * 100);
    return {
        isComplete: missingRequired.length === 0,
        missingFields: [...missingRequired, ...missingRecommended],
        completionPercentage
    };
};
exports.checkProfileCompletion = checkProfileCompletion;
// ===== HELPER FUNCTIONS =====
function checkIfProfileComplete(shopData) {
    const requiredFields = [
        shopData.name,
        shopData.category,
        shopData.addressLine1,
        shopData.city,
        shopData.state,
        shopData.pincode
    ];
    return requiredFields.every(field => !!field);
}
async function setPrimaryShopIfNeeded(ownerId, shopId) {
    const shopkeeper = await database_1.prisma.shopkeeper.findUnique({
        where: { id: ownerId },
        select: { primaryShopId: true }
    });
    // Set as primary if no primary shop exists
    if (!shopkeeper?.primaryShopId) {
        await database_1.prisma.shopkeeper.update({
            where: { id: ownerId },
            data: { primaryShopId: shopId }
        });
        logger_1.logger.info(`Set shop ${shopId} as primary for shopkeeper ${ownerId}`);
    }
}
async function getShopkeeperById(userId) {
    return database_1.prisma.shopkeeper.findUnique({
        where: { id: userId }
    });
}
/**
 * Get customers for quick selection in Record Sale
 * Returns customers with Udhaar balance and recently transacted customers
 */
async function getQuickSelectCustomers(shopId) {
    // 1. Optimized Balance Calculation using Raw Query (Top 10 Udhaar)
    // Schema note: 'sales' table, fields are snake_case in DB usually, but Prisma maps them.
    // We should use table name "sales" and column names as per DB (likely snake_case).
    // Prisma model: Sale -> @@map("sales")
    // Fields: shopId -> shop_id, customerId -> customer_id, paymentType -> payment_type, amount -> amount
    const udhaarRaw = await database_1.prisma.$queryRaw `
        SELECT 
            "customer_id",
            SUM(CASE WHEN "payment_type" = 'UDHAAR' THEN "amount" ELSE - "amount" END) as "balance",
            COUNT(*) as "count"
        FROM "sales"
        WHERE "shop_id" = ${shopId}
        AND "customer_id" IS NOT NULL
        GROUP BY "customer_id"
        HAVING SUM(CASE WHEN "payment_type" = 'UDHAAR' THEN "amount" ELSE - "amount" END) > 0
        ORDER BY "balance" DESC
        LIMIT 10
    `;
    // Fetch customer details for these IDs
    const udhaarCustomerIds = udhaarRaw.map(r => r.customer_id);
    const udhaarCustomerDetails = await database_1.prisma.customer.findMany({
        where: { id: { in: udhaarCustomerIds } }
    });
    const udhaarMap = new Map(udhaarCustomerDetails.map(c => [c.id, c]));
    // Assemble Udhaar List
    const udhaarCustomers = udhaarRaw.map(r => {
        const c = udhaarMap.get(r.customer_id);
        if (!c)
            return null;
        return {
            ...c,
            balance: Number(r.balance),
            transactionCount: Number(r.count)
        };
    }).filter(c => c !== null);
    // 2. Recent Customers (Efficient using Prisma distinct)
    const recentSales = await database_1.prisma.sale.findMany({
        where: {
            shopId,
            customerId: { not: null }
        },
        orderBy: { createdAt: 'desc' },
        distinct: ['customerId'],
        take: 10,
        select: {
            customerId: true,
            createdAt: true
        }
    });
    // We need balances for these recent customers too
    const recentCustomerIds = recentSales.map(s => s.customerId).filter(id => !udhaarCustomerIds.includes(id));
    // Optimization: Don't re-fetch if already in udhaar list, BUT we need to format them slightly differently (lastTransactionDate)
    // 3. Optimize: Fetch stats for all recent customers in one query
    const allRecentIds = [...new Set(recentSales.map(s => s.customerId).filter(id => !udhaarCustomerIds.includes(id)))];
    // Fetch missing customer details
    const missingIds = allRecentIds.filter(id => !udhaarMap.has(id));
    if (missingIds.length > 0) {
        const details = await database_1.prisma.customer.findMany({ where: { id: { in: missingIds } } });
        details.forEach(c => udhaarMap.set(c.id, c));
    }
    // Single GroupBy Query to get metrics
    let customerStats = new Map();
    if (allRecentIds.length > 0) {
        // We use groupBy to fetch totals per payment type
        const stats = await database_1.prisma.sale.groupBy({
            by: ['customerId', 'paymentType'],
            where: {
                shopId,
                customerId: { in: allRecentIds },
            },
            _sum: { amount: true },
            _count: { _all: true }
        });
        stats.forEach(stat => {
            if (!stat.customerId)
                return;
            const current = customerStats.get(stat.customerId) || { balance: 0, count: 0 };
            const amount = Number(stat._sum.amount || 0);
            const count = stat._count._all;
            if (stat.paymentType === 'UDHAAR') {
                current.balance += amount;
            }
            else {
                current.balance -= amount;
            }
            current.count += count;
            customerStats.set(stat.customerId, current);
        });
    }
    const recentCustomers = allRecentIds.map(id => {
        const c = udhaarMap.get(id);
        if (!c)
            return null;
        const stat = customerStats.get(id) || { balance: 0, count: 0 };
        const lastSale = recentSales.find(s => s.customerId === id);
        return {
            ...c,
            balance: stat.balance,
            transactionCount: stat.count,
            lastTransactionDate: lastSale?.createdAt || new Date()
        };
    }).filter(c => c !== null);
    return {
        udhaarCustomers,
        recentCustomers: recentCustomers.filter(c => c !== null)
    };
}
