"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyTransactionPin = exports.setTransactionPin = exports.unlockAccount = exports.verifyEmail = exports.sendEmailVerification = exports.confirmPhoneChange = exports.requestPhoneChange = exports.confirmEmailChange = exports.requestEmailChange = exports.revokeAllSessions = exports.revokeSession = exports.listActiveSessions = exports.reactivateAccount = exports.deactivateAccount = exports.updatePassword = exports.updateProfile = exports.confirmPasswordReset = exports.requestPasswordReset = exports.loginWithPassword = exports.verifyAppOTP = exports.requestAppOTP = exports.registerCustomer = exports.registerShopkeeper = exports.loginAdmin = exports.registerAdmin = exports.refreshAccessToken = exports.generateGlobalUniqueId = exports.generateReadableId = exports.generateOTP = void 0;
const database_1 = require("../shared/database");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const utils_1 = require("./utils");
const ApiError_1 = require("../shared/errors/ApiError");
const uuid_1 = require("uuid");
const service_1 = require("../services/notifications/service");
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};
exports.generateOTP = generateOTP;
const generateReadableId = (identifier, name) => {
    // 1. Base: Try Name first, then Email username, then "user"
    let base = "user";
    if (name) {
        base = name.toLowerCase().replace(/[^a-z0-9]/g, '');
    }
    else if (identifier.includes('@')) {
        // Use email username
        base = identifier.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
    }
    // 2. Suffix: Random 4 char string
    const suffix = Math.random().toString(36).substring(2, 6);
    // 3. Fallback
    if (base.length === 0)
        base = "user";
    return `${base}${suffix}`;
};
exports.generateReadableId = generateReadableId;
const checkUniqueIdTaken = async (uniqueId) => {
    if (await database_1.prisma.admin.findUnique({ where: { uniqueId } }))
        return true;
    if (await database_1.prisma.shopkeeper.findUnique({ where: { uniqueId } }))
        return true;
    if (await database_1.prisma.customer.findUnique({ where: { uniqueId } }))
        return true;
    return false;
};
const generateGlobalUniqueId = async (identifier, name) => {
    let uniqueId = (0, exports.generateReadableId)(identifier, name);
    let isTaken = await checkUniqueIdTaken(uniqueId);
    let attempts = 0;
    while (isTaken && attempts < 5) {
        uniqueId = (0, exports.generateReadableId)(identifier, name);
        isTaken = await checkUniqueIdTaken(uniqueId);
        attempts++;
    }
    if (isTaken)
        throw new ApiError_1.ApiError(500, "Failed to generate unique ID. Please try again.");
    return uniqueId;
};
exports.generateGlobalUniqueId = generateGlobalUniqueId;
// Audit Logging Helper
const logAudit = async (userId, action, details) => {
    try {
        await database_1.prisma.auditLog.create({
            data: { userId, action, details }
        });
    }
    catch (error) {
        console.error("Failed to log audit:", error); // Fail safe, don't crash main flow
    }
};
// Generate Refresh Token
const generateRefreshToken = async (userId) => {
    const token = (0, uuid_1.v4)(); // Use UUID as refresh token
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // 30 days
    await database_1.prisma.refreshToken.create({
        data: { userId, token, expiresAt }
    });
    return token;
};
// Refresh Access Token
const refreshAccessToken = async (refreshToken) => {
    const tokenRecord = await database_1.prisma.refreshToken.findUnique({
        where: { token: refreshToken }
    });
    if (!tokenRecord || tokenRecord.revoked) {
        throw new ApiError_1.ApiError(401, "Invalid refresh token");
    }
    if (new Date() > tokenRecord.expiresAt) {
        throw new ApiError_1.ApiError(401, "Refresh token expired");
    }
    // Revoke old token (rotation)
    await database_1.prisma.refreshToken.update({
        where: { token: refreshToken },
        data: { revoked: true }
    });
    // Find user to get role
    const admin = await database_1.prisma.admin.findFirst({ where: { adminId: tokenRecord.userId } });
    const shopkeeper = await database_1.prisma.shopkeeper.findFirst({ where: { id: tokenRecord.userId } });
    const customer = await database_1.prisma.customer.findFirst({ where: { id: tokenRecord.userId } });
    let role;
    if (admin)
        role = admin.role;
    else if (shopkeeper)
        role = 'SHOPKEEPER';
    else if (customer)
        role = 'CUSTOMER';
    else
        throw new ApiError_1.ApiError(404, "User not found");
    // Generate new tokens
    const accessToken = (0, utils_1.signToken)({ userId: tokenRecord.userId, role });
    const newRefreshToken = await generateRefreshToken(tokenRecord.userId);
    await logAudit(tokenRecord.userId, 'TOKEN_REFRESH', { role });
    return { accessToken, refreshToken: newRefreshToken };
};
exports.refreshAccessToken = refreshAccessToken;
// Helper to find user across all tables
const findUserByIdentifier = async (phone, email) => {
    // 1. Check Admin
    let user = await database_1.prisma.admin.findFirst({ where: phone ? { phone } : { email } });
    if (user)
        return { user, role: user.role, type: 'ADMIN' };
    // 2. Check Shopkeeper
    user = await database_1.prisma.shopkeeper.findFirst({ where: phone ? { phone } : { email } });
    if (user)
        return { user, role: 'SHOPKEEPER', type: 'SHOPKEEPER' };
    // 3. Check Customer
    user = await database_1.prisma.customer.findFirst({ where: phone ? { phone } : { email } });
    if (user)
        return { user, role: 'CUSTOMER', type: 'CUSTOMER' };
    return null;
};
// --- ADMIN AUTH (Unified OTP + Optional Password) ---
const checkGlobalUniqueness = async (email, phone) => {
    if (email) {
        if (await database_1.prisma.admin.findUnique({ where: { email } }))
            throw new ApiError_1.ApiError(400, 'Email already registered (Admin).');
        if (await database_1.prisma.shopkeeper.findUnique({ where: { email } }))
            throw new ApiError_1.ApiError(400, 'Email already registered (Shopkeeper).');
        if (await database_1.prisma.customer.findUnique({ where: { email } }))
            throw new ApiError_1.ApiError(400, 'Email already registered (Customer).');
    }
    if (phone) {
        if (await database_1.prisma.admin.findUnique({ where: { phone } }))
            throw new ApiError_1.ApiError(400, 'Phone already registered (Admin).');
        if (await database_1.prisma.shopkeeper.findUnique({ where: { phone } }))
            throw new ApiError_1.ApiError(400, 'Phone already registered (Shopkeeper).');
        if (await database_1.prisma.customer.findUnique({ where: { phone } }))
            throw new ApiError_1.ApiError(400, 'Phone already registered (Customer).');
    }
};
// --- ADMIN AUTH (Unified OTP + Optional Password) ---
const registerAdmin = async (email, phone, password, role = 'SUPER_ADMIN', name) => {
    // Check conflicts
    await checkGlobalUniqueness(email, phone);
    let hashedPassword = undefined;
    if (password) {
        hashedPassword = await bcryptjs_1.default.hash(password, 10);
    }
    // Generate globally unique ID
    const uniqueId = await (0, exports.generateGlobalUniqueId)(email || phone, name);
    const admin = await database_1.prisma.admin.create({
        data: { email, phone, password: hashedPassword, role, name, uniqueId }
    });
    // Generate OTP for immediate verification if needed, roughly following the user flow
    const otp = (0, exports.generateOTP)();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    await database_1.prisma.admin.update({ where: { adminId: admin.adminId }, data: { otpSecret: otp, otpExpiry } });
    await service_1.notificationService.sendOTP(email || phone, otp, email ? 'EMAIL' : 'SMS');
    await logAudit(admin.adminId, 'REGISTER_ADMIN', { role, email, phone });
    return { adminId: admin.adminId, uniqueId, message: 'Admin registered successfully. OTP sent.' };
};
exports.registerAdmin = registerAdmin;
const loginAdmin = async (email, password) => {
    const admin = await database_1.prisma.admin.findUnique({ where: { email } });
    if (!admin || !admin.password)
        throw new ApiError_1.ApiError(401, 'Invalid credentials');
    const isValid = await bcryptjs_1.default.compare(password, admin.password);
    if (!isValid)
        throw new ApiError_1.ApiError(401, 'Invalid credentials');
    const token = (0, utils_1.signToken)({ userId: admin.adminId, role: admin.role });
    return { token, admin };
};
exports.loginAdmin = loginAdmin;
// --- APP AUTH (Shared: Admin, Shopkeeper, Customer) ---
// 1. Explicit Register (Shopkeeper)
const registerShopkeeper = async (phone, email, name) => {
    const identifier = (phone || email);
    // Check if user already exists
    const existingShopkeeper = await database_1.prisma.shopkeeper.findFirst({
        where: phone ? { phone } : { email }
    });
    // If user exists but hasn't verified OTP, allow re-registration (resend OTP)
    if (existingShopkeeper) {
        if (!existingShopkeeper.isPhoneVerified && !existingShopkeeper.isEmailVerified) {
            // User exists but not verified - resend OTP
            const otp = (0, exports.generateOTP)();
            const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
            await database_1.prisma.shopkeeper.update({
                where: { id: existingShopkeeper.id },
                data: { otpSecret: otp, otpExpiry }
            });
            await service_1.notificationService.sendOTP(phone || email, otp, phone ? 'SMS' : 'EMAIL');
            await logAudit(existingShopkeeper.id, 'OTP_RESENT', { phone, email, reason: 'Re-registration attempt' });
            return { message: 'Account exists but not verified. New OTP sent.', uniqueId: existingShopkeeper.uniqueId };
        }
        else {
            // User exists and is verified - throw error
            throw new ApiError_1.ApiError(400, `${phone ? 'Phone' : 'Email'} already registered and verified. Please login instead.`);
        }
    }
    // New user - proceed with normal registration
    await checkGlobalUniqueness(email, phone);
    const uniqueId = await (0, exports.generateGlobalUniqueId)(email || phone, name);
    const shopkeeper = await database_1.prisma.shopkeeper.create({
        data: { phone, email, name, uniqueId }
    });
    const otp = (0, exports.generateOTP)();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10m
    await database_1.prisma.shopkeeper.update({ where: { id: shopkeeper.id }, data: { otpSecret: otp, otpExpiry } });
    await service_1.notificationService.sendOTP(phone || email, otp, phone ? 'SMS' : 'EMAIL');
    await logAudit(shopkeeper.id, 'REGISTER_SHOPKEEPER', { phone, email });
    return { message: 'Shopkeeper registered. OTP sent.', uniqueId };
};
exports.registerShopkeeper = registerShopkeeper;
// 2. Explicit Register (Customer)
const registerCustomer = async (phone, email, name) => {
    const identifier = (phone || email);
    // Check if user already exists
    const existingCustomer = await database_1.prisma.customer.findFirst({
        where: phone ? { phone } : { email }
    });
    // If user exists but hasn't verified OTP, allow re-registration (resend OTP)
    if (existingCustomer) {
        if (!existingCustomer.isPhoneVerified && !existingCustomer.isEmailVerified) {
            // User exists but not verified - resend OTP
            const otp = (0, exports.generateOTP)();
            const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
            await database_1.prisma.customer.update({
                where: { id: existingCustomer.id },
                data: { otpSecret: otp, otpExpiry }
            });
            await service_1.notificationService.sendOTP(phone || email, otp, phone ? 'SMS' : 'EMAIL');
            await logAudit(existingCustomer.id, 'OTP_RESENT', { phone, email, reason: 'Re-registration attempt' });
            return { message: 'Account exists but not verified. New OTP sent.', uniqueId: existingCustomer.uniqueId };
        }
        else {
            // User exists and is verified - throw error
            throw new ApiError_1.ApiError(400, `${phone ? 'Phone' : 'Email'} already registered and verified. Please login instead.`);
        }
    }
    // New user - proceed with normal registration
    await checkGlobalUniqueness(email, phone);
    const uniqueId = await (0, exports.generateGlobalUniqueId)(email || phone, name);
    const customer = await database_1.prisma.customer.create({
        data: { phone, email, name, uniqueId }
    });
    const otp = (0, exports.generateOTP)();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    await database_1.prisma.customer.update({ where: { id: customer.id }, data: { otpSecret: otp, otpExpiry } });
    await service_1.notificationService.sendOTP(email || phone, otp, email ? 'EMAIL' : 'SMS');
    await logAudit(customer.id, 'REGISTER_CUSTOMER', { phone, email });
    return { message: 'Customer registered. OTP sent.', uniqueId };
};
exports.registerCustomer = registerCustomer;
// 4. Request OTP (Login/Verification)
const requestAppOTP = async (phone, email) => {
    const found = await findUserByIdentifier(phone, email);
    if (!found)
        throw new ApiError_1.ApiError(404, 'User not found. Please register.');
    const { user, type } = found;
    const otp = (0, exports.generateOTP)();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 mins
    if (type === 'ADMIN') {
        await database_1.prisma.admin.update({ where: { adminId: user.adminId }, data: { otpSecret: otp, otpExpiry } });
    }
    else if (type === 'SHOPKEEPER') {
        await database_1.prisma.shopkeeper.update({ where: { id: user.id }, data: { otpSecret: otp, otpExpiry } });
    }
    else {
        await database_1.prisma.customer.update({ where: { id: user.id }, data: { otpSecret: otp, otpExpiry } });
    }
    await service_1.notificationService.sendOTP(phone || email, otp, phone ? 'SMS' : 'EMAIL');
    return { message: "OTP sent successfully" };
};
exports.requestAppOTP = requestAppOTP;
// 4. Verify OTP (Login)
const verifyAppOTP = async (phone, email, otp) => {
    const found = await findUserByIdentifier(phone, email);
    if (!found)
        throw new ApiError_1.ApiError(404, 'User not found');
    const { user, role, type } = found;
    if (user.otpSecret !== otp || new Date() > user.otpExpiry) {
        throw new ApiError_1.ApiError(401, 'Invalid or expired OTP');
    }
    // Clear OTP & Verify
    const userId = type === 'ADMIN' ? user.adminId : user.id;
    const updateData = {
        otpSecret: null,
        otpExpiry: null
    };
    // Set the correct verification flag based on what was used
    if (phone) {
        updateData.isPhoneVerified = true;
    }
    else if (email) {
        updateData.isEmailVerified = true;
    }
    // Auto-reactivate if account was deleted (grace period feature)
    if (user.deletedAt) {
        updateData.deletedAt = null;
        updateData.scheduledDeletionAt = null;
        await logAudit(userId, 'ACCOUNT_AUTO_REACTIVATED', { role, method: 'OTP_LOGIN' });
    }
    if (type === 'ADMIN') {
        await database_1.prisma.admin.update({ where: { adminId: user.adminId }, data: updateData });
    }
    else if (type === 'SHOPKEEPER') {
        await database_1.prisma.shopkeeper.update({ where: { id: user.id }, data: updateData });
    }
    else {
        await database_1.prisma.customer.update({ where: { id: user.id }, data: updateData });
    }
    const token = (0, utils_1.signToken)({ userId, role });
    const refreshToken = await generateRefreshToken(userId);
    await logAudit(userId, 'LOGIN_OTP', { role, method: 'OTP' });
    const userResponse = type === 'ADMIN' ? user : { ...user, role };
    return { token, refreshToken, user: userResponse };
};
exports.verifyAppOTP = verifyAppOTP;
// 5. Unified Login with Password
const loginWithPassword = async (phone, email, password) => {
    const found = await findUserByIdentifier(phone, email);
    if (!found)
        throw new ApiError_1.ApiError(404, 'User not found');
    const { user, role, type } = found;
    const userId = type === 'ADMIN' ? user.adminId : user.id;
    // Block deleted accounts from password login
    if (user.deletedAt) {
        await logAudit(userId, 'LOGIN_BLOCKED', { reason: 'Account deleted, use OTP to reactivate' });
        throw new ApiError_1.ApiError(403, 'Account is deactivated. Please login with OTP to reactivate.');
    }
    // Check if account is locked
    if (user.lockedUntil && new Date() < user.lockedUntil) {
        await logAudit(userId, 'LOGIN_BLOCKED', { reason: 'Account locked' });
        throw new ApiError_1.ApiError(403, `Account is locked until ${user.lockedUntil.toISOString()}. Too many failed login attempts.`);
    }
    if (!user.password) {
        throw new ApiError_1.ApiError(400, 'Password not set. Please login with OTP or reset password.');
    }
    const isValid = await bcryptjs_1.default.compare(password, user.password);
    if (!isValid) {
        // Increment failed attempts
        const newFailedAttempts = (user.failedLoginAttempts || 0) + 1;
        const updateData = { failedLoginAttempts: newFailedAttempts };
        // Lock account after 5 failed attempts
        if (newFailedAttempts >= 5) {
            const lockUntil = new Date();
            lockUntil.setHours(lockUntil.getHours() + 1);
            updateData.lockedUntil = lockUntil;
        }
        if (type === 'ADMIN') {
            await database_1.prisma.admin.update({ where: { adminId: user.adminId }, data: updateData });
        }
        else if (type === 'SHOPKEEPER') {
            await database_1.prisma.shopkeeper.update({ where: { id: user.id }, data: updateData });
        }
        else {
            await database_1.prisma.customer.update({ where: { id: user.id }, data: updateData });
        }
        await logAudit(userId, 'LOGIN_FAILED', { phone, email, reason: "Invalid Password", failedAttempts: newFailedAttempts });
        throw new ApiError_1.ApiError(401, newFailedAttempts >= 5 ? 'Account locked due to too many failed attempts. Try again in 1 hour.' : 'Invalid credentials');
    }
    // Reset failed attempts on successful login
    const resetData = { failedLoginAttempts: 0, lockedUntil: null };
    if (type === 'ADMIN') {
        await database_1.prisma.admin.update({ where: { adminId: user.adminId }, data: resetData });
    }
    else if (type === 'SHOPKEEPER') {
        await database_1.prisma.shopkeeper.update({ where: { id: user.id }, data: resetData });
    }
    else {
        await database_1.prisma.customer.update({ where: { id: user.id }, data: resetData });
    }
    const token = (0, utils_1.signToken)({ userId, role });
    const refreshToken = await generateRefreshToken(userId);
    await logAudit(userId, 'LOGIN_PASSWORD', { role, method: 'PASSWORD' });
    const userResponse = type === 'ADMIN' ? user : { ...user, role };
    return { token, refreshToken, user: userResponse };
};
exports.loginWithPassword = loginWithPassword;
// 6. Request Password Reset (Send OTP) - Alias for requestAppOTP basically, but context differs
const requestPasswordReset = async (phone, email) => {
    return (0, exports.requestAppOTP)(phone, email);
};
exports.requestPasswordReset = requestPasswordReset;
// 7. Confirm Password Reset (Verify OTP + Set Password)
const confirmPasswordReset = async (phone, email, otp, newPassword) => {
    const found = await findUserByIdentifier(phone, email);
    if (!found)
        throw new ApiError_1.ApiError(404, 'User not found');
    const { user, type } = found;
    if (user.otpSecret !== otp || new Date() > user.otpExpiry) {
        throw new ApiError_1.ApiError(401, 'Invalid or expired OTP');
    }
    const hashedPassword = await bcryptjs_1.default.hash(newPassword, 10);
    // Update Password & Clear OTP
    if (type === 'ADMIN') {
        await database_1.prisma.admin.update({
            where: { adminId: user.adminId },
            data: { password: hashedPassword, otpSecret: null, otpExpiry: null, isPhoneVerified: true }
        });
    }
    else if (type === 'SHOPKEEPER') {
        await database_1.prisma.shopkeeper.update({
            where: { id: user.id },
            data: { password: hashedPassword, otpSecret: null, otpExpiry: null, isPhoneVerified: true }
        });
    }
    else {
        await database_1.prisma.customer.update({
            where: { id: user.id },
            data: { password: hashedPassword, otpSecret: null, otpExpiry: null, isPhoneVerified: true }
        });
    }
    const userId = type === 'ADMIN' ? user.adminId : user.id;
    await logAudit(userId, 'PASSWORD_CHANGE', { type });
    return { message: "Password updated successfully." };
};
exports.confirmPasswordReset = confirmPasswordReset;
// 8. Update Profile (Name, Address)
const updateProfile = async (userId, role, data) => {
    let update;
    // 1. Check Admin
    if (['SUPER_ADMIN', 'SHOP_MANAGER_ADMIN', 'SUPPORT_ADMIN'].includes(role)) {
        update = await database_1.prisma.admin.update({
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
        update = await database_1.prisma.shopkeeper.update({
            where: { id: userId },
            data: rest // Pass all detailed fields
        });
    }
    // 3. Check Customer
    else if (role === 'CUSTOMER') {
        update = await database_1.prisma.customer.update({
            where: { id: userId },
            data: {
                name: data.name,
                address: data.address
            }
        });
    }
    else {
        throw new ApiError_1.ApiError(400, "Invalid role for profile update");
    }
    await logAudit(userId, 'PROFILE_UPDATE', { role, updatedFields: Object.keys(data) });
    return { message: "Profile updated successfully", user: update };
};
exports.updateProfile = updateProfile;
// 23. Update Password (Logged in user)
const updatePassword = async (userId, role, { currentPassword, newPassword }) => {
    let user;
    if (['SUPER_ADMIN', 'SHOP_MANAGER_ADMIN', 'SUPPORT_ADMIN'].includes(role)) {
        user = await database_1.prisma.admin.findUnique({ where: { adminId: userId } });
    }
    else if (role === 'SHOPKEEPER') {
        user = await database_1.prisma.shopkeeper.findUnique({ where: { id: userId } });
    }
    else {
        user = await database_1.prisma.customer.findUnique({ where: { id: userId } });
    }
    if (!user)
        throw new ApiError_1.ApiError(404, "User not found");
    // If user has a password set, currentPassword is required
    if (user.password) {
        if (!currentPassword)
            throw new ApiError_1.ApiError(400, "Current password is required");
        const isValid = await bcryptjs_1.default.compare(currentPassword, user.password);
        if (!isValid)
            throw new ApiError_1.ApiError(401, "Invalid current password");
    }
    const hashedPassword = await bcryptjs_1.default.hash(newPassword, 10);
    // Update
    if (['SUPER_ADMIN', 'SHOP_MANAGER_ADMIN', 'SUPPORT_ADMIN'].includes(role)) {
        await database_1.prisma.admin.update({ where: { adminId: userId }, data: { password: hashedPassword } });
    }
    else if (role === 'SHOPKEEPER') {
        await database_1.prisma.shopkeeper.update({ where: { id: userId }, data: { password: hashedPassword } });
    }
    else {
        await database_1.prisma.customer.update({ where: { id: userId }, data: { password: hashedPassword } });
    }
    await logAudit(userId, 'PASSWORD_UPDATED', { role });
    return { message: "Password updated successfully" };
};
exports.updatePassword = updatePassword;
// 9. Deactivate Account (Soft Delete with 30-day grace period)
const deactivateAccount = async (userId, role) => {
    const now = new Date();
    const scheduledDeletion = new Date();
    scheduledDeletion.setDate(scheduledDeletion.getDate() + 30); // 30 days from now
    const updateData = {
        deletedAt: now,
        scheduledDeletionAt: scheduledDeletion,
        password: null // Disable password login
    };
    if (['SUPER_ADMIN', 'SHOP_MANAGER_ADMIN', 'SUPPORT_ADMIN'].includes(role)) {
        await database_1.prisma.admin.update({ where: { adminId: userId }, data: updateData });
    }
    else if (role === 'SHOPKEEPER') {
        await database_1.prisma.shopkeeper.update({ where: { id: userId }, data: updateData });
    }
    else if (role === 'CUSTOMER') {
        await database_1.prisma.customer.update({ where: { id: userId }, data: updateData });
    }
    else {
        throw new ApiError_1.ApiError(400, "Invalid role");
    }
    await logAudit(userId, 'ACCOUNT_DEACTIVATED', { role, scheduledDeletionAt: scheduledDeletion });
    return {
        message: "Account deactivated. You can reactivate within 30 days by logging in with OTP.",
        scheduledDeletionAt: scheduledDeletion
    };
};
exports.deactivateAccount = deactivateAccount;
// 10. Reactivate Account (Cancel deletion)
const reactivateAccount = async (userId, role) => {
    const updateData = {
        deletedAt: null,
        scheduledDeletionAt: null
    };
    if (['SUPER_ADMIN', 'SHOP_MANAGER_ADMIN', 'SUPPORT_ADMIN'].includes(role)) {
        await database_1.prisma.admin.update({ where: { adminId: userId }, data: updateData });
    }
    else if (role === 'SHOPKEEPER') {
        await database_1.prisma.shopkeeper.update({ where: { id: userId }, data: updateData });
    }
    else if (role === 'CUSTOMER') {
        await database_1.prisma.customer.update({ where: { id: userId }, data: updateData });
    }
    else {
        throw new ApiError_1.ApiError(400, "Invalid role");
    }
    await logAudit(userId, 'ACCOUNT_REACTIVATED', { role });
    return { message: "Account reactivated successfully" };
};
exports.reactivateAccount = reactivateAccount;
// 11. Session Management - List Active Sessions
const listActiveSessions = async (userId) => {
    const sessions = await database_1.prisma.refreshToken.findMany({
        where: { userId, revoked: false },
        select: { id: true, createdAt: true, expiresAt: true },
        orderBy: { createdAt: 'desc' }
    });
    return { sessions };
};
exports.listActiveSessions = listActiveSessions;
// 12. Revoke Specific Session
const revokeSession = async (userId, sessionId) => {
    const session = await database_1.prisma.refreshToken.findUnique({ where: { id: sessionId } });
    if (!session || session.userId !== userId) {
        throw new ApiError_1.ApiError(404, "Session not found");
    }
    await database_1.prisma.refreshToken.update({
        where: { id: sessionId },
        data: { revoked: true }
    });
    await logAudit(userId, 'SESSION_REVOKED', { sessionId });
    return { message: "Session revoked successfully" };
};
exports.revokeSession = revokeSession;
// 13. Revoke All Sessions (Logout all devices)
const revokeAllSessions = async (userId) => {
    const result = await database_1.prisma.refreshToken.updateMany({
        where: { userId, revoked: false },
        data: { revoked: true }
    });
    await logAudit(userId, 'ALL_SESSIONS_REVOKED', { count: result.count });
    return { message: `${result.count} session(s) revoked successfully` };
};
exports.revokeAllSessions = revokeAllSessions;
// 14. Change Email (Request)
const requestEmailChange = async (userId, role, newEmail) => {
    // Check if email already exists
    await checkGlobalUniqueness(newEmail, undefined);
    const otp = (0, exports.generateOTP)();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    // Store OTP temporarily (we'll use otpSecret field)
    if (['SUPER_ADMIN', 'SHOP_MANAGER_ADMIN', 'SUPPORT_ADMIN'].includes(role)) {
        await database_1.prisma.admin.update({ where: { adminId: userId }, data: { otpSecret: otp, otpExpiry } });
    }
    else if (role === 'SHOPKEEPER') {
        await database_1.prisma.shopkeeper.update({ where: { id: userId }, data: { otpSecret: otp, otpExpiry } });
    }
    else {
        await database_1.prisma.customer.update({ where: { id: userId }, data: { otpSecret: otp, otpExpiry } });
    }
    await service_1.notificationService.sendOTP(newEmail, otp, 'EMAIL');
    await logAudit(userId, 'EMAIL_CHANGE_REQUESTED', { newEmail });
    return { message: "OTP sent to new email. Please verify to complete the change." };
};
exports.requestEmailChange = requestEmailChange;
// 15. Confirm Email Change
const confirmEmailChange = async (userId, role, newEmail, otp) => {
    let user;
    if (['SUPER_ADMIN', 'SHOP_MANAGER_ADMIN', 'SUPPORT_ADMIN'].includes(role)) {
        user = await database_1.prisma.admin.findUnique({ where: { adminId: userId } });
    }
    else if (role === 'SHOPKEEPER') {
        user = await database_1.prisma.shopkeeper.findUnique({ where: { id: userId } });
    }
    else {
        user = await database_1.prisma.customer.findUnique({ where: { id: userId } });
    }
    if (!user || user.otpSecret !== otp || new Date() > user.otpExpiry) {
        throw new ApiError_1.ApiError(401, "Invalid or expired OTP");
    }
    // Update email
    if (['SUPER_ADMIN', 'SHOP_MANAGER_ADMIN', 'SUPPORT_ADMIN'].includes(role)) {
        await database_1.prisma.admin.update({ where: { adminId: userId }, data: { email: newEmail, otpSecret: null, otpExpiry: null, isEmailVerified: true } });
    }
    else if (role === 'SHOPKEEPER') {
        await database_1.prisma.shopkeeper.update({ where: { id: userId }, data: { email: newEmail, otpSecret: null, otpExpiry: null, isEmailVerified: true } });
    }
    else {
        await database_1.prisma.customer.update({ where: { id: userId }, data: { email: newEmail, otpSecret: null, otpExpiry: null, isEmailVerified: true } });
    }
    await logAudit(userId, 'EMAIL_CHANGED', { newEmail });
    return { message: "Email changed successfully" };
};
exports.confirmEmailChange = confirmEmailChange;
// 16. Change Phone (similar to email)
const requestPhoneChange = async (userId, role, newPhone) => {
    await checkGlobalUniqueness(undefined, newPhone);
    const otp = (0, exports.generateOTP)();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    if (['SUPER_ADMIN', 'SHOP_MANAGER_ADMIN', 'SUPPORT_ADMIN'].includes(role)) {
        await database_1.prisma.admin.update({ where: { adminId: userId }, data: { otpSecret: otp, otpExpiry } });
    }
    else if (role === 'SHOPKEEPER') {
        await database_1.prisma.shopkeeper.update({ where: { id: userId }, data: { otpSecret: otp, otpExpiry } });
    }
    else {
        await database_1.prisma.customer.update({ where: { id: userId }, data: { otpSecret: otp, otpExpiry } });
    }
    await service_1.notificationService.sendOTP(newPhone, otp, 'SMS');
    await logAudit(userId, 'PHONE_CHANGE_REQUESTED', { newPhone });
    return { message: "OTP sent to new phone. Please verify to complete the change." };
};
exports.requestPhoneChange = requestPhoneChange;
// 17. Confirm Phone Change
const confirmPhoneChange = async (userId, role, newPhone, otp) => {
    let user;
    if (['SUPER_ADMIN', 'SHOP_MANAGER_ADMIN', 'SUPPORT_ADMIN'].includes(role)) {
        user = await database_1.prisma.admin.findUnique({ where: { adminId: userId } });
    }
    else if (role === 'SHOPKEEPER') {
        user = await database_1.prisma.shopkeeper.findUnique({ where: { id: userId } });
    }
    else {
        user = await database_1.prisma.customer.findUnique({ where: { id: userId } });
    }
    if (!user || user.otpSecret !== otp || new Date() > user.otpExpiry) {
        throw new ApiError_1.ApiError(401, "Invalid or expired OTP");
    }
    if (['SUPER_ADMIN', 'SHOP_MANAGER_ADMIN', 'SUPPORT_ADMIN'].includes(role)) {
        await database_1.prisma.admin.update({ where: { adminId: userId }, data: { phone: newPhone, otpSecret: null, otpExpiry: null, isPhoneVerified: true } });
    }
    else if (role === 'SHOPKEEPER') {
        await database_1.prisma.shopkeeper.update({ where: { id: userId }, data: { phone: newPhone, otpSecret: null, otpExpiry: null, isPhoneVerified: true } });
    }
    else {
        await database_1.prisma.customer.update({ where: { id: userId }, data: { phone: newPhone, otpSecret: null, otpExpiry: null, isPhoneVerified: true } });
    }
    await logAudit(userId, 'PHONE_CHANGED', { newPhone });
    return { message: "Phone changed successfully" };
};
exports.confirmPhoneChange = confirmPhoneChange;
// 18. Send Email Verification
const sendEmailVerification = async (userId, role) => {
    let user;
    if (['SUPER_ADMIN', 'SHOP_MANAGER_ADMIN', 'SUPPORT_ADMIN'].includes(role)) {
        user = await database_1.prisma.admin.findUnique({ where: { adminId: userId } });
    }
    else if (role === 'SHOPKEEPER') {
        user = await database_1.prisma.shopkeeper.findUnique({ where: { id: userId } });
    }
    else {
        user = await database_1.prisma.customer.findUnique({ where: { id: userId } });
    }
    if (!user?.email)
        throw new ApiError_1.ApiError(400, "No email associated with this account");
    if (user.isEmailVerified)
        throw new ApiError_1.ApiError(400, "Email already verified");
    const otp = (0, exports.generateOTP)();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    if (['SUPER_ADMIN', 'SHOP_MANAGER_ADMIN', 'SUPPORT_ADMIN'].includes(role)) {
        await database_1.prisma.admin.update({ where: { adminId: userId }, data: { otpSecret: otp, otpExpiry } });
    }
    else if (role === 'SHOPKEEPER') {
        await database_1.prisma.shopkeeper.update({ where: { id: userId }, data: { otpSecret: otp, otpExpiry } });
    }
    else {
        await database_1.prisma.customer.update({ where: { id: userId }, data: { otpSecret: otp, otpExpiry } });
    }
    await service_1.notificationService.sendOTP(user.email, otp, 'EMAIL');
    return { message: "Verification OTP sent to email" };
};
exports.sendEmailVerification = sendEmailVerification;
// 19. Verify Email
const verifyEmail = async (userId, role, otp) => {
    let user;
    if (['SUPER_ADMIN', 'SHOP_MANAGER_ADMIN', 'SUPPORT_ADMIN'].includes(role)) {
        user = await database_1.prisma.admin.findUnique({ where: { adminId: userId } });
    }
    else if (role === 'SHOPKEEPER') {
        user = await database_1.prisma.shopkeeper.findUnique({ where: { id: userId } });
    }
    else {
        user = await database_1.prisma.customer.findUnique({ where: { id: userId } });
    }
    if (!user || user.otpSecret !== otp || new Date() > user.otpExpiry) {
        throw new ApiError_1.ApiError(401, "Invalid or expired OTP");
    }
    if (['SUPER_ADMIN', 'SHOP_MANAGER_ADMIN', 'SUPPORT_ADMIN'].includes(role)) {
        await database_1.prisma.admin.update({ where: { adminId: userId }, data: { isEmailVerified: true, otpSecret: null, otpExpiry: null } });
    }
    else if (role === 'SHOPKEEPER') {
        await database_1.prisma.shopkeeper.update({ where: { id: userId }, data: { isEmailVerified: true, otpSecret: null, otpExpiry: null } });
    }
    else {
        await database_1.prisma.customer.update({ where: { id: userId }, data: { isEmailVerified: true, otpSecret: null, otpExpiry: null } });
    }
    await logAudit(userId, 'EMAIL_VERIFIED', { role });
    return { message: "Email verified successfully" };
};
exports.verifyEmail = verifyEmail;
// 20. Unlock Account (Admin function)
const unlockAccount = async (targetUserId, targetRole) => {
    const updateData = { failedLoginAttempts: 0, lockedUntil: null };
    if (['SUPER_ADMIN', 'SHOP_MANAGER_ADMIN', 'SUPPORT_ADMIN'].includes(targetRole)) {
        await database_1.prisma.admin.update({ where: { adminId: targetUserId }, data: updateData });
    }
    else if (targetRole === 'SHOPKEEPER') {
        await database_1.prisma.shopkeeper.update({ where: { id: targetUserId }, data: updateData });
    }
    else if (targetRole === 'CUSTOMER') {
        await database_1.prisma.customer.update({ where: { id: targetUserId }, data: updateData });
    }
    else {
        throw new ApiError_1.ApiError(400, "Invalid role");
    }
    await logAudit(targetUserId, 'ACCOUNT_UNLOCKED_BY_ADMIN', { targetRole });
    return { message: "Account unlocked successfully" };
};
exports.unlockAccount = unlockAccount;
// 21. Set Transaction PIN (Shopkeeper)
const setTransactionPin = async (userId, role, pin) => {
    if (role !== 'SHOPKEEPER')
        throw new ApiError_1.ApiError(403, "Only shopkeepers can set transaction PIN");
    if (!/^\d{4,6}$/.test(pin)) {
        throw new ApiError_1.ApiError(400, "PIN must be 4-6 digits");
    }
    const hashedPin = await bcryptjs_1.default.hash(pin, 10);
    await database_1.prisma.shopkeeper.update({
        where: { id: userId },
        data: { transactionPin: hashedPin }
    });
    await logAudit(userId, 'PIN_SET', { role });
    return { message: "Transaction PIN set successfully" };
};
exports.setTransactionPin = setTransactionPin;
// 22. Verify Transaction PIN
const verifyTransactionPin = async (userId, role, pin) => {
    if (role !== 'SHOPKEEPER')
        return false;
    const user = await database_1.prisma.shopkeeper.findUnique({ where: { id: userId } });
    if (!user || !user.transactionPin)
        return false;
    return bcryptjs_1.default.compare(pin, user.transactionPin);
};
exports.verifyTransactionPin = verifyTransactionPin;
