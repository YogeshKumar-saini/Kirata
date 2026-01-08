"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cleanupDeletedAccounts = void 0;
const database_1 = require("../shared/database");
const logger_1 = require("../shared/utils/logger");
// Cleanup job to permanently delete accounts after 30 days
const cleanupDeletedAccounts = async () => {
    const now = new Date();
    try {
        // Delete Admins
        const deletedAdmins = await database_1.prisma.admin.deleteMany({
            where: {
                scheduledDeletionAt: { lte: now },
                deletedAt: { not: null }
            }
        });
        // Delete Shopkeepers
        const deletedShopkeepers = await database_1.prisma.shopkeeper.deleteMany({
            where: {
                scheduledDeletionAt: { lte: now },
                deletedAt: { not: null }
            }
        });
        // Delete Customers
        const deletedCustomers = await database_1.prisma.customer.deleteMany({
            where: {
                scheduledDeletionAt: { lte: now },
                deletedAt: { not: null }
            }
        });
        const totalDeleted = deletedAdmins.count + deletedShopkeepers.count + deletedCustomers.count;
        if (totalDeleted > 0) {
            logger_1.logger.info(`Cleanup Job: Permanently deleted ${totalDeleted} accounts (Admins: ${deletedAdmins.count}, Shopkeepers: ${deletedShopkeepers.count}, Customers: ${deletedCustomers.count})`);
        }
        return { totalDeleted, admins: deletedAdmins.count, shopkeepers: deletedShopkeepers.count, customers: deletedCustomers.count };
    }
    catch (error) {
        logger_1.logger.error('Cleanup Job Error:', error);
        throw error;
    }
};
exports.cleanupDeletedAccounts = cleanupDeletedAccounts;
// Run this job daily via cron or scheduler
// Example: node-cron schedule: '0 0 * * *' (every day at midnight)
