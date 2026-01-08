"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
console.log('1. Starting index.ts');
const config_1 = require("./shared/config");
console.log('2. Config loaded');
const logger_1 = require("./shared/utils/logger");
console.log('3. Logger loaded');
const database_1 = require("./shared/database");
console.log('4. Prisma loaded');
const app_1 = require("./app");
console.log('5. App loaded');
const service_1 = require("./services/scheduler/service");
console.log('6. Scheduler loaded');
app_1.app.listen(config_1.config.port, () => {
    logger_1.logger.info(`Server running on port ${config_1.config.port}`);
    try {
        service_1.schedulerService.init();
        logger_1.logger.info('Scheduler initialized successfully');
    }
    catch (error) {
        logger_1.logger.error('Failed to initialize scheduler:', error);
    }
});
process.on('SIGTERM', async () => {
    logger_1.logger.info('SIGTERM signal received: closing HTTP server');
    await database_1.prisma.$disconnect();
    process.exit(0);
});
