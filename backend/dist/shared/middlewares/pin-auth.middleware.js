"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyPinMiddleware = void 0;
const database_1 = require("../database");
const ApiError_1 = require("../errors/ApiError");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const verifyPinMiddleware = async (req, res, next) => {
    try {
        const pin = req.headers['x-transaction-pin'];
        const shopkeeperId = req.user?.userId; // Assumes authMiddleware has run
        if (!shopkeeperId) {
            throw new ApiError_1.ApiError(401, 'User not authenticated');
        }
        if (!pin) {
            throw new ApiError_1.ApiError(400, 'Transaction PIN is required');
        }
        const shopkeeper = await database_1.prisma.shopkeeper.findUnique({
            where: { id: shopkeeperId }
        });
        if (!shopkeeper || !shopkeeper.transactionPin) {
            // If no PIN set, maybe allow default or block
            // For now, let's treat unset PIN as strictly blocking -> they must set it first
            // But for Phase 7 initial rollout, we might want to check against "1234" if null?
            // Plan says: "Initial Setup: The PIN will default to 1234 for existing users"
            // Let's implement that logic here or in a migration.
            // Better: If null, check against default "1234" hash? 
            // Or simpler: strictly require it. 
            // Let's go with strict check against DB value. If null, fail.
            throw new ApiError_1.ApiError(403, 'Transaction PIN not set. Please set up your security PIN.');
        }
        const isValid = await bcryptjs_1.default.compare(pin, shopkeeper.transactionPin);
        if (!isValid) {
            throw new ApiError_1.ApiError(403, 'Invalid Transaction PIN');
        }
        next();
    }
    catch (error) {
        next(error);
    }
};
exports.verifyPinMiddleware = verifyPinMiddleware;
