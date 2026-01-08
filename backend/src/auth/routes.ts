import { Router } from 'express';
import * as AuthService from './service';
import * as GoogleAuthService from './google.service';
import { authMiddleware } from './middleware';
import { prisma } from '../shared/database';
import { AdminRole } from '@prisma/client';
import { validate } from '../shared/middlewares/validate.middleware';
import { asyncHandler } from '../shared/middlewares/asyncHandler';
import {
    registerAdminSchema,
    registerUserSchema,
    requestOtpSchema,
    unifiedLoginSchema,
    resetPasswordRequestSchema,
    resetPasswordConfirmSchema,
    updateProfileSchema,
    changeEmailRequestSchema,
    changeEmailConfirmSchema,
    changePhoneRequestSchema,
    changePhoneConfirmSchema,
    verifyEmailSchema,
    unlockAccountSchema,
    setPinSchema,
    verifyPinSchema,
    updatePasswordSchema
} from '../shared/validations/auth.validation';
import { ApiError } from '../shared/errors/ApiError';
import { otpLimiter, loginLimiter } from '../shared/middlewares/rateLimiter';
import { requireRole } from '../shared/middlewares/rbac.middleware';

const router = Router();

// Only SUPER_ADMIN can register new admins
router.post('/auth/admin/register', authMiddleware(), requireRole('SUPER_ADMIN'), validate(registerAdminSchema), asyncHandler(async (req, res) => {
    const { email, phone, password, role, name } = req.body;
    const result = await AuthService.registerAdmin(email, phone, password, role as AdminRole, name);
    res.json(result);
}));

// --- APP ROUTES ---

// --- APP ROUTES ---
// 1. Explicit Register Routes
router.post('/shopkeeper/register', validate(registerUserSchema), asyncHandler(async (req, res) => {
    const { phone, email, name } = req.body;
    const result = await AuthService.registerShopkeeper(phone, email, name);
    res.json(result);
}));

router.post('/customer/register', validate(registerUserSchema), asyncHandler(async (req, res) => {
    const { phone, email, name } = req.body;
    const result = await AuthService.registerCustomer(phone, email, name);
    res.json(result);
}));

router.post('/auth/google', asyncHandler(async (req, res) => {
    console.log('[Back] Route /auth/google HIT. Body token length:', req.body.token?.length);
    const { token } = req.body;
    if (!token) throw new ApiError(400, "Google token required");
    const result = await GoogleAuthService.handleGoogleLogin(token);
    console.log('[Back] Route /auth/google Result:', result.status ? result.status : 'Success');
    res.json(result);
}));

router.post('/auth/google/register', asyncHandler(async (req, res) => {
    const { token, role } = req.body;
    if (!token || !role) throw new ApiError(400, "Token and Role required");
    if (!['SHOPKEEPER', 'CUSTOMER'].includes(role)) throw new ApiError(400, "Invalid role");

    const result = await GoogleAuthService.registerWithGoogle(role, token);
    res.json(result);
}));

router.post('/auth/otp', otpLimiter, validate(requestOtpSchema), asyncHandler(async (req, res) => { // Login Request
    const { phone, email } = req.body;
    const result = await AuthService.requestAppOTP(phone, email);
    res.json(result);
}));

router.post('/auth/login', loginLimiter, validate(unifiedLoginSchema), asyncHandler(async (req, res) => { // Unified Login (OTP or Password)
    const { phone, email, otp, password } = req.body;
    let result;
    if (otp) {
        result = await AuthService.verifyAppOTP(phone, email, otp);
    } else {
        result = await AuthService.loginWithPassword(phone, email, password);
    }
    res.json(result);
}));

router.post('/auth/resend-otp', otpLimiter, validate(requestOtpSchema), asyncHandler(async (req, res) => { // Resend OTP
    const { phone, email } = req.body;
    const result = await AuthService.requestAppOTP(phone, email);
    res.json({ ...result, message: "OTP resent successfully" });
}));

router.post('/auth/password/reset-request', validate(resetPasswordRequestSchema), asyncHandler(async (req, res) => {
    const { phone, email } = req.body;
    const result = await AuthService.requestPasswordReset(phone, email);
    res.json({ message: "OTP sent for password reset." });
}));

router.post('/auth/password/reset-confirm', validate(resetPasswordConfirmSchema), asyncHandler(async (req, res) => {
    const { phone, email, otp, newPassword } = req.body;
    const result = await AuthService.confirmPasswordReset(phone, email, otp, newPassword);
    res.json(result);
}));

router.post('/auth/refresh', asyncHandler(async (req, res) => {
    const { refreshToken } = req.body;
    if (!refreshToken) throw new ApiError(400, "Refresh token required");
    const result = await AuthService.refreshAccessToken(refreshToken);
    res.json(result);
}));

// Protected Profile Route (Dashboard Data)
router.get('/me', authMiddleware(), asyncHandler(async (req, res) => {
    const { userId, role } = (req as any).user;
    let profile;

    if (['SUPER_ADMIN', 'SHOP_MANAGER_ADMIN', 'SUPPORT_ADMIN'].includes(role)) {
        profile = await prisma.admin.findUnique({ where: { adminId: userId } });
    } else if (role === 'SHOPKEEPER') {
        profile = await prisma.shopkeeper.findUnique({
            where: { id: userId },
            include: { shops: true }
        });
    } else if (role === 'CUSTOMER') {
        profile = await prisma.customer.findUnique({ where: { id: userId } });
    }

    if (!profile) throw new ApiError(404, 'User not found');
    res.json({ role, profile });
}));

router.put('/me', authMiddleware(), validate(updateProfileSchema), asyncHandler(async (req, res) => {
    const { userId, role } = (req as any).user;
    const { name, address, addressLine1, addressLine2, city, state, pincode } = req.body;
    const result = await AuthService.updateProfile(userId, role, { name, address, addressLine1, addressLine2, city, state, pincode });
    res.json(result);
}));

router.patch('/me/password', authMiddleware(), validate(updatePasswordSchema), asyncHandler(async (req, res) => {
    const { userId, role } = (req as any).user;
    const { currentPassword, newPassword } = req.body;
    const result = await AuthService.updatePassword(userId, role, { currentPassword, newPassword });
    res.json(result);
}));

// Account Management
router.delete('/me', authMiddleware(), asyncHandler(async (req, res) => {
    const { userId, role } = (req as any).user;
    const result = await AuthService.deactivateAccount(userId, role);
    res.json(result);
}));

router.post('/me/reactivate', authMiddleware(), asyncHandler(async (req, res) => {
    const { userId, role } = (req as any).user;
    const result = await AuthService.reactivateAccount(userId, role);
    res.json(result);
}));

// Session Management
router.get('/sessions', authMiddleware(), asyncHandler(async (req, res) => {
    const { userId } = (req as any).user;
    const result = await AuthService.listActiveSessions(userId);
    res.json(result);
}));

router.delete('/sessions/:sessionId', authMiddleware(), asyncHandler(async (req, res) => {
    const { userId } = (req as any).user;
    const { sessionId } = req.params;
    const result = await AuthService.revokeSession(userId, sessionId);
    res.json(result);
}));

router.delete('/sessions', authMiddleware(), asyncHandler(async (req, res) => {
    const { userId } = (req as any).user;
    const result = await AuthService.revokeAllSessions(userId);
    res.json(result);
}));

// Change Email/Phone
router.post('/me/change-email/request', authMiddleware(), validate(changeEmailRequestSchema), asyncHandler(async (req, res) => {
    const { userId, role } = (req as any).user;
    const { newEmail } = req.body;
    const result = await AuthService.requestEmailChange(userId, role, newEmail);
    res.json(result);
}));

router.post('/me/change-email/confirm', authMiddleware(), validate(changeEmailConfirmSchema), asyncHandler(async (req, res) => {
    const { userId, role } = (req as any).user;
    const { newEmail, otp } = req.body;
    const result = await AuthService.confirmEmailChange(userId, role, newEmail, otp);
    res.json(result);
}));

router.post('/me/change-phone/request', authMiddleware(), validate(changePhoneRequestSchema), asyncHandler(async (req, res) => {
    const { userId, role } = (req as any).user;
    const { newPhone } = req.body;
    const result = await AuthService.requestPhoneChange(userId, role, newPhone);
    res.json(result);
}));

router.post('/me/change-phone/confirm', authMiddleware(), validate(changePhoneConfirmSchema), asyncHandler(async (req, res) => {
    const { userId, role } = (req as any).user;
    const { newPhone, otp } = req.body;
    const result = await AuthService.confirmPhoneChange(userId, role, newPhone, otp);
    res.json(result);
}));

// Email Verification
router.post('/me/verify-email/send', authMiddleware(), asyncHandler(async (req, res) => {
    const { userId, role } = (req as any).user;
    const result = await AuthService.sendEmailVerification(userId, role);
    res.json(result);
}));

router.post('/me/verify-email/confirm', authMiddleware(), validate(verifyEmailSchema), asyncHandler(async (req, res) => {
    const { userId, role } = (req as any).user;
    const { otp } = req.body;
    const result = await AuthService.verifyEmail(userId, role, otp);
    res.json(result);
}));

// Admin: Unlock Account
router.post('/admin/unlock-account', authMiddleware(), requireRole('SUPER_ADMIN'), validate(unlockAccountSchema), asyncHandler(async (req, res) => {
    const { targetUserId, targetRole } = req.body;
    const result = await AuthService.unlockAccount(targetUserId, targetRole);
    res.json(result);
}));

// Transaction PIN Management
router.post('/me/pin/set', authMiddleware(['SHOPKEEPER']), validate(setPinSchema), asyncHandler(async (req, res) => {
    const { userId, role } = (req as any).user;
    const { pin } = req.body;
    const result = await AuthService.setTransactionPin(userId, role, pin);
    res.json(result);
}));

router.post('/me/pin/verify', authMiddleware(['SHOPKEEPER']), validate(verifyPinSchema), asyncHandler(async (req, res) => {
    const { userId, role } = (req as any).user;
    const { pin } = req.body;
    const isValid = await AuthService.verifyTransactionPin(userId, role, pin);
    res.json({ isValid });
}));

export default router;
