"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.schedulerService = void 0;
const node_cron_1 = __importDefault(require("node-cron"));
const logger_1 = require("../../shared/utils/logger");
const database_1 = require("../../shared/database");
class SchedulerService {
    /**
     * Initialize all scheduled tasks
     */
    init() {
        logger_1.logger.info('Initializing Scheduler Service...');
        // Schedule Daily Summary for Shopkeepers (Run at 9:00 AM)
        node_cron_1.default.schedule('0 9 * * *', async () => {
            logger_1.logger.info('[Scheduler] Running Daily Summary Job');
            await this.sendDailySummaries();
        });
        // Check for Overdue udhaars (Run at 10:00 AM)
        node_cron_1.default.schedule('0 10 * * *', async () => {
            logger_1.logger.info('[Scheduler] Running Overdue Payment Job');
            await this.checkOverduePayments();
        });
    }
    /**
     * Send daily summary to shopkeepers
     */
    async sendDailySummaries() {
        // Placeholder implementation
        // 1. Get all active shopkeepers
        // 2. Aggregate yesterday's sales
        // 3. Send SMS/WhatsApp
        logger_1.logger.info('[Scheduler] Daily summaries sent (Placeholder)');
    }
    /**
     * Check for overdue payments
     */
    async checkOverduePayments() {
        // Placeholder logic
        // 1. Find udhaars older than 30 days
        // 2. Identify customers
        // 3. Log or trigger manual review list
        const overdueCount = await database_1.prisma.udhaar.count({
            where: {
                status: 'OPEN',
                createdAt: {
                    lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 30 days ago
                }
            }
        });
        logger_1.logger.info(`[Scheduler] Found ${overdueCount} overdue payment records (>30 days)`);
    }
}
exports.schedulerService = new SchedulerService();
