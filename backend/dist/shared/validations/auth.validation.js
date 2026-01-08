"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyPinSchema = exports.setPinSchema = exports.unlockAccountSchema = exports.verifyEmailSchema = exports.changePhoneConfirmSchema = exports.changePhoneRequestSchema = exports.changeEmailConfirmSchema = exports.changeEmailRequestSchema = exports.resetPasswordConfirmSchemaStrong = exports.updatePasswordSchema = exports.updateProfileSchema = exports.resetPasswordConfirmSchema = exports.resetPasswordRequestSchema = exports.loginWithPasswordSchema = exports.unifiedLoginSchema = exports.requestOtpSchema = exports.registerUserSchema = exports.loginAdminSchema = exports.registerAdminSchema = void 0;
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
exports.registerAdminSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z.string().email().optional(),
        phone: zod_1.z.string().optional(),
        password: zod_1.z.string().min(6).optional(),
        name: zod_1.z.string().min(1).optional(),
        role: zod_1.z.nativeEnum(client_1.AdminRole),
    }).refine((data) => data.phone || data.email, {
        message: "Either phone or email must be provided",
        path: ["email"],
    }),
});
exports.loginAdminSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z.string().email(),
        password: zod_1.z.string(),
    }),
});
exports.registerUserSchema = zod_1.z.object({
    body: zod_1.z.object({
        phone: zod_1.z.string().optional(),
        email: zod_1.z.string().email().optional(),
        name: zod_1.z.string().optional(),
    }).refine((data) => data.phone || data.email, {
        message: "Either phone or email must be provided",
        path: ["phone"],
    }),
});
exports.requestOtpSchema = zod_1.z.object({
    body: zod_1.z.object({
        phone: zod_1.z.string().optional(),
        email: zod_1.z.string().email().optional(),
    }).refine((data) => data.phone || data.email, {
        message: "Either phone or email must be provided",
        path: ["phone"],
    }),
});
exports.unifiedLoginSchema = zod_1.z.object({
    body: zod_1.z.object({
        phone: zod_1.z.string().optional(),
        email: zod_1.z.string().email().optional(),
        otp: zod_1.z.string().length(6).optional(),
        password: zod_1.z.string().optional(),
    }).refine((data) => data.phone || data.email, {
        message: "Either phone or email must be provided",
        path: ["phone"],
    }).refine((data) => data.otp || data.password, {
        message: "Either OTP or Password must be provided",
        path: ["password"],
    }),
});
exports.loginWithPasswordSchema = zod_1.z.object({
    body: zod_1.z.object({
        phone: zod_1.z.string().optional(),
        email: zod_1.z.string().email().optional(),
        password: zod_1.z.string().min(1, "Password is required"),
    }).refine((data) => data.phone || data.email, {
        message: "Either phone or email must be provided",
        path: ["phone"],
    }),
});
exports.resetPasswordRequestSchema = zod_1.z.object({
    body: zod_1.z.object({
        phone: zod_1.z.string().optional(),
        email: zod_1.z.string().email().optional(),
    }).refine((data) => data.phone || data.email, {
        message: "Either phone or email must be provided",
        path: ["phone"],
    }),
});
exports.resetPasswordConfirmSchema = zod_1.z.object({
    body: zod_1.z.object({
        phone: zod_1.z.string().optional(),
        email: zod_1.z.string().email().optional(),
        otp: zod_1.z.string().length(6),
        newPassword: zod_1.z.string().min(6),
    }).refine((data) => data.phone || data.email, {
        message: "Either phone or email must be provided",
        path: ["phone"],
    }),
});
// Strong Password Schema
const strongPasswordSchema = zod_1.z.string()
    .min(8, "Password must be at least 8 characters long")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character");
exports.updateProfileSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(1).optional(),
        address: zod_1.z.string().optional(),
        addressLine1: zod_1.z.string().optional(),
        addressLine2: zod_1.z.string().optional(),
        city: zod_1.z.string().optional(),
        state: zod_1.z.string().optional(),
        pincode: zod_1.z.string().optional(),
    }),
});
exports.updatePasswordSchema = zod_1.z.object({
    body: zod_1.z.object({
        currentPassword: zod_1.z.string().optional(), // Optional for first time set
        newPassword: strongPasswordSchema,
    }),
});
// Update password-related schemas to use strong password
exports.resetPasswordConfirmSchemaStrong = zod_1.z.object({
    body: zod_1.z.object({
        phone: zod_1.z.string().optional(),
        email: zod_1.z.string().email().optional(),
        otp: zod_1.z.string().length(6),
        newPassword: strongPasswordSchema,
    }).refine((data) => data.phone || data.email, {
        message: "Either phone or email must be provided",
        path: ["phone"],
    }),
});
// Change Email/Phone Schemas
exports.changeEmailRequestSchema = zod_1.z.object({
    body: zod_1.z.object({
        newEmail: zod_1.z.string().email("Invalid email format"),
    }),
});
exports.changeEmailConfirmSchema = zod_1.z.object({
    body: zod_1.z.object({
        newEmail: zod_1.z.string().email("Invalid email format"),
        otp: zod_1.z.string().length(6, "OTP must be 6 digits"),
    }),
});
exports.changePhoneRequestSchema = zod_1.z.object({
    body: zod_1.z.object({
        newPhone: zod_1.z.string().regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number format"),
    }),
});
exports.changePhoneConfirmSchema = zod_1.z.object({
    body: zod_1.z.object({
        newPhone: zod_1.z.string().regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number format"),
        otp: zod_1.z.string().length(6, "OTP must be 6 digits"),
    }),
});
// Email Verification Schema
exports.verifyEmailSchema = zod_1.z.object({
    body: zod_1.z.object({
        otp: zod_1.z.string().length(6, "OTP must be 6 digits"),
    }),
});
// Admin Unlock Account Schema
exports.unlockAccountSchema = zod_1.z.object({
    body: zod_1.z.object({
        targetUserId: zod_1.z.string().min(1, "User ID is required"),
        targetRole: zod_1.z.enum(['SUPER_ADMIN', 'SHOP_MANAGER_ADMIN', 'SUPPORT_ADMIN', 'SHOPKEEPER', 'CUSTOMER']),
    }),
});
exports.setPinSchema = zod_1.z.object({
    body: zod_1.z.object({
        pin: zod_1.z.string().regex(/^\d{4,6}$/, "PIN must be 4-6 digits"),
    }),
});
exports.verifyPinSchema = zod_1.z.object({
    body: zod_1.z.object({
        pin: zod_1.z.string().regex(/^\d{4,6}$/, "PIN must be 4-6 digits"),
    }),
});
