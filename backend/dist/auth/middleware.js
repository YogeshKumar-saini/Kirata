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
exports.pinMiddleware = exports.verifyWebhookSignature = exports.authMiddleware = void 0;
const utils_1 = require("./utils");
const asyncHandler_1 = require("../shared/middlewares/asyncHandler");
const ApiError_1 = require("../shared/errors/ApiError");
const AuthService = __importStar(require("./service"));
const authMiddleware = (roles = []) => {
    return (req, res, next) => {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ error: 'No token provided' });
        }
        const token = authHeader.split(' ')[1];
        try {
            const decoded = (0, utils_1.verifyToken)(token);
            req.user = decoded;
            if (roles.length > 0 && !roles.includes(decoded.role)) {
                return res.status(403).json({ error: 'Insufficient permissions' });
            }
            next();
        }
        catch (error) {
            return res.status(401).json({ error: 'Invalid token' });
        }
    };
};
exports.authMiddleware = authMiddleware;
// WhatsApp Webhook Signature Verification (Placeholder)
const verifyWebhookSignature = (req, res, next) => {
    // In production, verify X-Hub-Signature-256
    // const signature = req.headers['x-hub-signature-256'];
    // ... validation logic ...
    next();
};
exports.verifyWebhookSignature = verifyWebhookSignature;
exports.pinMiddleware = (0, asyncHandler_1.asyncHandler)(async (req, res, next) => {
    const pin = req.headers['x-transaction-pin'];
    const user = req.user;
    if (!user)
        throw new ApiError_1.ApiError(401, "User not authenticated");
    // Only enforce for Shopkeepers for now
    if (user.role === 'SHOPKEEPER') {
        if (!pin)
            throw new ApiError_1.ApiError(403, "Transaction PIN required");
        const isValid = await AuthService.verifyTransactionPin(user.userId, user.role, pin);
        if (!isValid)
            throw new ApiError_1.ApiError(403, "Invalid Transaction PIN");
    }
    next();
});
