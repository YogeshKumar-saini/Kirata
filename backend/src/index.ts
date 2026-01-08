console.log('1. Starting index.ts');
import { config } from './shared/config';
console.log('2. Config loaded');
import { logger } from './shared/utils/logger';
console.log('3. Logger loaded');
import { prisma } from './shared/database';
console.log('4. Prisma loaded');
import { app } from './app';
console.log('5. App loaded');

// Only start the server if not in Vercel
if (process.env.VERCEL !== '1') {
    app.listen(config.port, async () => {
        logger.info(`Server running on port ${config.port}`);
        try {
            const { schedulerService } = await import('./services/scheduler/service');
            schedulerService.init();
            logger.info('Scheduler initialized successfully');
        } catch (error) {
            logger.error('Failed to initialize scheduler:', error);
        }
    });
}

process.on('SIGTERM', async () => {
    logger.info('SIGTERM signal received: closing HTTP server');
    await prisma.$disconnect();
    process.exit(0);
});


// Vercel requires the app to be exported as module.exports
module.exports = app;
// Also keep default export for other tools if needed
export default app;
