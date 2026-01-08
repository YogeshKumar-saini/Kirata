"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
console.log('1. Starting index.ts');
const config_1 = require("./shared/config");
console.log('2. Config loaded');
const logger_1 = require("./shared/utils/logger");
console.log('3. Logger loaded');
console.log('4. Prisma loaded');
const app_1 = require("./app");
console.log('5. App loaded');
// Only start the server if not in Vercel
if (process.env.VERCEL !== '1') {
    app_1.app.listen(config_1.config.port, async () => {
        logger_1.logger.info(`Server running on port ${config_1.config.port}`);
        try {
            const { schedulerService } = await Promise.resolve().then(() => __importStar(require('./services/scheduler/service')));
            schedulerService.init();
            logger_1.logger.info('Scheduler initialized successfully');
        }
        catch (error) {
            logger_1.logger.error('Failed to initialize scheduler:', error);
        }
    });
}
process.exit(0);
;
// Vercel requires the app to be exported as module.exports
module.exports = app_1.app;
// Also keep default export for other tools if needed
exports.default = app_1.app;
