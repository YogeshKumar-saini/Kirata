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
exports.UdhaarStrategy = exports.SaleStrategy = void 0;
const LedgerService = __importStar(require("../../ledger/service"));
const ShopService = __importStar(require("../../shops/service"));
const logger_1 = require("../../../shared/utils/logger");
class SaleStrategy {
    canHandle(text, user) {
        return user.role === 'SHOPKEEPER' && text.toLowerCase().startsWith('sale');
    }
    async execute(text, user) {
        const parts = text.split(' ');
        const amount = parseFloat(parts[1]);
        if (isNaN(amount)) {
            logger_1.logger.warn('Invalid sale amount', { text });
            return;
        }
        // Ideally fetch shop by user.id/phone
        const shop = await ShopService.getShopByOwner(user.phone);
        if (!shop) {
            logger_1.logger.warn('Shopkeeper has no shop', { phone: user.phone });
            return;
        }
        await LedgerService.recordSale(shop.shopId, amount, 'CASH', 'MANUAL');
        logger_1.logger.info(`Recorded sale of ${amount} for shop ${shop.shopId}`);
    }
}
exports.SaleStrategy = SaleStrategy;
class UdhaarStrategy {
    canHandle(text, user) {
        const lower = text.toLowerCase();
        return user.role === 'SHOPKEEPER' && (lower.startsWith('udhaar') || lower.startsWith('credit'));
    }
    async execute(text, user) {
        const parts = text.split(' ');
        const amount = parseFloat(parts[1]);
        const customerName = parts.slice(2).join(' ');
        if (isNaN(amount) || !customerName) {
            logger_1.logger.warn('Invalid udhaar format', { text });
            return;
        }
        const shop = await ShopService.getShopByOwner(user.phone);
        if (!shop)
            return;
        logger_1.logger.info(`Processing Udhaar for ${customerName} amount ${amount}`);
        // Placeholder: Logic to find customer and record udhaar would go here
    }
}
exports.UdhaarStrategy = UdhaarStrategy;
