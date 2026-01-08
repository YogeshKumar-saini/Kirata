import { prisma } from '../shared/database';
import { logger } from '../shared/utils/logger';
import { AdminRole } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { signToken } from './utils';
import { ApiError } from '../shared/errors/ApiError';
import { v4 as uuidv4 } from 'uuid';
import { notificationService } from '../services/notifications/service';

export const generateOTP = (): string => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

export const generateReadableId = (identifier: string, name?: string): string => {
    // 1. Base: Try Name first, then Email username, then "user"
    let base = "user";

    if (name) {
        base = name.toLowerCase().replace(/[^a-z0-9]/g, '');
    } else if (identifier.includes('@')) {
        // Use email username
        base = identifier.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
    }

    // 2. Suffix: Random 4 char string
    const suffix = Math.random().toString(36).substring(2, 6);

    // 3. Fallback
    if (base.length === 0) base = "user";

    return `${base}${suffix}`;
};

const checkUniqueIdTaken = async (uniqueId: string): Promise<boolean> => {
    if (await prisma.admin.findUnique({ where: { uniqueId } })) return true;
    if (await prisma.shopkeeper.findUnique({ where: { uniqueId } })) return true;
    if (await prisma.customer.findUnique({ where: { uniqueId } })) return true;
    return false;
};

export const generateGlobalUniqueId = async (identifier: string, name?: string): Promise<string> => {
    let uniqueId = generateReadableId(identifier, name);
    let isTaken = await checkUniqueIdTaken(uniqueId);
    let attempts = 0;
    while (isTaken && attempts < 5) {
        uniqueId = generateReadableId(identifier, name);
        isTaken = await checkUniqueIdTaken(uniqueId);
        attempts++;
    }
    if (isTaken) throw new ApiError(500, "Failed to generate unique ID. Please try again.");
    return uniqueId;
};

// Audit Logging Helper
const logAudit = async (userId: string | undefined, action: string, details: any) => {
    try {
        await prisma.auditLog.create({
            data: { userId, action, details }
        });
    } catch (error) {
        console.error("Failed to log audit:", error); // Fail safe, don't crash main flow
    }
};

// Generate Refresh Token
const generateRefreshToken = async (userId: string) => {
    const token = uuidv4(); // Use UUID as refresh token
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // 30 days

    await prisma.refreshToken.create({
        data: { userId, token, expiresAt }
    });

    return token;
};

// Refresh Access Token
export const refreshAccessToken = async (refreshToken: string) => {
    const tokenRecord = await prisma.refreshToken.findUnique({
        where: { token: refreshToken }
    });

    if (!tokenRecord || tokenRecord.revoked) {
        throw new ApiError(401, "Invalid refresh token");
    }

    if (new Date() > tokenRecord.expiresAt) {
        throw new ApiError(401, "Refresh token expired");
    }

    // Revoke old token (rotation)
    await prisma.refreshToken.update({
        where: { token: refreshToken },
        data: { revoked: true }
    });

    // Find user to get role
    const admin = await prisma.admin.findFirst({ where: { adminId: tokenRecord.userId } });
    const shopkeeper = await prisma.shopkeeper.findFirst({ where: { id: tokenRecord.userId } });
    const customer = await prisma.customer.findFirst({ where: { id: tokenRecord.userId } });

    let role: string;
    if (admin) role = admin.role;
    else if (shopkeeper) role = 'SHOPKEEPER';
    else if (customer) role = 'CUSTOMER';
    else throw new ApiError(404, "User not found");

    // Generate new tokens
    const accessToken = signToken({ userId: tokenRecord.userId, role });
    const newRefreshToken = await generateRefreshToken(tokenRecord.userId);

    await logAudit(tokenRecord.userId, 'TOKEN_REFRESH', { role });

    return { accessToken, refreshToken: newRefreshToken };
};

// Helper to find user across all tables
const findUserByIdentifier = async (phone?: string, email?: string) => {
    // 1. Check Admin
    let user: any = await prisma.admin.findFirst({ where: phone ? { phone } : { email } });
    if (user) return { user, role: user.role, type: 'ADMIN' };

    // 2. Check Shopkeeper
    user = await prisma.shopkeeper.findFirst({ where: phone ? { phone } : { email } });
    if (user) return { user, role: 'SHOPKEEPER', type: 'SHOPKEEPER' };

    // 3. Check Customer
    user = await prisma.customer.findFirst({ where: phone ? { phone } : { email } });
    if (user) return { user, role: 'CUSTOMER', type: 'CUSTOMER' };

    return null;
};

// --- ADMIN AUTH (Unified OTP + Optional Password) ---
const checkGlobalUniqueness = async (email?: string, phone?: string) => {
    if (email) {
        if (await prisma.admin.findUnique({ where: { email } })) throw new ApiError(400, 'Email already registered (Admin).');
        if (await prisma.shopkeeper.findUnique({ where: { email } })) throw new ApiError(400, 'Email already registered (Shopkeeper).');
        if (await prisma.customer.findUnique({ where: { email } })) throw new ApiError(400, 'Email already registered (Customer).');
    }
    if (phone) {
        if (await prisma.admin.findUnique({ where: { phone } })) throw new ApiError(400, 'Phone already registered (Admin).');
        if (await prisma.shopkeeper.findUnique({ where: { phone } })) throw new ApiError(400, 'Phone already registered (Shopkeeper).');
        if (await prisma.customer.findUnique({ where: { phone } })) throw new ApiError(400, 'Phone already registered (Customer).');
    }
};

// --- ADMIN AUTH (Unified OTP + Optional Password) ---
export const registerAdmin = async (email?: string, phone?: string, password?: string, role: AdminRole = 'SUPER_ADMIN', name?: string) => {
    // Check conflicts
    await checkGlobalUniqueness(email, phone);

    let hashedPassword = undefined;
    if (password) {
        hashedPassword = await bcrypt.hash(password, 10);
    }

    // Generate globally unique ID
    const uniqueId = await generateGlobalUniqueId(email || phone!, name);

    const admin = await prisma.admin.create({
        data: { email, phone, password: hashedPassword, role, name, uniqueId }
    });

    // Generate OTP for immediate verification if needed, roughly following the user flow
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    await prisma.admin.update({ where: { adminId: admin.adminId }, data: { otpSecret: otp, otpExpiry } });

    await notificationService.sendOTP(email || phone!, otp, email ? 'EMAIL' : 'SMS');
    await logAudit(admin.adminId, 'REGISTER_ADMIN', { role, email, phone });
    return { adminId: admin.adminId, uniqueId, message: 'Admin registered successfully. OTP sent.' };
};

export const loginAdmin = async (email: string, password: string) => {
    const admin = await prisma.admin.findUnique({ where: { email } });
    if (!admin || !admin.password) throw new ApiError(401, 'Invalid credentials');

    const isValid = await bcrypt.compare(password, admin.password);
    if (!isValid) throw new ApiError(401, 'Invalid credentials');

    const token = signToken({ userId: admin.adminId, role: admin.role });
    return { token, admin };
};

// --- APP AUTH (Shared: Admin, Shopkeeper, Customer) ---

// 1. Explicit Register (Shopkeeper)
export const registerShopkeeper = async (phone?: string, email?: string, name?: string) => {
    const identifier = (phone || email)!;

    // Check if user already exists
    const existingShopkeeper = await prisma.shopkeeper.findFirst({
        where: phone ? { phone } : { email }
    });

    // If user exists but hasn't verified OTP, allow re-registration (resend OTP)
    if (existingShopkeeper) {
        if (!existingShopkeeper.isPhoneVerified && !existingShopkeeper.isEmailVerified) {
            // User exists but not verified - resend OTP
            const otp = generateOTP();
            const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

            await prisma.shopkeeper.update({
                where: { id: existingShopkeeper.id },
                data: { otpSecret: otp, otpExpiry }
            });

            await notificationService.sendOTP(phone || email!, otp, phone ? 'SMS' : 'EMAIL');
            await logAudit(existingShopkeeper.id, 'OTP_RESENT', { phone, email, reason: 'Re-registration attempt' });

            return { message: 'Account exists but not verified. New OTP sent.', uniqueId: existingShopkeeper.uniqueId };
        } else {
            // User exists and is verified - throw error
            throw new ApiError(400, `${phone ? 'Phone' : 'Email'} already registered and verified. Please login instead.`);
        }
    }

    // New user - proceed with normal registration
    await checkGlobalUniqueness(email, phone);

    const uniqueId = await generateGlobalUniqueId(email || phone!, name);

    const shopkeeper = await prisma.shopkeeper.create({
        data: { phone, email, name, uniqueId }
    });

    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10m

    await prisma.shopkeeper.update({ where: { id: shopkeeper.id }, data: { otpSecret: otp, otpExpiry } });
    await notificationService.sendOTP(phone || email!, otp, phone ? 'SMS' : 'EMAIL');
    await logAudit(shopkeeper.id, 'REGISTER_SHOPKEEPER', { phone, email });
    return { message: 'Shopkeeper registered. OTP sent.', uniqueId };
};

// 2. Explicit Register (Customer)
export const registerCustomer = async (phone?: string, email?: string, name?: string) => {
    const identifier = (phone || email)!;

    // Check if user already exists
    const existingCustomer = await prisma.customer.findFirst({
        where: phone ? { phone } : { email }
    });

    // If user exists but hasn't verified OTP, allow re-registration (resend OTP)
    if (existingCustomer) {
        if (!existingCustomer.isPhoneVerified && !existingCustomer.isEmailVerified) {
            // User exists but not verified - resend OTP
            const otp = generateOTP();
            const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

            await prisma.customer.update({
                where: { id: existingCustomer.id },
                data: { otpSecret: otp, otpExpiry }
            });

            await notificationService.sendOTP(phone || email!, otp, phone ? 'SMS' : 'EMAIL');
            await logAudit(existingCustomer.id, 'OTP_RESENT', { phone, email, reason: 'Re-registration attempt' });

            return { message: 'Account exists but not verified. New OTP sent.', uniqueId: existingCustomer.uniqueId };
        } else {
            // User exists and is verified - throw error
            throw new ApiError(400, `${phone ? 'Phone' : 'Email'} already registered and verified. Please login instead.`);
        }
    }

    // New user - proceed with normal registration
    await checkGlobalUniqueness(email, phone);

    const uniqueId = await generateGlobalUniqueId(email || phone!, name);

    const customer = await prisma.customer.create({
        data: { phone, email, name, uniqueId }
    });

    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    await prisma.customer.update({ where: { id: customer.id }, data: { otpSecret: otp, otpExpiry } });
    await notificationService.sendOTP(email || phone!, otp, email ? 'EMAIL' : 'SMS');
    await logAudit(customer.id, 'REGISTER_CUSTOMER', { phone, email });
    return { message: 'Customer registered. OTP sent.', uniqueId };
};

// 4. Request OTP (Login/Verification)
export const requestAppOTP = async (phone?: string, email?: string) => {
    const found = await findUserByIdentifier(phone, email);

    if (!found) throw new ApiError(404, 'User not found. Please register.');
    const { user, type } = found;

    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    if (type === 'ADMIN') {
        await prisma.admin.update({ where: { adminId: user.adminId }, data: { otpSecret: otp, otpExpiry } });
    } else if (type === 'SHOPKEEPER') {
        await prisma.shopkeeper.update({ where: { id: user.id }, data: { otpSecret: otp, otpExpiry } });
    } else {
        await prisma.customer.update({ where: { id: user.id }, data: { otpSecret: otp, otpExpiry } });
    }

    await notificationService.sendOTP(phone || email!, otp, phone ? 'SMS' : 'EMAIL');

    return { message: "OTP sent successfully" };
};

// 4. Verify OTP (Login)
export const verifyAppOTP = async (phone?: string, email?: string, otp?: string) => {
    const found = await findUserByIdentifier(phone, email);

    if (!found) throw new ApiError(404, 'User not found');
    const { user, role, type } = found;

    if (user.otpSecret !== otp || new Date() > user.otpExpiry!) {
        throw new ApiError(401, 'Invalid or expired OTP');
    }

    // Clear OTP & Verify
    const userId = type === 'ADMIN' ? user.adminId : user.id;

    const updateData: any = {
        otpSecret: null,
        otpExpiry: null
    };

    // Set the correct verification flag based on what was used
    if (phone) {
        updateData.isPhoneVerified = true;
    } else if (email) {
        updateData.isEmailVerified = true;
    }

    // Auto-reactivate if account was deleted (grace period feature)
    if (user.deletedAt) {
        updateData.deletedAt = null;
        updateData.scheduledDeletionAt = null;
        await logAudit(userId, 'ACCOUNT_AUTO_REACTIVATED', { role, method: 'OTP_LOGIN' });
    }

    if (type === 'ADMIN') {
        await prisma.admin.update({ where: { adminId: user.adminId }, data: updateData });
    } else if (type === 'SHOPKEEPER') {
        await prisma.shopkeeper.update({ where: { id: user.id }, data: updateData });
    } else {
        await prisma.customer.update({ where: { id: user.id }, data: updateData });
    }

    const token = signToken({ userId, role });
    const refreshToken = await generateRefreshToken(userId);
    await logAudit(userId, 'LOGIN_OTP', { role, method: 'OTP' });

    const userResponse = type === 'ADMIN' ? user : { ...user, role };
    return { token, refreshToken, user: userResponse };
};

// 5. Unified Login with Password
export const loginWithPassword = async (phone?: string, email?: string, password?: string) => {
    const found = await findUserByIdentifier(phone, email);

    if (!found) throw new ApiError(404, 'User not found');
    const { user, role, type } = found;
    const userId = type === 'ADMIN' ? user.adminId : user.id;

    // Block deleted accounts from password login
    if (user.deletedAt) {
        await logAudit(userId, 'LOGIN_BLOCKED', { reason: 'Account deleted, use OTP to reactivate' });
        throw new ApiError(403, 'Account is deactivated. Please login with OTP to reactivate.');
    }

    // Check if account is locked
    if (user.lockedUntil && new Date() < user.lockedUntil) {
        await logAudit(userId, 'LOGIN_BLOCKED', { reason: 'Account locked' });
        throw new ApiError(403, `Account is locked until ${user.lockedUntil.toISOString()}. Too many failed login attempts.`);
    }

    if (!user.password) {
        throw new ApiError(400, 'Password not set. Please login with OTP or reset password.');
    }

    const isValid = await bcrypt.compare(password!, user.password);

    if (!isValid) {
        // Increment failed attempts
        const newFailedAttempts = (user.failedLoginAttempts || 0) + 1;
        const updateData: any = { failedLoginAttempts: newFailedAttempts };

        // Lock account after 5 failed attempts
        if (newFailedAttempts >= 5) {
            const lockUntil = new Date();
            lockUntil.setHours(lockUntil.getHours() + 1);
            updateData.lockedUntil = lockUntil;
        }

        if (type === 'ADMIN') {
            await prisma.admin.update({ where: { adminId: user.adminId }, data: updateData });
        } else if (type === 'SHOPKEEPER') {
            await prisma.shopkeeper.update({ where: { id: user.id }, data: updateData });
        } else {
            await prisma.customer.update({ where: { id: user.id }, data: updateData });
        }

        await logAudit(userId, 'LOGIN_FAILED', { phone, email, reason: "Invalid Password", failedAttempts: newFailedAttempts });
        throw new ApiError(401, newFailedAttempts >= 5 ? 'Account locked due to too many failed attempts. Try again in 1 hour.' : 'Invalid credentials');
    }

    // Reset failed attempts on successful login
    const resetData: any = { failedLoginAttempts: 0, lockedUntil: null };
    if (type === 'ADMIN') {
        await prisma.admin.update({ where: { adminId: user.adminId }, data: resetData });
    } else if (type === 'SHOPKEEPER') {
        await prisma.shopkeeper.update({ where: { id: user.id }, data: resetData });
    } else {
        await prisma.customer.update({ where: { id: user.id }, data: resetData });
    }

    const token = signToken({ userId, role });
    const refreshToken = await generateRefreshToken(userId);
    await logAudit(userId, 'LOGIN_PASSWORD', { role, method: 'PASSWORD' });

    const userResponse = type === 'ADMIN' ? user : { ...user, role };
    return { token, refreshToken, user: userResponse };
};

// 6. Request Password Reset (Send OTP) - Alias for requestAppOTP basically, but context differs
export const requestPasswordReset = async (phone?: string, email?: string) => {
    return requestAppOTP(phone, email);
};

// 7. Confirm Password Reset (Verify OTP + Set Password)
export const confirmPasswordReset = async (phone?: string, email?: string, otp?: string, newPassword?: string) => {
    const found = await findUserByIdentifier(phone, email);

    if (!found) throw new ApiError(404, 'User not found');
    const { user, type } = found;

    if (user.otpSecret !== otp || new Date() > user.otpExpiry!) {
        throw new ApiError(401, 'Invalid or expired OTP');
    }

    const hashedPassword = await bcrypt.hash(newPassword!, 10);

    // Update Password & Clear OTP
    if (type === 'ADMIN') {
        await prisma.admin.update({
            where: { adminId: user.adminId },
            data: { password: hashedPassword, otpSecret: null, otpExpiry: null, isPhoneVerified: true }
        });
    } else if (type === 'SHOPKEEPER') {
        await prisma.shopkeeper.update({
            where: { id: user.id },
            data: { password: hashedPassword, otpSecret: null, otpExpiry: null, isPhoneVerified: true }
        });
    } else {
        await prisma.customer.update({
            where: { id: user.id },
            data: { password: hashedPassword, otpSecret: null, otpExpiry: null, isPhoneVerified: true }
        });
    }

    const userId = type === 'ADMIN' ? user.adminId : user.id;
    await logAudit(userId, 'PASSWORD_CHANGE', { type });

    return { message: "Password updated successfully." };
};

// 8. Update Profile (Name, Address)
export const updateProfile = async (userId: string, role: string, data: { name?: string, address?: string, addressLine1?: string, addressLine2?: string, city?: string, state?: string, pincode?: string }) => {
    let update;
    // 1. Check Admin
    if (['SUPER_ADMIN', 'SHOP_MANAGER_ADMIN', 'SUPPORT_ADMIN'].includes(role)) {
        update = await prisma.admin.update({
            where: { adminId: userId },
            data: {
                name: data.name,
                address: data.address
            }
        });
    }
    // 2. Check Shopkeeper
    else if (role === 'SHOPKEEPER') {
        const { address, ...rest } = data; // Prioritize detailed fields
        update = await prisma.shopkeeper.update({
            where: { id: userId },
            data: rest // Pass all detailed fields
        });
    }
    // 3. Check Customer
    else if (role === 'CUSTOMER') {
        update = await prisma.customer.update({
            where: { id: userId },
            data: {
                name: data.name,
                address: data.address
            }
        });
    } else {
        throw new ApiError(400, "Invalid role for profile update");
    }

    await logAudit(userId, 'PROFILE_UPDATE', { role, updatedFields: Object.keys(data) });
    return { message: "Profile updated successfully", user: update };
};

// 23. Update Password (Logged in user)
export const updatePassword = async (userId: string, role: string, { currentPassword, newPassword }: { currentPassword?: string, newPassword: string }) => {
    let user: any;
    if (['SUPER_ADMIN', 'SHOP_MANAGER_ADMIN', 'SUPPORT_ADMIN'].includes(role)) {
        user = await prisma.admin.findUnique({ where: { adminId: userId } });
    } else if (role === 'SHOPKEEPER') {
        user = await prisma.shopkeeper.findUnique({ where: { id: userId } });
    } else {
        user = await prisma.customer.findUnique({ where: { id: userId } });
    }

    if (!user) throw new ApiError(404, "User not found");

    // If user has a password set, currentPassword is required
    if (user.password) {
        if (!currentPassword) throw new ApiError(400, "Current password is required");
        const isValid = await bcrypt.compare(currentPassword, user.password);
        if (!isValid) throw new ApiError(401, "Invalid current password");
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update
    if (['SUPER_ADMIN', 'SHOP_MANAGER_ADMIN', 'SUPPORT_ADMIN'].includes(role)) {
        await prisma.admin.update({ where: { adminId: userId }, data: { password: hashedPassword } });
    } else if (role === 'SHOPKEEPER') {
        await prisma.shopkeeper.update({ where: { id: userId }, data: { password: hashedPassword } });
    } else {
        await prisma.customer.update({ where: { id: userId }, data: { password: hashedPassword } });
    }

    await logAudit(userId, 'PASSWORD_UPDATED', { role });
    return { message: "Password updated successfully" };
};

// 9. Deactivate Account (Soft Delete with 30-day grace period)
export const deactivateAccount = async (userId: string, role: string) => {
    const now = new Date();
    const scheduledDeletion = new Date();
    scheduledDeletion.setDate(scheduledDeletion.getDate() + 30); // 30 days from now

    const updateData = {
        deletedAt: now,
        scheduledDeletionAt: scheduledDeletion,
        password: null // Disable password login
    };

    if (['SUPER_ADMIN', 'SHOP_MANAGER_ADMIN', 'SUPPORT_ADMIN'].includes(role)) {
        await prisma.admin.update({ where: { adminId: userId }, data: updateData });
    } else if (role === 'SHOPKEEPER') {
        await prisma.shopkeeper.update({ where: { id: userId }, data: updateData });
    } else if (role === 'CUSTOMER') {
        await prisma.customer.update({ where: { id: userId }, data: updateData });
    } else {
        throw new ApiError(400, "Invalid role");
    }

    await logAudit(userId, 'ACCOUNT_DEACTIVATED', { role, scheduledDeletionAt: scheduledDeletion });
    return {
        message: "Account deactivated. You can reactivate within 30 days by logging in with OTP.",
        scheduledDeletionAt: scheduledDeletion
    };
};

// 10. Reactivate Account (Cancel deletion)
export const reactivateAccount = async (userId: string, role: string) => {
    const updateData = {
        deletedAt: null,
        scheduledDeletionAt: null
    };

    if (['SUPER_ADMIN', 'SHOP_MANAGER_ADMIN', 'SUPPORT_ADMIN'].includes(role)) {
        await prisma.admin.update({ where: { adminId: userId }, data: updateData });
    } else if (role === 'SHOPKEEPER') {
        await prisma.shopkeeper.update({ where: { id: userId }, data: updateData });
    } else if (role === 'CUSTOMER') {
        await prisma.customer.update({ where: { id: userId }, data: updateData });
    } else {
        throw new ApiError(400, "Invalid role");
    }

    await logAudit(userId, 'ACCOUNT_REACTIVATED', { role });
    return { message: "Account reactivated successfully" };
};

// 11. Session Management - List Active Sessions
export const listActiveSessions = async (userId: string) => {
    const sessions = await prisma.refreshToken.findMany({
        where: { userId, revoked: false },
        select: { id: true, createdAt: true, expiresAt: true },
        orderBy: { createdAt: 'desc' }
    });
    return { sessions };
};

// 12. Revoke Specific Session
export const revokeSession = async (userId: string, sessionId: string) => {
    const session = await prisma.refreshToken.findUnique({ where: { id: sessionId } });

    if (!session || session.userId !== userId) {
        throw new ApiError(404, "Session not found");
    }

    await prisma.refreshToken.update({
        where: { id: sessionId },
        data: { revoked: true }
    });

    await logAudit(userId, 'SESSION_REVOKED', { sessionId });
    return { message: "Session revoked successfully" };
};

// 13. Revoke All Sessions (Logout all devices)
export const revokeAllSessions = async (userId: string) => {
    const result = await prisma.refreshToken.updateMany({
        where: { userId, revoked: false },
        data: { revoked: true }
    });

    await logAudit(userId, 'ALL_SESSIONS_REVOKED', { count: result.count });
    return { message: `${result.count} session(s) revoked successfully` };
};

// 14. Change Email (Request)
export const requestEmailChange = async (userId: string, role: string, newEmail: string) => {
    // Check if email already exists
    await checkGlobalUniqueness(newEmail, undefined);

    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    // Store OTP temporarily (we'll use otpSecret field)
    if (['SUPER_ADMIN', 'SHOP_MANAGER_ADMIN', 'SUPPORT_ADMIN'].includes(role)) {
        await prisma.admin.update({ where: { adminId: userId }, data: { otpSecret: otp, otpExpiry } });
    } else if (role === 'SHOPKEEPER') {
        await prisma.shopkeeper.update({ where: { id: userId }, data: { otpSecret: otp, otpExpiry } });
    } else {
        await prisma.customer.update({ where: { id: userId }, data: { otpSecret: otp, otpExpiry } });
    }

    await notificationService.sendOTP(newEmail, otp, 'EMAIL');
    await logAudit(userId, 'EMAIL_CHANGE_REQUESTED', { newEmail });
    return { message: "OTP sent to new email. Please verify to complete the change." };
};

// 15. Confirm Email Change
export const confirmEmailChange = async (userId: string, role: string, newEmail: string, otp: string) => {
    let user: any;

    if (['SUPER_ADMIN', 'SHOP_MANAGER_ADMIN', 'SUPPORT_ADMIN'].includes(role)) {
        user = await prisma.admin.findUnique({ where: { adminId: userId } });
    } else if (role === 'SHOPKEEPER') {
        user = await prisma.shopkeeper.findUnique({ where: { id: userId } });
    } else {
        user = await prisma.customer.findUnique({ where: { id: userId } });
    }

    if (!user || user.otpSecret !== otp || new Date() > user.otpExpiry!) {
        throw new ApiError(401, "Invalid or expired OTP");
    }

    // Update email
    if (['SUPER_ADMIN', 'SHOP_MANAGER_ADMIN', 'SUPPORT_ADMIN'].includes(role)) {
        await prisma.admin.update({ where: { adminId: userId }, data: { email: newEmail, otpSecret: null, otpExpiry: null, isEmailVerified: true } });
    } else if (role === 'SHOPKEEPER') {
        await prisma.shopkeeper.update({ where: { id: userId }, data: { email: newEmail, otpSecret: null, otpExpiry: null, isEmailVerified: true } });
    } else {
        await prisma.customer.update({ where: { id: userId }, data: { email: newEmail, otpSecret: null, otpExpiry: null, isEmailVerified: true } });
    }

    await logAudit(userId, 'EMAIL_CHANGED', { newEmail });
    return { message: "Email changed successfully" };
};

// 16. Change Phone (similar to email)
export const requestPhoneChange = async (userId: string, role: string, newPhone: string) => {
    await checkGlobalUniqueness(undefined, newPhone);

    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    if (['SUPER_ADMIN', 'SHOP_MANAGER_ADMIN', 'SUPPORT_ADMIN'].includes(role)) {
        await prisma.admin.update({ where: { adminId: userId }, data: { otpSecret: otp, otpExpiry } });
    } else if (role === 'SHOPKEEPER') {
        await prisma.shopkeeper.update({ where: { id: userId }, data: { otpSecret: otp, otpExpiry } });
    } else {
        await prisma.customer.update({ where: { id: userId }, data: { otpSecret: otp, otpExpiry } });
    }

    await notificationService.sendOTP(newPhone, otp, 'SMS');
    await logAudit(userId, 'PHONE_CHANGE_REQUESTED', { newPhone });
    return { message: "OTP sent to new phone. Please verify to complete the change." };
};

// 17. Confirm Phone Change
export const confirmPhoneChange = async (userId: string, role: string, newPhone: string, otp: string) => {
    let user: any;

    if (['SUPER_ADMIN', 'SHOP_MANAGER_ADMIN', 'SUPPORT_ADMIN'].includes(role)) {
        user = await prisma.admin.findUnique({ where: { adminId: userId } });
    } else if (role === 'SHOPKEEPER') {
        user = await prisma.shopkeeper.findUnique({ where: { id: userId } });
    } else {
        user = await prisma.customer.findUnique({ where: { id: userId } });
    }

    if (!user || user.otpSecret !== otp || new Date() > user.otpExpiry!) {
        throw new ApiError(401, "Invalid or expired OTP");
    }

    if (['SUPER_ADMIN', 'SHOP_MANAGER_ADMIN', 'SUPPORT_ADMIN'].includes(role)) {
        await prisma.admin.update({ where: { adminId: userId }, data: { phone: newPhone, otpSecret: null, otpExpiry: null, isPhoneVerified: true } });
    } else if (role === 'SHOPKEEPER') {
        await prisma.shopkeeper.update({ where: { id: userId }, data: { phone: newPhone, otpSecret: null, otpExpiry: null, isPhoneVerified: true } });
    } else {
        await prisma.customer.update({ where: { id: userId }, data: { phone: newPhone, otpSecret: null, otpExpiry: null, isPhoneVerified: true } });
    }

    await logAudit(userId, 'PHONE_CHANGED', { newPhone });
    return { message: "Phone changed successfully" };
};

// 18. Send Email Verification
export const sendEmailVerification = async (userId: string, role: string) => {
    let user: any;

    if (['SUPER_ADMIN', 'SHOP_MANAGER_ADMIN', 'SUPPORT_ADMIN'].includes(role)) {
        user = await prisma.admin.findUnique({ where: { adminId: userId } });
    } else if (role === 'SHOPKEEPER') {
        user = await prisma.shopkeeper.findUnique({ where: { id: userId } });
    } else {
        user = await prisma.customer.findUnique({ where: { id: userId } });
    }

    if (!user?.email) throw new ApiError(400, "No email associated with this account");
    if (user.isEmailVerified) throw new ApiError(400, "Email already verified");

    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    if (['SUPER_ADMIN', 'SHOP_MANAGER_ADMIN', 'SUPPORT_ADMIN'].includes(role)) {
        await prisma.admin.update({ where: { adminId: userId }, data: { otpSecret: otp, otpExpiry } });
    } else if (role === 'SHOPKEEPER') {
        await prisma.shopkeeper.update({ where: { id: userId }, data: { otpSecret: otp, otpExpiry } });
    } else {
        await prisma.customer.update({ where: { id: userId }, data: { otpSecret: otp, otpExpiry } });
    }

    await notificationService.sendOTP(user.email, otp, 'EMAIL');
    return { message: "Verification OTP sent to email" };
};

// 19. Verify Email
export const verifyEmail = async (userId: string, role: string, otp: string) => {
    let user: any;

    if (['SUPER_ADMIN', 'SHOP_MANAGER_ADMIN', 'SUPPORT_ADMIN'].includes(role)) {
        user = await prisma.admin.findUnique({ where: { adminId: userId } });
    } else if (role === 'SHOPKEEPER') {
        user = await prisma.shopkeeper.findUnique({ where: { id: userId } });
    } else {
        user = await prisma.customer.findUnique({ where: { id: userId } });
    }

    if (!user || user.otpSecret !== otp || new Date() > user.otpExpiry!) {
        throw new ApiError(401, "Invalid or expired OTP");
    }

    if (['SUPER_ADMIN', 'SHOP_MANAGER_ADMIN', 'SUPPORT_ADMIN'].includes(role)) {
        await prisma.admin.update({ where: { adminId: userId }, data: { isEmailVerified: true, otpSecret: null, otpExpiry: null } });
    } else if (role === 'SHOPKEEPER') {
        await prisma.shopkeeper.update({ where: { id: userId }, data: { isEmailVerified: true, otpSecret: null, otpExpiry: null } });
    } else {
        await prisma.customer.update({ where: { id: userId }, data: { isEmailVerified: true, otpSecret: null, otpExpiry: null } });
    }

    await logAudit(userId, 'EMAIL_VERIFIED', { role });
    return { message: "Email verified successfully" };
};

// 20. Unlock Account (Admin function)
export const unlockAccount = async (targetUserId: string, targetRole: string) => {
    const updateData = { failedLoginAttempts: 0, lockedUntil: null };

    if (['SUPER_ADMIN', 'SHOP_MANAGER_ADMIN', 'SUPPORT_ADMIN'].includes(targetRole)) {
        await prisma.admin.update({ where: { adminId: targetUserId }, data: updateData });
    } else if (targetRole === 'SHOPKEEPER') {
        await prisma.shopkeeper.update({ where: { id: targetUserId }, data: updateData });
    } else if (targetRole === 'CUSTOMER') {
        await prisma.customer.update({ where: { id: targetUserId }, data: updateData });
    } else {
        throw new ApiError(400, "Invalid role");
    }

    await logAudit(targetUserId, 'ACCOUNT_UNLOCKED_BY_ADMIN', { targetRole });
    return { message: "Account unlocked successfully" };
};

// 21. Set Transaction PIN (Shopkeeper)
export const setTransactionPin = async (userId: string, role: string, pin: string) => {
    if (role !== 'SHOPKEEPER') throw new ApiError(403, "Only shopkeepers can set transaction PIN");

    if (!/^\d{4,6}$/.test(pin)) {
        throw new ApiError(400, "PIN must be 4-6 digits");
    }

    const hashedPin = await bcrypt.hash(pin, 10);

    await prisma.shopkeeper.update({
        where: { id: userId },
        data: { transactionPin: hashedPin }
    });

    await logAudit(userId, 'PIN_SET', { role });
    return { message: "Transaction PIN set successfully" };
};

// 22. Verify Transaction PIN
export const verifyTransactionPin = async (userId: string, role: string, pin: string) => {
    if (role !== 'SHOPKEEPER') return false;

    const user = await prisma.shopkeeper.findUnique({ where: { id: userId } });
    if (!user || !user.transactionPin) return false;

    return bcrypt.compare(pin, user.transactionPin);
};
