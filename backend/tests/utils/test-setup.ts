import { prisma, prismaRaw } from '../../src/shared/database';

import { signToken } from '../../src/auth/utils';
import { generateReadableId, generateOTP } from '../../src/auth/service';

export const createTestShopkeeper = async () => {
    const phone = `+91${Math.floor(1000000000 + Math.random() * 9000000000)}`;
    const uniqueId = generateReadableId(phone);
    const shopkeeper = await prisma.shopkeeper.create({
        data: {
            phone,
            uniqueId,
            isPhoneVerified: true
        }
    });
    const token = signToken({ userId: shopkeeper.id, role: 'SHOPKEEPER' });
    return { shopkeeper, token };
};

export const createTestShop = async () => {
    const { shopkeeper } = await createTestShopkeeper();
    const shop = await prisma.shop.create({
        data: {
            name: 'Test Shop',
            category: 'GROCERY',
            ownerId: shopkeeper.id,
        }
    });
    return { shop, shopkeeper };
};

export const createTestSale = async (shopId: string, customerId: string, amount: number, paymentType: 'CASH' | 'UDHAAR' = 'CASH') => {
    const sale = await prisma.sale.create({
        data: {
            shopId,
            customerId,
            amount,
            paymentType,
            source: 'MANUAL'
        }
    });

    if (paymentType === 'UDHAAR') {
        await prisma.udhaar.create({
            data: {
                shopId,
                customerId,
                amount,
                status: 'OPEN',
                referenceSaleId: sale.saleId
            }
        });
    }

    return sale;
};

export const createTestCustomer = async () => {
    const phone = `+91${Math.floor(1000000000 + Math.random() * 9000000000)}`;
    const uniqueId = generateReadableId(phone);
    const customer = await prisma.customer.create({
        data: {
            phone,
            uniqueId,
            isPhoneVerified: true
        }
    });
    const token = signToken({ userId: customer.id, role: 'CUSTOMER' });
    return { customer, token };
};

export const clearDatabase = async () => {
    // Level 1: Leaf nodes (depend on others)
    await prismaRaw.udhaar.deleteMany();
    await (prismaRaw as any).personalLedgerEntry.deleteMany();
    await prismaRaw.productVariant.deleteMany();
    await prismaRaw.shopAnalytics.deleteMany();
    await prismaRaw.review.deleteMany();
    await prismaRaw.shopStaff.deleteMany();

    // Level 2: Depend on Shop/Customer
    await prismaRaw.sale.deleteMany();
    await prismaRaw.order.deleteMany();
    await prismaRaw.offer.deleteMany();
    await prismaRaw.product.deleteMany();

    // Level 3: Core Entities
    await prismaRaw.shop.deleteMany();
    await prismaRaw.userPreferences.deleteMany();
    await prismaRaw.shopkeeper.deleteMany();
    await prismaRaw.customer.deleteMany();
    await prismaRaw.admin.deleteMany();
};
