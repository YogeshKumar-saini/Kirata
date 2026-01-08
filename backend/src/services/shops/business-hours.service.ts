import { prisma } from '../../shared/database';
import { logger } from '../../shared/utils/logger';

/**
 * Enable vacation mode for a shop
 */
export const enableVacationMode = async (
    shopId: string,
    startDate: Date,
    endDate: Date,
    message?: string
) => {
    const shop = await prisma.shop.update({
        where: { shopId },
        data: {
            vacationMode: true,
            vacationStartDate: startDate,
            vacationEndDate: endDate,
            vacationMessage: message || 'Shop is temporarily closed for vacation'
        }
    });

    logger.info(`Vacation mode enabled for shop ${shopId} from ${startDate} to ${endDate}`);
    return shop;
};

/**
 * Disable vacation mode
 */
export const disableVacationMode = async (shopId: string) => {
    const shop = await prisma.shop.update({
        where: { shopId },
        data: {
            vacationMode: false,
            vacationStartDate: null,
            vacationEndDate: null,
            vacationMessage: null
        }
    });

    logger.info(`Vacation mode disabled for shop ${shopId}`);
    return shop;
};

/**
 * Check if shop is currently on vacation
 */
export const isOnVacation = (shop: any): boolean => {
    if (!shop.vacationMode) return false;

    const now = new Date();
    const start = shop.vacationStartDate ? new Date(shop.vacationStartDate) : null;
    const end = shop.vacationEndDate ? new Date(shop.vacationEndDate) : null;

    if (start && end) {
        return now >= start && now <= end;
    }

    return shop.vacationMode;
};

/**
 * Check if shop is open at a specific time
 */
export const isShopOpen = (shop: any, datetime: Date = new Date()): boolean => {
    // Check vacation mode first
    if (isOnVacation(shop)) {
        return false;
    }

    // Check business hours exceptions
    const dateStr = datetime.toISOString().split('T')[0];
    const exceptions = shop.businessHoursExceptions as any[] || [];
    const exception = exceptions.find((e: any) => e.date === dateStr);

    if (exception) {
        if (exception.closed) return false;
        return isWithinHours(datetime, exception.open, exception.close);
    }

    // Check regular business hours
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayOfWeek = days[datetime.getDay()];
    const businessHours = shop.businessHours as any;

    if (!businessHours || !businessHours[dayOfWeek]) {
        return false; // No hours defined for this day
    }

    const dayHours = businessHours[dayOfWeek];
    if (dayHours.closed) return false;

    return isWithinHours(datetime, dayHours.open, dayHours.close);
};

/**
 * Helper: Check if time is within operating hours
 */
function isWithinHours(datetime: Date, openTime: string, closeTime: string): boolean {
    const currentTime = datetime.toTimeString().slice(0, 5); // HH:MM
    return currentTime >= openTime && currentTime <= closeTime;
}

/**
 * Add business hours exception
 */
export const addHoursException = async (
    shopId: string,
    date: string,
    hours: { open?: string; close?: string; closed?: boolean }
) => {
    const shop = await prisma.shop.findUnique({ where: { shopId } });
    if (!shop) throw new Error('Shop not found');

    const exceptions = (shop.businessHoursExceptions as any[]) || [];
    const existingIndex = exceptions.findIndex((e: any) => e.date === date);

    if (existingIndex >= 0) {
        exceptions[existingIndex] = { date, ...hours };
    } else {
        exceptions.push({ date, ...hours });
    }

    return await prisma.shop.update({
        where: { shopId },
        data: { businessHoursExceptions: exceptions }
    });
};

/**
 * Remove business hours exception
 */
export const removeHoursException = async (shopId: string, date: string) => {
    const shop = await prisma.shop.findUnique({ where: { shopId } });
    if (!shop) throw new Error('Shop not found');

    const exceptions = (shop.businessHoursExceptions as any[]) || [];
    const filtered = exceptions.filter((e: any) => e.date !== date);

    return await prisma.shop.update({
        where: { shopId },
        data: { businessHoursExceptions: filtered }
    });
};
