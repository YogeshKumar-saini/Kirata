"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerWithGoogle = exports.handleGoogleLogin = exports.verifyGoogleToken = void 0;
const google_auth_library_1 = require("google-auth-library");
const database_1 = require("../shared/database");
const ApiError_1 = require("../shared/errors/ApiError");
const utils_1 = require("./utils");
const service_1 = require("./service");
const client = new google_auth_library_1.OAuth2Client(process.env.GOOGLE_CLIENT_ID);
// Simple, robust verification using direct HTTP call to Google
const verifyGoogleToken = async (token) => {
    console.log('[Back] verifyGoogleToken: Starting simple fetch verification...');
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout
        console.log('[Back] verifyGoogleToken: Fetching userinfo from Google...');
        const res = await fetch(`https://www.googleapis.com/oauth2/v3/userinfo`, {
            headers: {
                Authorization: `Bearer ${token}`
            },
            signal: controller.signal
        });
        clearTimeout(timeoutId);
        if (!res.ok) {
            const errorText = await res.text();
            console.error('[Back] verifyGoogleToken: Google API responded with error:', res.status, errorText);
            throw new ApiError_1.ApiError(401, "Invalid Google Token");
        }
        const profile = await res.json();
        console.log('[Back] verifyGoogleToken: Success! Email:', profile.email);
        if (!profile.email)
            throw new ApiError_1.ApiError(400, "Google account has no email");
        return {
            email: profile.email,
            name: profile.name || "",
            picture: profile.picture || "",
            sub: profile.sub
        };
    }
    catch (error) {
        console.error('[Back] verifyGoogleToken: Error during fetch:', error);
        if (error.name === 'AbortError') {
            throw new ApiError_1.ApiError(504, "Google Verification Timed Out");
        }
        throw new ApiError_1.ApiError(401, "Google Authentication Failed");
    }
};
exports.verifyGoogleToken = verifyGoogleToken;
const handleGoogleLogin = async (token) => {
    console.log('[Back] handleGoogleLogin: Starting logic...');
    // 1. Verify Token
    const payload = await (0, exports.verifyGoogleToken)(token);
    const { email, name, picture } = payload;
    if (!email)
        throw new ApiError_1.ApiError(400, "Email not found in Google Token");
    // 2. Check Existing Users (Order: Admin -> Shopkeeper -> Customer)
    // Check Admin
    const admin = await database_1.prisma.admin.findUnique({ where: { email } });
    if (admin) {
        if (admin.deletedAt)
            throw new ApiError_1.ApiError(403, "Account deactivated");
        const authToken = (0, utils_1.signToken)({ userId: admin.adminId, role: admin.role });
        return { token: authToken, user: admin, role: admin.role }; // Direct Login
    }
    // Check Shopkeeper
    const shopkeeper = await database_1.prisma.shopkeeper.findUnique({
        where: { email },
        include: { shops: true }
    });
    if (shopkeeper) {
        if (shopkeeper.deletedAt)
            throw new ApiError_1.ApiError(403, "Account deactivated");
        // Ensure email is verified if it wasn't
        if (!shopkeeper.isEmailVerified) {
            await database_1.prisma.shopkeeper.update({ where: { id: shopkeeper.id }, data: { isEmailVerified: true } });
        }
        const authToken = (0, utils_1.signToken)({ userId: shopkeeper.id, role: 'SHOPKEEPER' });
        return { token: authToken, user: shopkeeper, role: 'SHOPKEEPER' }; // Direct Login
    }
    // Check Customer
    const customer = await database_1.prisma.customer.findUnique({ where: { email } });
    if (customer) {
        if (customer.deletedAt)
            throw new ApiError_1.ApiError(403, "Account deactivated");
        if (!customer.isEmailVerified) {
            await database_1.prisma.customer.update({ where: { id: customer.id }, data: { isEmailVerified: true } });
        }
        const authToken = (0, utils_1.signToken)({ userId: customer.id, role: 'CUSTOMER' });
        return { token: authToken, user: customer, role: 'CUSTOMER' }; // Direct Login
    }
    // 3. User Not Found -> Return ROLE_REQUIRED
    return {
        status: 'ROLE_REQUIRED',
        email,
        name,
        photoUrl: picture,
        message: "User not found. Please select a role to register."
    };
};
exports.handleGoogleLogin = handleGoogleLogin;
const registerWithGoogle = async (role, token) => {
    // 1. Verify Token again (security)
    const payload = await (0, exports.verifyGoogleToken)(token);
    const { email, name, picture } = payload;
    if (!email)
        throw new ApiError_1.ApiError(400, "Email required");
    // 2. Check if user exists
    // If user exists, we log them in automatically (better UX)
    const existingShopkeeper = await database_1.prisma.shopkeeper.findUnique({
        where: { email },
        include: { shops: true }
    });
    if (existingShopkeeper) {
        // If they are a shopkeeper, log them in (even if they tried to register as customer, we prioritize their existing identity)
        const authToken = (0, utils_1.signToken)({ userId: existingShopkeeper.id, role: 'SHOPKEEPER' });
        return { token: authToken, user: existingShopkeeper, role: 'SHOPKEEPER' };
    }
    const existingCustomer = await database_1.prisma.customer.findUnique({ where: { email } });
    if (existingCustomer) {
        // Log in as existing customer
        const authToken = (0, utils_1.signToken)({ userId: existingCustomer.id, role: 'CUSTOMER' });
        return { token: authToken, user: existingCustomer, role: 'CUSTOMER' };
    }
    // 3. Create User
    const uniqueId = await (0, service_1.generateGlobalUniqueId)(email, name);
    let newUser;
    if (role === 'SHOPKEEPER') {
        const data = {
            email,
            name: name || "Shopkeeper",
            uniqueId,
            isEmailVerified: true,
            isPhoneVerified: false // Google doesn't verify phone usually
        };
        // Shopkeeper doesn't have photoUrl in schema
        newUser = await database_1.prisma.shopkeeper.create({
            data
        });
    }
    else {
        newUser = await database_1.prisma.customer.create({
            data: {
                email,
                name: name || "Customer",
                uniqueId,
                photoUrl: picture, // Customer has photoUrl
                isEmailVerified: true,
                isPhoneVerified: false
            }
        });
    }
    // 4. Login
    const authToken = (0, utils_1.signToken)({ userId: newUser.id, role });
    return { token: authToken, user: newUser, role };
};
exports.registerWithGoogle = registerWithGoogle;
