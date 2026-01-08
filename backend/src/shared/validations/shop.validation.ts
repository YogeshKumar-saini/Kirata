import { z } from 'zod';
import { ShopCategory } from '@prisma/client';

// Business hours schema
const businessHoursSchema = z.record(
    z.string(),
    z.object({
        open: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:MM)"),
        close: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:MM)"),
        closed: z.boolean().optional() // For days when shop is closed
    })
).optional();

// Indian phone number regex
const phoneRegex = /^\+91[6-9]\d{9}$/;

// Indian GST number regex
const gstRegex = /^\d{2}[A-Z]{5}\d{4}[A-Z]{1}\d[Z]{1}[A-Z\d]{1}$/;

// Indian pincode regex
const pincodeRegex = /^\d{6}$/;

const emptyToUndefined = (val: unknown) => (val === "" ? undefined : val);

export const createShopSchema = z.object({
    body: z.object({
        // Basic Info (Required)
        name: z.string().min(3, "Shop name must be at least 3 characters").max(100),
        category: z.nativeEnum(ShopCategory),

        // Detailed Address (Required fields)
        addressLine1: z.string().min(5, "Street address is required").max(200),
        addressLine2: z.string().max(200).optional(),
        city: z.string().min(2, "City is required").max(50),
        state: z.string().min(2, "State is required").max(50),
        pincode: z.string().regex(pincodeRegex, "Invalid pincode (must be 6 digits)"),

        // Contact Details (At least one required)
        phone: z.preprocess(emptyToUndefined, z.string().regex(phoneRegex, "Invalid phone number (format: +91XXXXXXXXXX)").optional()),
        alternatePhone: z.preprocess(emptyToUndefined, z.string().regex(phoneRegex, "Invalid alternate phone number").optional()),
        email: z.preprocess(emptyToUndefined, z.string().email("Invalid email address").optional()),
        whatsappNumber: z.preprocess(emptyToUndefined, z.string().regex(phoneRegex, "Invalid WhatsApp number").optional()),

        // Business Details (Optional)
        gstNumber: z.preprocess(emptyToUndefined, z.string().regex(gstRegex, "Invalid GST number format").optional()),
        businessHours: businessHoursSchema,

        // Legacy field (optional, deprecated)
        location: z.string().optional(),
    }).refine(
        (data) => data.phone || data.email || data.whatsappNumber,
        {
            message: "At least one contact method (phone, email, or WhatsApp) is required",
            path: ["phone"]
        }
    )
});

export const updateShopSchema = z.object({
    body: z.object({
        name: z.string().min(3).max(100).optional(),
        category: z.nativeEnum(ShopCategory).optional(),

        addressLine1: z.string().min(5).max(200).optional(),
        addressLine2: z.string().max(200).optional(),
        city: z.string().min(2).max(50).optional(),
        state: z.string().min(2).max(50).optional(),
        pincode: z.string().regex(pincodeRegex).optional(),

        phone: z.preprocess(emptyToUndefined, z.string().regex(phoneRegex).optional()),
        alternatePhone: z.preprocess(emptyToUndefined, z.string().regex(phoneRegex).optional()),
        email: z.preprocess(emptyToUndefined, z.string().email().optional()),
        whatsappNumber: z.preprocess(emptyToUndefined, z.string().regex(phoneRegex).optional()),

        gstNumber: z.preprocess(emptyToUndefined, z.string().regex(gstRegex).optional()),
        businessHours: businessHoursSchema,

        isActive: z.boolean().optional(),
    })
});
