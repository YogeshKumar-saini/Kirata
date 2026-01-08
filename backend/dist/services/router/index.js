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
exports.routeMessage = void 0;
const logger_1 = require("../../shared/utils/logger");
const database_1 = require("../../shared/database");
const ShopService = __importStar(require("../shops/service"));
const strategies_1 = require("./strategies");
const routeMessage = async (messageId, phone, text) => {
    logger_1.logger.info(`Routing message ${messageId}: ${text}`);
    try {
        // 1. Identify User Context
        // Try Shopkeeper
        let user = await database_1.prisma.shopkeeper.findUnique({ where: { phone } });
        let role = 'SHOPKEEPER';
        if (!user) {
            // Try Customer
            user = await database_1.prisma.customer.findUnique({ where: { phone } });
            role = 'CUSTOMER';
            if (!user) {
                // New Customer Registration Flow could be a strategy too, 
                // but for now let's auto-create as per original logic if it was a customer flow.
                // Or better, let strategies decide. 
                // But strategies need a user object.
                // Let's keep the auto-create logic here for now to maintain behavior.
                user = await ShopService.findOrCreateCustomer(phone);
                role = 'CUSTOMER';
            }
        }
        // Attach role to user object for strategies
        user.role = role;
        // 2. Find and Execute Strategy
        for (const strategy of strategies_1.strategies) {
            if (strategy.canHandle(text, user)) {
                await strategy.execute(text, user);
                return;
            }
        }
        logger_1.logger.info(`No strategy found for message: ${text}`);
    }
    catch (err) {
        logger_1.logger.error('Routing Error', err);
    }
};
exports.routeMessage = routeMessage;
