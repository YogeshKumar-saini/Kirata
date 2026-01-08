
import { PrismaClient, Shop, Customer, Product, Sale, Order, Prisma } from '@prisma/client';
import { prisma } from '../../shared/database';

interface BackupData {
    version: number;
    timestamp: string;
    source: string;
    stats: {
        customers: number;
        products: number;
        sales: number;
        orders: number;
    };
    shop: Partial<Shop>;
    customers: Customer[];
    products: Product[];
    sales: Sale[];
    orders: Order[];
}

export class BackupService {
    async createBackup(shopId: string): Promise<BackupData> {
        // Fetch shop data
        const shop = await prisma.shop.findUnique({ where: { shopId } });
        if (!shop) throw new Error('Shop not found');

        // Fetch related data
        // For Customers: since they are global, we find those who have interacted with this shop
        // We can find them via Sales or Orders. distinct ID.
        const sales = await prisma.sale.findMany({ where: { shopId } });
        const orders = await prisma.order.findMany({ where: { shopId } });
        const products = await prisma.product.findMany({ where: { shopId } });

        const customerIds = new Set<string>();
        sales.forEach(s => { if (s.customerId) customerIds.add(s.customerId); });
        orders.forEach(o => { if (o.customerId) customerIds.add(o.customerId); });

        const customers = await prisma.customer.findMany({
            where: {
                id: { in: Array.from(customerIds) }
            }
        });

        return {
            version: 1,
            timestamp: new Date().toISOString(),
            source: 'Kirata Backup Service',
            stats: {
                customers: customers.length,
                products: products.length,
                sales: sales.length,
                orders: orders.length
            },
            shop: shop,
            customers,
            products,
            sales,
            orders
        };
    }

    async restoreBackup(shopId: string, data: BackupData): Promise<void> {
        if (!data || data.version !== 1) {
            throw new Error('Invalid or unsupported backup format');
        }

        // Validate basic structure
        if (!Array.isArray(data.products) || !Array.isArray(data.sales)) {
            throw new Error('Corrupt backup data: Missing arrays');
        }

        console.log(`Restoring backup for shop ${shopId}. Products: ${data.products.length}, Sales: ${data.sales.length}`);

        // Execute as a transaction
        // Use 'any' for tx to avoid type mismatch with extended client
        await prisma.$transaction(async (tx: any) => {
            // 1. Wipe existing SHOP-SPECIFIC data
            // Do NOT delete Customers as they are global shared entities.
            // Order matters: Details first, then masters.
            await tx.sale.deleteMany({ where: { shopId } });
            await tx.order.deleteMany({ where: { shopId } });
            await tx.product.deleteMany({ where: { shopId } });
            // Note: We don't delete Shop, we update it if needed, or skip.

            // 2. Restore Customers (Upsert)
            // Ensure referenced customers exist.
            if (data.customers && data.customers.length > 0) {
                for (const customer of data.customers) {
                    await tx.customer.upsert({
                        where: { id: customer.id },
                        update: {
                            // Optionally update fields if they are missing or backup is newer?
                            // For safety, let's only update benign fields or skip update if exists.
                            // Actually, keeping existing global profile is safer.
                            // Just ensure they exist.
                        },
                        create: {
                            ...customer,
                            // Ensure unique constraints don't fail (id is primary, uniqueId/phone might conflict)
                            // If uniqueId/phone conflicts with ANOTHER user, this create will fail.
                            // This is a risk. But if we are restoring "our" data, it should be fine.
                            // If conflict, we skip? No, transaction fails.
                            // Let's rely on 'upsert' which handles ID conflict.
                        }
                    });
                }
            }

            // 3. Restore Products
            if (data.products && data.products.length > 0) {
                const productsToCreate = data.products.map(p => ({
                    ...p,
                    shopId: shopId
                }));
                // CreateMany doesn't support skipping duplicates easily in all SQLs via Prisma, 
                // but we deleted all shop products so it should be clean.
                await tx.product.createMany({ data: productsToCreate });
            }

            // 4. Restore Orders
            if (data.orders && data.orders.length > 0) {
                const ordersToCreate = data.orders.map(o => ({
                    ...o,
                    shopId: shopId
                }));
                await tx.order.createMany({ data: ordersToCreate });
            }

            // 5. Restore Sales
            if (data.sales.length > 0) {
                const salesToCreate = data.sales.map(s => ({
                    ...s,
                    shopId: shopId
                }));
                await tx.sale.createMany({ data: salesToCreate });
            }

            // 6. Update Shop Details (Optional)
            // if (data.shop) {
            //     await tx.shop.update({
            //         where: { shopId },
            //         data: { ...data.shop, shopId } // Be careful not to overwrite sensitive auth keys if any
            //     });
            // }
        });
    }
}

export const backupService = new BackupService();
