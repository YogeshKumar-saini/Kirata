import { prisma } from '../../shared/database';
import { ApiError } from '../../shared/errors/ApiError';

export interface CreateOfferInput {
    code: string;
    type: 'PERCENTAGE' | 'FLAT';
    value: number;
    description?: string;
    minOrderValue?: number;
    maxDiscount?: number;
    usageLimit?: number;
    validFrom?: string; // ISO Date string
    validTo?: string;
}

/**
 * Create a new offer
 */
export const createOffer = async (shopId: string, data: CreateOfferInput) => {
    // Check for duplicate code in the same shop
    const existing = await prisma.offer.findFirst({
        where: {
            shopId,
            code: data.code,
            isActive: true
        }
    });

    if (existing) {
        throw new ApiError(400, 'Active offer with this code already exists');
    }

    return prisma.offer.create({
        data: {
            shopId,
            code: data.code,
            type: data.type,
            value: data.value,
            description: data.description,
            minOrderValue: data.minOrderValue,
            maxDiscount: data.maxDiscount,
            usageLimit: data.usageLimit,
            validFrom: data.validFrom ? new Date(data.validFrom) : null,
            validTo: data.validTo ? new Date(data.validTo) : null
        }
    });
};

/**
 * Get all offers for a shop
 */
export const getShopOffers = async (shopId: string) => {
    return prisma.offer.findMany({
        where: { shopId },
        orderBy: { createdAt: 'desc' }
    });
};

/**
 * Validate and calculate discount for a cart
 */
export const validateAndCalculate = async (shopId: string, code: string, cartValue: number) => {
    const offer = await prisma.offer.findFirst({
        where: {
            shopId,
            code,
            isActive: true
        }
    });

    if (!offer) {
        throw new ApiError(404, 'Invalid offer code');
    }

    // 1. Check Dates
    const now = new Date();
    if (offer.validFrom && now < offer.validFrom) {
        throw new ApiError(400, 'Offer is not yet active');
    }
    if (offer.validTo && now > offer.validTo) {
        throw new ApiError(400, 'Offer has expired');
    }

    // 2. Check Usage Limit
    if (offer.usageLimit && offer.usageCount >= offer.usageLimit) {
        throw new ApiError(400, 'Offer usage limit reached');
    }

    // 3. Check Min Order Value
    if (offer.minOrderValue && cartValue < Number(offer.minOrderValue)) {
        throw new ApiError(400, `Minimum order value of ₹${offer.minOrderValue} required`);
    }

    // 4. Calculate Discount
    let discountAmount = 0;

    if (offer.type === 'FLAT') {
        discountAmount = Number(offer.value);
    } else if (offer.type === 'PERCENTAGE') {
        discountAmount = (cartValue * Number(offer.value)) / 100;

        // 5. Apply Max Discount Cap
        if (offer.maxDiscount && discountAmount > Number(offer.maxDiscount)) {
            discountAmount = Number(offer.maxDiscount);
        }
    }

    // Ensure discount doesn't exceed cart value
    discountAmount = Math.min(discountAmount, cartValue);

    return {
        isValid: true,
        discountAmount: Number(discountAmount.toFixed(2)),
        offerId: offer.offerId,
        code: offer.code,
        message: 'Offer applied successfully'
    };
};

/**
 * Redeem an offer (increment usage and return details) using a transaction
 */
export const redeemOffer = async (shopId: string, code: string, cartValue: number, tx: any) => {
    // Reuse validation logic manually to ensure consistency
    // Note: We can't call validateAndCalculate directly efficiently inside a TX if we want to lock/update
    // So we fetch and update atomically.

    const offer = await tx.offer.findFirst({
        where: {
            shopId,
            code,
            isActive: true
        }
    });

    if (!offer) {
        throw new ApiError(404, 'Invalid offer code');
    }

    // 1. Check Dates
    const now = new Date();
    if (offer.validFrom && now < offer.validFrom) {
        throw new ApiError(400, 'Offer is not yet active');
    }
    if (offer.validTo && now > offer.validTo) {
        throw new ApiError(400, 'Offer has expired');
    }

    // 2. Check Usage Limit
    if (offer.usageLimit && offer.usageCount >= offer.usageLimit) {
        throw new ApiError(400, 'Offer usage limit reached');
    }

    // 3. Check Min Order Value
    if (offer.minOrderValue && cartValue < Number(offer.minOrderValue)) {
        throw new ApiError(400, `Minimum order value of ₹${offer.minOrderValue} required`);
    }

    // 4. Calculate Discount
    let discountAmount = 0;

    if (offer.type === 'FLAT') {
        discountAmount = Number(offer.value);
    } else if (offer.type === 'PERCENTAGE') {
        discountAmount = (cartValue * Number(offer.value)) / 100;
        if (offer.maxDiscount && discountAmount > Number(offer.maxDiscount)) {
            discountAmount = Number(offer.maxDiscount);
        }
    }

    discountAmount = Math.min(discountAmount, cartValue);

    // 5. Increment Usage
    await tx.offer.update({
        where: { offerId: offer.offerId },
        data: { usageCount: { increment: 1 } }
    });

    return {
        offerId: offer.offerId,
        discountAmount: Number(discountAmount.toFixed(2))
    };
};

/**
 * Update an existing offer
 */
export const updateOffer = async (shopId: string, offerId: string, data: Partial<CreateOfferInput>) => {
    const offer = await prisma.offer.findFirst({
        where: { shopId, offerId }
    });

    if (!offer) {
        throw new ApiError(404, 'Offer not found');
    }

    // If code is being changed, check for duplicates
    if (data.code && data.code !== offer.code) {
        const existing = await prisma.offer.findFirst({
            where: {
                shopId,
                code: data.code,
                isActive: true,
                offerId: { not: offerId }
            }
        });

        if (existing) {
            throw new ApiError(400, 'Active offer with this code already exists');
        }
    }

    return prisma.offer.update({
        where: { offerId },
        data: {
            code: data.code,
            type: data.type,
            value: data.value,
            description: data.description,
            minOrderValue: data.minOrderValue,
            maxDiscount: data.maxDiscount,
            usageLimit: data.usageLimit,
            validFrom: data.validFrom ? new Date(data.validFrom) : undefined,
            validTo: data.validTo ? new Date(data.validTo) : undefined
        }
    });
};

/**
 * Deactivate an offer
 */
export const deactivateOffer = async (shopId: string, offerId: string) => {
    const offer = await prisma.offer.findFirst({
        where: { shopId, offerId }
    });

    if (!offer) {
        throw new ApiError(404, 'Offer not found');
    }

    return prisma.offer.update({
        where: { offerId },
        data: { isActive: false }
    });
};
