import { z } from 'zod';
import { AdminRole } from '@prisma/client';

export const registerAdminSchema = z.object({
    body: z.object({
        email: z.string().email().optional(),
        phone: z.string().optional(),
        password: z.string().min(6).optional(),
        name: z.string().min(1).optional(),
        role: z.nativeEnum(AdminRole),
    }).refine((data) => data.phone || data.email, {
        message: "Either phone or email must be provided",
        path: ["email"],
    }),
});

export const loginAdminSchema = z.object({
    body: z.object({
        email: z.string().email(),
        password: z.string(),
    }),
});

export const registerUserSchema = z.object({
    body: z.object({
        phone: z.string().optional(),
        email: z.string().email().optional(),
        name: z.string().optional(),
    }).refine((data) => data.phone || data.email, {
        message: "Either phone or email must be provided",
        path: ["phone"],
    }),
});

export const requestOtpSchema = z.object({
    body: z.object({
        phone: z.string().optional(),
        email: z.string().email().optional(),
    }).refine((data) => data.phone || data.email, {
        message: "Either phone or email must be provided",
        path: ["phone"],
    }),
});

export const unifiedLoginSchema = z.object({
    body: z.object({
        phone: z.string().optional(),
        email: z.string().email().optional(),
        otp: z.string().length(6).optional(),
        password: z.string().optional(),
    }).refine((data) => data.phone || data.email, {
        message: "Either phone or email must be provided",
        path: ["phone"],
    }).refine((data) => data.otp || data.password, {
        message: "Either OTP or Password must be provided",
        path: ["password"],
    }),
});

export const loginWithPasswordSchema = z.object({
    body: z.object({
        phone: z.string().optional(),
        email: z.string().email().optional(),
        password: z.string().min(1, "Password is required"),
    }).refine((data) => data.phone || data.email, {
        message: "Either phone or email must be provided",
        path: ["phone"],
    }),
});

export const resetPasswordRequestSchema = z.object({
    body: z.object({
        phone: z.string().optional(),
        email: z.string().email().optional(),
    }).refine((data) => data.phone || data.email, {
        message: "Either phone or email must be provided",
        path: ["phone"],
    }),
});

export const resetPasswordConfirmSchema = z.object({
    body: z.object({
        phone: z.string().optional(),
        email: z.string().email().optional(),
        otp: z.string().length(6),
        newPassword: z.string().min(6),
    }).refine((data) => data.phone || data.email, {
        message: "Either phone or email must be provided",
        path: ["phone"],
    }),
});

// Strong Password Schema
const strongPasswordSchema = z.string()
    .min(8, "Password must be at least 8 characters long")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character");

export const updateProfileSchema = z.object({
    body: z.object({
        name: z.string().min(1).optional(),
        address: z.string().optional(),
        addressLine1: z.string().optional(),
        addressLine2: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        pincode: z.string().optional(),
    }),
});

export const updatePasswordSchema = z.object({
    body: z.object({
        currentPassword: z.string().optional(), // Optional for first time set
        newPassword: strongPasswordSchema,
    }),
});

// Update password-related schemas to use strong password
export const resetPasswordConfirmSchemaStrong = z.object({
    body: z.object({
        phone: z.string().optional(),
        email: z.string().email().optional(),
        otp: z.string().length(6),
        newPassword: strongPasswordSchema,
    }).refine((data) => data.phone || data.email, {
        message: "Either phone or email must be provided",
        path: ["phone"],
    }),
});

// Change Email/Phone Schemas
export const changeEmailRequestSchema = z.object({
    body: z.object({
        newEmail: z.string().email("Invalid email format"),
    }),
});

export const changeEmailConfirmSchema = z.object({
    body: z.object({
        newEmail: z.string().email("Invalid email format"),
        otp: z.string().length(6, "OTP must be 6 digits"),
    }),
});

export const changePhoneRequestSchema = z.object({
    body: z.object({
        newPhone: z.string().regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number format"),
    }),
});

export const changePhoneConfirmSchema = z.object({
    body: z.object({
        newPhone: z.string().regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number format"),
        otp: z.string().length(6, "OTP must be 6 digits"),
    }),
});

// Email Verification Schema
export const verifyEmailSchema = z.object({
    body: z.object({
        otp: z.string().length(6, "OTP must be 6 digits"),
    }),
});

// Admin Unlock Account Schema
export const unlockAccountSchema = z.object({
    body: z.object({
        targetUserId: z.string().min(1, "User ID is required"),
        targetRole: z.enum(['SUPER_ADMIN', 'SHOP_MANAGER_ADMIN', 'SUPPORT_ADMIN', 'SHOPKEEPER', 'CUSTOMER']),
    }),
});

export const setPinSchema = z.object({
    body: z.object({
        pin: z.string().regex(/^\d{4,6}$/, "PIN must be 4-6 digits"),
    }),
});

export const verifyPinSchema = z.object({
    body: z.object({
        pin: z.string().regex(/^\d{4,6}$/, "PIN must be 4-6 digits"),
    }),
});
