import { prisma } from '../../shared/database';
import { logger } from '../../shared/utils/logger';
import { ShopCategory, Shop, Shopkeeper, Customer } from '@prisma/client';
import { generateReadableId } from '../../auth/service';

// ===== TYPES =====
export interface DetailedShopInput {
    name: string;
    category: ShopCategory;
    addressLine1?: string;
    addressLine2?: string;
    city?: string;
    state?: string;
    pincode?: string;
    phone?: string;
    alternatePhone?: string;
    email?: string;
    whatsappNumber?: string;
    gstNumber?: string;
    businessHours?: Record<string, { open: string; close: string; closed?: boolean }>;
    location?: string; // Legacy field
    latitude?: number;
    longitude?: number;
}

export interface ProfileCompletionStatus {
    isComplete: boolean;
    missingFields: string[];
    completionPercentage: number;
}

// ===== SHOPKEEPER HELPERS =====
export const findOrCreateShopkeeper = async (phone: string, name?: string): Promise<Shopkeeper> => {
    return prisma.shopkeeper.upsert({
        where: { phone },
        update: { name: name || undefined },
        create: { phone, name, uniqueId: generateReadableId(phone, name) }
    });
};

// ===== CUSTOMER HELPERS =====
// ===== CUSTOMER HELPERS =====
export const findOrCreateCustomer = async (phone: string, name?: string): Promise<Customer> => {
    return prisma.customer.upsert({
        where: { phone },
        update: { name: name || undefined },
        create: { phone, name, uniqueId: generateReadableId(phone, name) }
    });
};

export interface CustomerUpdateInput {
    name?: string;
    creditLimit?: number;
    tags?: string[];
    notes?: string;
}

export const updateCustomer = async (customerId: string, data: CustomerUpdateInput): Promise<Customer> => {
    return prisma.customer.update({
        where: { id: customerId },
        data: {
            name: data.name,
            creditLimit: data.creditLimit, // Type checked against generated Prisma Client
            tags: data.tags,
            notes: data.notes
        }
    });
};

// ===== SHOP QUERIES =====

// Get shop by ID (public)
export async function getShopById(shopId: string) {
    return prisma.shop.findUnique({
        where: { shopId },
        include: {
            Review: {
                take: 5,
                orderBy: { createdAt: 'desc' as const }
            }
        }
    });
}

// ===== SHOP CREATION =====

/**
 * Create shop with comprehensive details
 * RESTRICTION: One shop per shopkeeper account
 */
export const createDetailedShop = async (ownerId: string, shopData: DetailedShopInput): Promise<Shop> => {
    // ENFORCE: One shop per account
    const existingShops = await prisma.shop.findMany({
        where: {
            ownerId,
            deletedAt: null
        }
    });

    if (existingShops.length > 0) {
        throw new Error('You already have a shop. Only one shop per account is allowed. Please update your existing shop instead.');
    }

    const shop = await prisma.shop.create({
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
            businessHours: shopData.businessHours as any,

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

    await prisma.shopkeeper.update({
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

    logger.info(`Created detailed shop ${shop.name} (${shop.shopId}) for ownerId ${ownerId}`);
    return shop;
};

/**
 * Upload shop photo
 */
export const uploadShopPhoto = async (
    shopId: string,
    ownerId: string,
    photoPath: string
): Promise<Shop> => {
    // Verify ownership
    const shop = await prisma.shop.findUnique({
        where: { shopId }
    });

    if (!shop) {
        throw new Error('Shop not found');
    }

    if (shop.ownerId !== ownerId) {
        throw new Error('You do not own this shop');
    }

    // Update photo URL
    const updatedShop = await prisma.shop.update({
        where: { shopId },
        data: { photoUrl: photoPath }
    });

    logger.info(`Updated photo for shop ${shopId}`);
    return updatedShop;
};

/**
 * Update shop details
 */
export const updateShop = async (
    shopId: string,
    ownerId: string,
    updates: Partial<DetailedShopInput>
): Promise<Shop> => {
    // Verify ownership
    const shop = await prisma.shop.findUnique({
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
    const updatedShop = await prisma.shop.update({
        where: { shopId },
        data: {
            ...updates,
            isProfileComplete: checkIfProfileComplete(mergedData as any)
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

        await prisma.shopkeeper.update({
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

    logger.info(`Updated shop ${shopId} and synced address to profile`);
    return updatedShop;
};

/**
 * Soft delete shop
 */
export const softDeleteShop = async (shopId: string, ownerId: string): Promise<void> => {
    // Verify ownership
    const shop = await prisma.shop.findUnique({
        where: { shopId }
    });

    if (!shop) {
        throw new Error('Shop not found');
    }

    if (shop.ownerId !== ownerId) {
        throw new Error('You do not own this shop');
    }

    // Soft delete
    await prisma.shop.update({
        where: { shopId },
        data: { deletedAt: new Date() }
    });

    // Update shopkeeper status
    await prisma.shopkeeper.update({
        where: { id: ownerId },
        data: { hasCompletedShopSetup: false }
    });

    logger.info(`Soft deleted shop ${shopId}`);
};



/**
 * Legacy: Create shop with basic details (for backward compatibility)
 */
export const createShop = async (ownerPhone: string, shopName: string, category: ShopCategory): Promise<Shop> => {
    const owner = await findOrCreateShopkeeper(ownerPhone);

    const shop = await prisma.shop.create({
        data: {
            name: shopName,
            category,
            ownerId: owner.id,
        },
    });

    await setPrimaryShopIfNeeded(owner.id, shop.shopId);

    logger.info(`Created shop ${shop.name} (${shop.shopId}) for owner ${ownerPhone}`);
    return shop;
};

/**
 * Legacy: Create shop by owner ID (basic)
 */
export const createShopByOwnerId = async (ownerId: string, shopName: string, category: ShopCategory): Promise<Shop> => {
    const shop = await prisma.shop.create({
        data: {
            name: shopName,
            category,
            ownerId,
        },
    });

    await setPrimaryShopIfNeeded(ownerId, shop.shopId);

    logger.info(`Created shop ${shop.name} (${shop.shopId}) for ownerId ${ownerId}`);
    return shop;
};

// ===== SHOP RETRIEVAL =====

export const getShopByOwner = async (phone: string): Promise<Shop | null> => {
    const shopkeeper = await prisma.shopkeeper.findUnique({
        where: { phone },
        include: { shops: { where: { deletedAt: null } } }
    });
    if (!shopkeeper || shopkeeper.shops.length === 0) return null;
    return shopkeeper.shops[0];
};

export const getShopByOwnerId = async (ownerId: string): Promise<Shop | null> => {
    return prisma.shop.findFirst({
        where: { ownerId, deletedAt: null }
    });
};

export const getShopsByOwnerId = async (ownerId: string): Promise<Shop[]> => {
    return prisma.shop.findMany({
        where: { ownerId, deletedAt: null },
        orderBy: { createdAt: 'asc' }
    });
};

export const getPrimaryShop = async (ownerId: string): Promise<Shop | null> => {
    const shopkeeper = await prisma.shopkeeper.findUnique({
        where: { id: ownerId },
        select: { primaryShopId: true }
    });

    if (!shopkeeper?.primaryShopId) {
        // Fallback to first shop
        return getShopByOwnerId(ownerId);
    }

    return prisma.shop.findUnique({
        where: { shopId: shopkeeper.primaryShopId }
    });
};

// ===== PROFILE COMPLETION =====

export const checkProfileCompletion = async (shopId: string): Promise<ProfileCompletionStatus> => {
    const shop = await prisma.shop.findUnique({ where: { shopId } });

    if (!shop) {
        throw new Error('Shop not found');
    }

    const requiredFields = [
        'name', 'category', 'addressLine1', 'city', 'state', 'pincode'
    ];

    const recommendedFields = [
        'phone', 'email', 'whatsappNumber', 'photoUrl', 'businessHours'
    ];

    const missingRequired: string[] = [];
    const missingRecommended: string[] = [];

    requiredFields.forEach(field => {
        if (!shop[field as keyof Shop]) {
            missingRequired.push(field);
        }
    });

    recommendedFields.forEach(field => {
        if (!shop[field as keyof Shop]) {
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

// ===== HELPER FUNCTIONS =====

function checkIfProfileComplete(shopData: DetailedShopInput): boolean {
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

async function setPrimaryShopIfNeeded(ownerId: string, shopId: string): Promise<void> {
    const shopkeeper = await prisma.shopkeeper.findUnique({
        where: { id: ownerId },
        select: { primaryShopId: true }
    });

    // Set as primary if no primary shop exists
    if (!shopkeeper?.primaryShopId) {
        await prisma.shopkeeper.update({
            where: { id: ownerId },
            data: { primaryShopId: shopId }
        });
        logger.info(`Set shop ${shopId} as primary for shopkeeper ${ownerId}`);
    }
}

export async function getShopkeeperById(userId: string): Promise<Shopkeeper | null> {
    return prisma.shopkeeper.findUnique({
        where: { id: userId }
    });
}

// ===== QUICK SELECT CUSTOMERS =====

export interface QuickSelectCustomersResult {
    udhaarCustomers: Array<Customer & { balance: number; transactionCount: number }>;
    recentCustomers: Array<Customer & { balance: number; transactionCount: number; lastTransactionDate: Date }>;
}

/**
 * Get customers for quick selection in Record Sale
 * Returns customers with Udhaar balance and recently transacted customers
 */

export async function getQuickSelectCustomers(shopId: string): Promise<QuickSelectCustomersResult> {
    // 1. Optimized Balance Calculation using Raw Query (Top 10 Udhaar)
    // Schema note: 'sales' table, fields are snake_case in DB usually, but Prisma maps them.
    // We should use table name "sales" and column names as per DB (likely snake_case).
    // Prisma model: Sale -> @@map("sales")
    // Fields: shopId -> shop_id, customerId -> customer_id, paymentType -> payment_type, amount -> amount

    const udhaarRaw = await prisma.$queryRaw<Array<{ customer_id: string; balance: number; count: number }>>`
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
    const udhaarCustomerDetails = await prisma.customer.findMany({
        where: { id: { in: udhaarCustomerIds } }
    });

    const udhaarMap = new Map(udhaarCustomerDetails.map(c => [c.id, c]));

    // Assemble Udhaar List
    const udhaarCustomers = udhaarRaw.map(r => {
        const c = udhaarMap.get(r.customer_id);
        if (!c) return null;
        return {
            ...c,
            balance: Number(r.balance),
            transactionCount: Number(r.count)
        };
    }).filter(c => c !== null) as Array<Customer & { balance: number; transactionCount: number }>;


    // 2. Recent Customers (Efficient using Prisma distinct)
    const recentSales = await prisma.sale.findMany({
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
    const recentCustomerIds = recentSales.map(s => s.customerId!).filter(id => !udhaarCustomerIds.includes(id));
    // Optimization: Don't re-fetch if already in udhaar list, BUT we need to format them slightly differently (lastTransactionDate)

    // 3. Optimize: Fetch stats for all recent customers in one query
    const allRecentIds = [...new Set(recentSales.map(s => s.customerId!).filter(id => !udhaarCustomerIds.includes(id)))];

    // Fetch missing customer details
    const missingIds = allRecentIds.filter(id => !udhaarMap.has(id));
    if (missingIds.length > 0) {
        const details = await prisma.customer.findMany({ where: { id: { in: missingIds } } });
        details.forEach(c => udhaarMap.set(c.id, c));
    }

    // Single GroupBy Query to get metrics
    let customerStats = new Map<string, { balance: number; count: number }>();

    if (allRecentIds.length > 0) {
        // We use groupBy to fetch totals per payment type
        const stats = await prisma.sale.groupBy({
            by: ['customerId', 'paymentType'],
            where: {
                shopId,
                customerId: { in: allRecentIds },

            },
            _sum: { amount: true },
            _count: { _all: true }
        });

        stats.forEach(stat => {
            if (!stat.customerId) return;
            const current = customerStats.get(stat.customerId) || { balance: 0, count: 0 };

            const amount = Number(stat._sum.amount || 0);
            const count = stat._count._all;

            if (stat.paymentType === 'UDHAAR') {
                current.balance += amount;
            } else {
                current.balance -= amount;
            }
            current.count += count;

            customerStats.set(stat.customerId, current);
        });
    }

    const recentCustomers = allRecentIds.map(id => {
        const c = udhaarMap.get(id);
        if (!c) return null;
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
        recentCustomers: recentCustomers.filter(c => c !== null) as any
    };
}
