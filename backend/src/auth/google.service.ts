import { OAuth2Client, TokenPayload } from 'google-auth-library';
import { prisma } from '../shared/database';
import { ApiError } from '../shared/errors/ApiError';
import { signToken } from './utils';
import { generateReadableId, generateOTP, generateGlobalUniqueId } from './service';
import { logger } from '../shared/utils/logger';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

interface GoogleUserProfile {
    email: string;
    name: string;
    picture: string;
    sub: string;
}

// Simple, robust verification using direct HTTP call to Google
export const verifyGoogleToken = async (token: string): Promise<GoogleUserProfile> => {
    console.log('[Back] verifyGoogleToken: Starting simple fetch verification...');

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

        console.log('[Back] verifyGoogleToken: Fetching userinfo from Google...');
        const res = await fetch(`https://www.googleapis.com/oauth2/v3/userinfo`, {
            headers: {
                Authorization: `Bearer ${token}`
            },
            signal: controller.signal as any
        });
        clearTimeout(timeoutId);

        if (!res.ok) {
            const errorText = await res.text();
            console.error('[Back] verifyGoogleToken: Google API responded with error:', res.status, errorText);
            throw new ApiError(401, "Invalid Google Token");
        }

        const profile = await res.json() as any;
        console.log('[Back] verifyGoogleToken: Success! Email:', profile.email);

        if (!profile.email) throw new ApiError(400, "Google account has no email");

        return {
            email: profile.email,
            name: profile.name || "",
            picture: profile.picture || "",
            sub: profile.sub
        };

    } catch (error: any) {
        console.error('[Back] verifyGoogleToken: Error during fetch:', error);
        if (error.name === 'AbortError') {
            throw new ApiError(504, "Google Verification Timed Out");
        }
        throw new ApiError(401, "Google Authentication Failed");
    }
};

export const handleGoogleLogin = async (token: string) => {
    console.log('[Back] handleGoogleLogin: Starting logic...');
    // 1. Verify Token
    const payload = await verifyGoogleToken(token);
    const { email, name, picture } = payload;

    if (!email) throw new ApiError(400, "Email not found in Google Token");

    // 2. Check Existing Users (Order: Admin -> Shopkeeper -> Customer)

    // Check Admin
    const admin = await prisma.admin.findUnique({ where: { email } });
    if (admin) {
        if (admin.deletedAt) throw new ApiError(403, "Account deactivated");
        const authToken = signToken({ userId: admin.adminId, role: admin.role });
        return { token: authToken, user: admin, role: admin.role }; // Direct Login
    }

    // Check Shopkeeper
    const shopkeeper = await prisma.shopkeeper.findUnique({
        where: { email },
        include: { shops: true }
    });
    if (shopkeeper) {
        if (shopkeeper.deletedAt) throw new ApiError(403, "Account deactivated");

        // Ensure email is verified if it wasn't
        if (!shopkeeper.isEmailVerified) {
            await prisma.shopkeeper.update({ where: { id: shopkeeper.id }, data: { isEmailVerified: true } });
        }

        const authToken = signToken({ userId: shopkeeper.id, role: 'SHOPKEEPER' });
        return { token: authToken, user: shopkeeper, role: 'SHOPKEEPER' }; // Direct Login
    }

    // Check Customer
    const customer = await prisma.customer.findUnique({ where: { email } });
    if (customer) {
        if (customer.deletedAt) throw new ApiError(403, "Account deactivated");

        if (!customer.isEmailVerified) {
            await prisma.customer.update({ where: { id: customer.id }, data: { isEmailVerified: true } });
        }

        const authToken = signToken({ userId: customer.id, role: 'CUSTOMER' });
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

export const registerWithGoogle = async (role: 'SHOPKEEPER' | 'CUSTOMER', token: string) => {
    // 1. Verify Token again (security)
    const payload = await verifyGoogleToken(token);
    const { email, name, picture } = payload;

    if (!email) throw new ApiError(400, "Email required");

    // 2. Check if user exists
    // If user exists, we log them in automatically (better UX)
    const existingShopkeeper = await prisma.shopkeeper.findUnique({
        where: { email },
        include: { shops: true }
    });
    if (existingShopkeeper) {
        // If they are a shopkeeper, log them in (even if they tried to register as customer, we prioritize their existing identity)
        const authToken = signToken({ userId: existingShopkeeper.id, role: 'SHOPKEEPER' });
        return { token: authToken, user: existingShopkeeper, role: 'SHOPKEEPER' };
    }

    const existingCustomer = await prisma.customer.findUnique({ where: { email } });
    if (existingCustomer) {
        // Log in as existing customer
        const authToken = signToken({ userId: existingCustomer.id, role: 'CUSTOMER' });
        return { token: authToken, user: existingCustomer, role: 'CUSTOMER' };
    }

    // 3. Create User
    const uniqueId = await generateGlobalUniqueId(email, name);

    let newUser: any;

    if (role === 'SHOPKEEPER') {
        const data: any = {
            email,
            name: name || "Shopkeeper",
            uniqueId,
            isEmailVerified: true,
            isPhoneVerified: false // Google doesn't verify phone usually
        };
        // Shopkeeper doesn't have photoUrl in schema

        newUser = await prisma.shopkeeper.create({
            data
        });
    } else {
        newUser = await prisma.customer.create({
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
    const authToken = signToken({ userId: newUser.id, role });
    return { token: authToken, user: newUser, role };
};
