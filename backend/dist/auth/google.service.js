"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerWithGoogle = exports.handleGoogleLogin = exports.verifyGoogleToken = void 0;
const google_auth_library_1 = require("google-auth-library");
const database_1 = require("../shared/database");
const ApiError_1 = require("../shared/errors/ApiError");
const utils_1 = require("./utils");
const service_1 = require("./service");
const logger_1 = require("../shared/utils/logger");
const client = new google_auth_library_1.OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const verifyGoogleToken = async (token) => {
    try {
        // Try verifying as ID Token first (if sent from component)
        try {
            const ticket = await client.verifyIdToken({
                idToken: token,
                audience: process.env.GOOGLE_CLIENT_ID,
            });
            const payload = ticket.getPayload();
            if (payload && payload.email) {
                return {
                    email: payload.email,
                    name: payload.name || "",
                    picture: payload.picture || "",
                    sub: payload.sub,
                };
            }
        }
        catch (e) {
            // Ignore and try access token
        }
        // Verify as Access Token
        const tokenInfo = await client.getTokenInfo(token);
        if (!tokenInfo.email)
            throw new ApiError_1.ApiError(400, "Invalid Google Token");
        // Fetch user profile for name/picture if using access token
        const res = await fetch(`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${token}`);
        if (!res.ok)
            throw new ApiError_1.ApiError(400, "Failed to fetch user profile from Google");
        const profile = await res.json();
        if (!profile.email)
            throw new ApiError_1.ApiError(400, "Failed to fetch user profile");
        return {
            email: profile.email,
            name: profile.name,
            picture: profile.picture,
            sub: profile.sub
        };
    }
    catch (error) {
        logger_1.logger.error("Google Token Verification Failed", error);
        throw new ApiError_1.ApiError(401, "Invalid Google Token");
    }
};
exports.verifyGoogleToken = verifyGoogleToken;
const handleGoogleLogin = async (token) => {
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
    const shopkeeper = await database_1.prisma.shopkeeper.findUnique({ where: { email } });
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
    // 2. Double check if user exists (race condition or manual bypass)
    const exists = await database_1.prisma.shopkeeper.findUnique({ where: { email } }) || await database_1.prisma.customer.findUnique({ where: { email } });
    if (exists)
        throw new ApiError_1.ApiError(400, "User already exists. Please login.");
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
