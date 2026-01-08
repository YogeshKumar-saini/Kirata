"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateShopSchema = exports.createShopSchema = void 0;
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
// Business hours schema
const businessHoursSchema = zod_1.z.record(zod_1.z.string(), zod_1.z.object({
    open: zod_1.z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:MM)"),
    close: zod_1.z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:MM)"),
    closed: zod_1.z.boolean().optional() // For days when shop is closed
})).optional();
// Indian phone number regex
const phoneRegex = /^\+91[6-9]\d{9}$/;
// Indian GST number regex
const gstRegex = /^\d{2}[A-Z]{5}\d{4}[A-Z]{1}\d[Z]{1}[A-Z\d]{1}$/;
// Indian pincode regex
const pincodeRegex = /^\d{6}$/;
const emptyToUndefined = (val) => (val === "" ? undefined : val);
exports.createShopSchema = zod_1.z.object({
    body: zod_1.z.object({
        // Basic Info (Required)
        name: zod_1.z.string().min(3, "Shop name must be at least 3 characters").max(100),
        category: zod_1.z.nativeEnum(client_1.ShopCategory),
        // Detailed Address (Required fields)
        addressLine1: zod_1.z.string().min(5, "Street address is required").max(200),
        addressLine2: zod_1.z.string().max(200).optional(),
        city: zod_1.z.string().min(2, "City is required").max(50),
        state: zod_1.z.string().min(2, "State is required").max(50),
        pincode: zod_1.z.string().regex(pincodeRegex, "Invalid pincode (must be 6 digits)"),
        // Contact Details (At least one required)
        phone: zod_1.z.preprocess(emptyToUndefined, zod_1.z.string().regex(phoneRegex, "Invalid phone number (format: +91XXXXXXXXXX)").optional()),
        alternatePhone: zod_1.z.preprocess(emptyToUndefined, zod_1.z.string().regex(phoneRegex, "Invalid alternate phone number").optional()),
        email: zod_1.z.preprocess(emptyToUndefined, zod_1.z.string().email("Invalid email address").optional()),
        whatsappNumber: zod_1.z.preprocess(emptyToUndefined, zod_1.z.string().regex(phoneRegex, "Invalid WhatsApp number").optional()),
        // Business Details (Optional)
        gstNumber: zod_1.z.preprocess(emptyToUndefined, zod_1.z.string().regex(gstRegex, "Invalid GST number format").optional()),
        businessHours: businessHoursSchema,
        // Legacy field (optional, deprecated)
        location: zod_1.z.string().optional(),
    }).refine((data) => data.phone || data.email || data.whatsappNumber, {
        message: "At least one contact method (phone, email, or WhatsApp) is required",
        path: ["phone"]
    })
});
exports.updateShopSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(3).max(100).optional(),
        category: zod_1.z.nativeEnum(client_1.ShopCategory).optional(),
        addressLine1: zod_1.z.string().min(5).max(200).optional(),
        addressLine2: zod_1.z.string().max(200).optional(),
        city: zod_1.z.string().min(2).max(50).optional(),
        state: zod_1.z.string().min(2).max(50).optional(),
        pincode: zod_1.z.string().regex(pincodeRegex).optional(),
        phone: zod_1.z.preprocess(emptyToUndefined, zod_1.z.string().regex(phoneRegex).optional()),
        alternatePhone: zod_1.z.preprocess(emptyToUndefined, zod_1.z.string().regex(phoneRegex).optional()),
        email: zod_1.z.preprocess(emptyToUndefined, zod_1.z.string().email().optional()),
        whatsappNumber: zod_1.z.preprocess(emptyToUndefined, zod_1.z.string().regex(phoneRegex).optional()),
        gstNumber: zod_1.z.preprocess(emptyToUndefined, zod_1.z.string().regex(gstRegex).optional()),
        businessHours: businessHoursSchema,
        isActive: zod_1.z.boolean().optional(),
    })
});
