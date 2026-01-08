import { prisma } from '../shared/database';
import { logger } from '../shared/utils/logger';

// Cleanup job to permanently delete accounts after 30 days
export const cleanupDeletedAccounts = async () => {
    const now = new Date();

    try {
        // Delete Admins
        const deletedAdmins = await prisma.admin.deleteMany({
            where: {
                scheduledDeletionAt: { lte: now },
                deletedAt: { not: null }
            }
        });

        // Delete Shopkeepers
        const deletedShopkeepers = await prisma.shopkeeper.deleteMany({
            where: {
                scheduledDeletionAt: { lte: now },
                deletedAt: { not: null }
            }
        });

        // Delete Customers
        const deletedCustomers = await prisma.customer.deleteMany({
            where: {
                scheduledDeletionAt: { lte: now },
                deletedAt: { not: null }
            }
        });

        const totalDeleted = deletedAdmins.count + deletedShopkeepers.count + deletedCustomers.count;

        if (totalDeleted > 0) {
            logger.info(`Cleanup Job: Permanently deleted ${totalDeleted} accounts (Admins: ${deletedAdmins.count}, Shopkeepers: ${deletedShopkeepers.count}, Customers: ${deletedCustomers.count})`);
        }

        return { totalDeleted, admins: deletedAdmins.count, shopkeepers: deletedShopkeepers.count, customers: deletedCustomers.count };
    } catch (error) {
        logger.error('Cleanup Job Error:', error);
        throw error;
    }
};

// Run this job daily via cron or scheduler
// Example: node-cron schedule: '0 0 * * *' (every day at midnight)
