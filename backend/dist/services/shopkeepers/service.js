"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.shopkeeperService = void 0;
const database_1 = require("../../shared/database");
const ApiError_1 = require("../../shared/errors/ApiError");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
class ShopkeeperService {
    /**
     * Set or Update Transaction PIN
     */
    async setTransactionPin(shopkeeperId, pin) {
        if (!/^\d{4}$/.test(pin)) {
            throw new ApiError_1.ApiError(400, 'PIN must be exactly 4 digits');
        }
        const hashedPin = await bcryptjs_1.default.hash(pin, 10);
        await database_1.prisma.shopkeeper.update({
            where: { id: shopkeeperId },
            data: { transactionPin: hashedPin }
        });
        return { message: 'Transaction PIN updated successfully' };
    }
    /**
     * Verify Transaction PIN (Helper for other services if needed)
     */
    async verifyTransactionPin(shopkeeperId, pin) {
        const shopkeeper = await database_1.prisma.shopkeeper.findUnique({
            where: { id: shopkeeperId }
        });
        if (!shopkeeper || !shopkeeper.transactionPin) {
            return false;
        }
        return bcryptjs_1.default.compare(pin, shopkeeper.transactionPin);
    }
}
exports.shopkeeperService = new ShopkeeperService();
