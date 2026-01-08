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
const express_1 = require("express");
const AuthService = __importStar(require("./service"));
const GoogleAuthService = __importStar(require("./google.service"));
const middleware_1 = require("./middleware");
const database_1 = require("../shared/database");
const validate_middleware_1 = require("../shared/middlewares/validate.middleware");
const asyncHandler_1 = require("../shared/middlewares/asyncHandler");
const auth_validation_1 = require("../shared/validations/auth.validation");
const ApiError_1 = require("../shared/errors/ApiError");
const rateLimiter_1 = require("../shared/middlewares/rateLimiter");
const rbac_middleware_1 = require("../shared/middlewares/rbac.middleware");
const router = (0, express_1.Router)();
// Only SUPER_ADMIN can register new admins
router.post('/auth/admin/register', (0, middleware_1.authMiddleware)(), (0, rbac_middleware_1.requireRole)('SUPER_ADMIN'), (0, validate_middleware_1.validate)(auth_validation_1.registerAdminSchema), (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { email, phone, password, role, name } = req.body;
    const result = await AuthService.registerAdmin(email, phone, password, role, name);
    res.json(result);
}));
// --- APP ROUTES ---
// --- APP ROUTES ---
// 1. Explicit Register Routes
router.post('/shopkeeper/register', (0, validate_middleware_1.validate)(auth_validation_1.registerUserSchema), (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { phone, email, name } = req.body;
    const result = await AuthService.registerShopkeeper(phone, email, name);
    res.json(result);
}));
router.post('/customer/register', (0, validate_middleware_1.validate)(auth_validation_1.registerUserSchema), (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { phone, email, name } = req.body;
    const result = await AuthService.registerCustomer(phone, email, name);
    res.json(result);
}));
router.post('/auth/google', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    console.log('[Back] Route /auth/google HIT. Body token length:', req.body.token?.length);
    const { token } = req.body;
    if (!token)
        throw new ApiError_1.ApiError(400, "Google token required");
    const result = await GoogleAuthService.handleGoogleLogin(token);
    console.log('[Back] Route /auth/google Result:', result.status ? result.status : 'Success');
    res.json(result);
}));
router.post('/auth/google/register', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { token, role } = req.body;
    if (!token || !role)
        throw new ApiError_1.ApiError(400, "Token and Role required");
    if (!['SHOPKEEPER', 'CUSTOMER'].includes(role))
        throw new ApiError_1.ApiError(400, "Invalid role");
    const result = await GoogleAuthService.registerWithGoogle(role, token);
    res.json(result);
}));
router.post('/auth/otp', rateLimiter_1.otpLimiter, (0, validate_middleware_1.validate)(auth_validation_1.requestOtpSchema), (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { phone, email } = req.body;
    const result = await AuthService.requestAppOTP(phone, email);
    res.json(result);
}));
router.post('/auth/login', rateLimiter_1.loginLimiter, (0, validate_middleware_1.validate)(auth_validation_1.unifiedLoginSchema), (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { phone, email, otp, password } = req.body;
    let result;
    if (otp) {
        result = await AuthService.verifyAppOTP(phone, email, otp);
    }
    else {
        result = await AuthService.loginWithPassword(phone, email, password);
    }
    res.json(result);
}));
router.post('/auth/resend-otp', rateLimiter_1.otpLimiter, (0, validate_middleware_1.validate)(auth_validation_1.requestOtpSchema), (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { phone, email } = req.body;
    const result = await AuthService.requestAppOTP(phone, email);
    res.json({ ...result, message: "OTP resent successfully" });
}));
router.post('/auth/password/reset-request', (0, validate_middleware_1.validate)(auth_validation_1.resetPasswordRequestSchema), (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { phone, email } = req.body;
    const result = await AuthService.requestPasswordReset(phone, email);
    res.json({ message: "OTP sent for password reset." });
}));
router.post('/auth/password/reset-confirm', (0, validate_middleware_1.validate)(auth_validation_1.resetPasswordConfirmSchema), (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { phone, email, otp, newPassword } = req.body;
    const result = await AuthService.confirmPasswordReset(phone, email, otp, newPassword);
    res.json(result);
}));
router.post('/auth/refresh', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { refreshToken } = req.body;
    if (!refreshToken)
        throw new ApiError_1.ApiError(400, "Refresh token required");
    const result = await AuthService.refreshAccessToken(refreshToken);
    res.json(result);
}));
// Protected Profile Route (Dashboard Data)
router.get('/me', (0, middleware_1.authMiddleware)(), (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { userId, role } = req.user;
    let profile;
    if (['SUPER_ADMIN', 'SHOP_MANAGER_ADMIN', 'SUPPORT_ADMIN'].includes(role)) {
        profile = await database_1.prisma.admin.findUnique({ where: { adminId: userId } });
    }
    else if (role === 'SHOPKEEPER') {
        profile = await database_1.prisma.shopkeeper.findUnique({
            where: { id: userId },
            include: { shops: true }
        });
    }
    else if (role === 'CUSTOMER') {
        profile = await database_1.prisma.customer.findUnique({ where: { id: userId } });
    }
    if (!profile)
        throw new ApiError_1.ApiError(404, 'User not found');
    res.json({ role, profile });
}));
router.put('/me', (0, middleware_1.authMiddleware)(), (0, validate_middleware_1.validate)(auth_validation_1.updateProfileSchema), (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { userId, role } = req.user;
    const { name, address, addressLine1, addressLine2, city, state, pincode } = req.body;
    const result = await AuthService.updateProfile(userId, role, { name, address, addressLine1, addressLine2, city, state, pincode });
    res.json(result);
}));
router.patch('/me/password', (0, middleware_1.authMiddleware)(), (0, validate_middleware_1.validate)(auth_validation_1.updatePasswordSchema), (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { userId, role } = req.user;
    const { currentPassword, newPassword } = req.body;
    const result = await AuthService.updatePassword(userId, role, { currentPassword, newPassword });
    res.json(result);
}));
// Account Management
router.delete('/me', (0, middleware_1.authMiddleware)(), (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { userId, role } = req.user;
    const result = await AuthService.deactivateAccount(userId, role);
    res.json(result);
}));
router.post('/me/reactivate', (0, middleware_1.authMiddleware)(), (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { userId, role } = req.user;
    const result = await AuthService.reactivateAccount(userId, role);
    res.json(result);
}));
// Session Management
router.get('/sessions', (0, middleware_1.authMiddleware)(), (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { userId } = req.user;
    const result = await AuthService.listActiveSessions(userId);
    res.json(result);
}));
router.delete('/sessions/:sessionId', (0, middleware_1.authMiddleware)(), (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { userId } = req.user;
    const { sessionId } = req.params;
    const result = await AuthService.revokeSession(userId, sessionId);
    res.json(result);
}));
router.delete('/sessions', (0, middleware_1.authMiddleware)(), (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { userId } = req.user;
    const result = await AuthService.revokeAllSessions(userId);
    res.json(result);
}));
// Change Email/Phone
router.post('/me/change-email/request', (0, middleware_1.authMiddleware)(), (0, validate_middleware_1.validate)(auth_validation_1.changeEmailRequestSchema), (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { userId, role } = req.user;
    const { newEmail } = req.body;
    const result = await AuthService.requestEmailChange(userId, role, newEmail);
    res.json(result);
}));
router.post('/me/change-email/confirm', (0, middleware_1.authMiddleware)(), (0, validate_middleware_1.validate)(auth_validation_1.changeEmailConfirmSchema), (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { userId, role } = req.user;
    const { newEmail, otp } = req.body;
    const result = await AuthService.confirmEmailChange(userId, role, newEmail, otp);
    res.json(result);
}));
router.post('/me/change-phone/request', (0, middleware_1.authMiddleware)(), (0, validate_middleware_1.validate)(auth_validation_1.changePhoneRequestSchema), (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { userId, role } = req.user;
    const { newPhone } = req.body;
    const result = await AuthService.requestPhoneChange(userId, role, newPhone);
    res.json(result);
}));
router.post('/me/change-phone/confirm', (0, middleware_1.authMiddleware)(), (0, validate_middleware_1.validate)(auth_validation_1.changePhoneConfirmSchema), (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { userId, role } = req.user;
    const { newPhone, otp } = req.body;
    const result = await AuthService.confirmPhoneChange(userId, role, newPhone, otp);
    res.json(result);
}));
// Email Verification
router.post('/me/verify-email/send', (0, middleware_1.authMiddleware)(), (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { userId, role } = req.user;
    const result = await AuthService.sendEmailVerification(userId, role);
    res.json(result);
}));
router.post('/me/verify-email/confirm', (0, middleware_1.authMiddleware)(), (0, validate_middleware_1.validate)(auth_validation_1.verifyEmailSchema), (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { userId, role } = req.user;
    const { otp } = req.body;
    const result = await AuthService.verifyEmail(userId, role, otp);
    res.json(result);
}));
// Admin: Unlock Account
router.post('/admin/unlock-account', (0, middleware_1.authMiddleware)(), (0, rbac_middleware_1.requireRole)('SUPER_ADMIN'), (0, validate_middleware_1.validate)(auth_validation_1.unlockAccountSchema), (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { targetUserId, targetRole } = req.body;
    const result = await AuthService.unlockAccount(targetUserId, targetRole);
    res.json(result);
}));
// Transaction PIN Management
router.post('/me/pin/set', (0, middleware_1.authMiddleware)(['SHOPKEEPER']), (0, validate_middleware_1.validate)(auth_validation_1.setPinSchema), (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { userId, role } = req.user;
    const { pin } = req.body;
    const result = await AuthService.setTransactionPin(userId, role, pin);
    res.json(result);
}));
router.post('/me/pin/verify', (0, middleware_1.authMiddleware)(['SHOPKEEPER']), (0, validate_middleware_1.validate)(auth_validation_1.verifyPinSchema), (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { userId, role } = req.user;
    const { pin } = req.body;
    const isValid = await AuthService.verifyTransactionPin(userId, role, pin);
    res.json({ isValid });
}));
exports.default = router;
