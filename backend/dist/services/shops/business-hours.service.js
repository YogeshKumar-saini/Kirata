"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeHoursException = exports.addHoursException = exports.isShopOpen = exports.isOnVacation = exports.disableVacationMode = exports.enableVacationMode = void 0;
const database_1 = require("../../shared/database");
const logger_1 = require("../../shared/utils/logger");
/**
 * Enable vacation mode for a shop
 */
const enableVacationMode = async (shopId, startDate, endDate, message) => {
    const shop = await database_1.prisma.shop.update({
        where: { shopId },
        data: {
            vacationMode: true,
            vacationStartDate: startDate,
            vacationEndDate: endDate,
            vacationMessage: message || 'Shop is temporarily closed for vacation'
        }
    });
    logger_1.logger.info(`Vacation mode enabled for shop ${shopId} from ${startDate} to ${endDate}`);
    return shop;
};
exports.enableVacationMode = enableVacationMode;
/**
 * Disable vacation mode
 */
const disableVacationMode = async (shopId) => {
    const shop = await database_1.prisma.shop.update({
        where: { shopId },
        data: {
            vacationMode: false,
            vacationStartDate: null,
            vacationEndDate: null,
            vacationMessage: null
        }
    });
    logger_1.logger.info(`Vacation mode disabled for shop ${shopId}`);
    return shop;
};
exports.disableVacationMode = disableVacationMode;
/**
 * Check if shop is currently on vacation
 */
const isOnVacation = (shop) => {
    if (!shop.vacationMode)
        return false;
    const now = new Date();
    const start = shop.vacationStartDate ? new Date(shop.vacationStartDate) : null;
    const end = shop.vacationEndDate ? new Date(shop.vacationEndDate) : null;
    if (start && end) {
        return now >= start && now <= end;
    }
    return shop.vacationMode;
};
exports.isOnVacation = isOnVacation;
/**
 * Check if shop is open at a specific time
 */
const isShopOpen = (shop, datetime = new Date()) => {
    // Check vacation mode first
    if ((0, exports.isOnVacation)(shop)) {
        return false;
    }
    // Check business hours exceptions
    const dateStr = datetime.toISOString().split('T')[0];
    const exceptions = shop.businessHoursExceptions || [];
    const exception = exceptions.find((e) => e.date === dateStr);
    if (exception) {
        if (exception.closed)
            return false;
        return isWithinHours(datetime, exception.open, exception.close);
    }
    // Check regular business hours
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayOfWeek = days[datetime.getDay()];
    const businessHours = shop.businessHours;
    if (!businessHours || !businessHours[dayOfWeek]) {
        return false; // No hours defined for this day
    }
    const dayHours = businessHours[dayOfWeek];
    if (dayHours.closed)
        return false;
    return isWithinHours(datetime, dayHours.open, dayHours.close);
};
exports.isShopOpen = isShopOpen;
/**
 * Helper: Check if time is within operating hours
 */
function isWithinHours(datetime, openTime, closeTime) {
    const currentTime = datetime.toTimeString().slice(0, 5); // HH:MM
    return currentTime >= openTime && currentTime <= closeTime;
}
/**
 * Add business hours exception
 */
const addHoursException = async (shopId, date, hours) => {
    const shop = await database_1.prisma.shop.findUnique({ where: { shopId } });
    if (!shop)
        throw new Error('Shop not found');
    const exceptions = shop.businessHoursExceptions || [];
    const existingIndex = exceptions.findIndex((e) => e.date === date);
    if (existingIndex >= 0) {
        exceptions[existingIndex] = { date, ...hours };
    }
    else {
        exceptions.push({ date, ...hours });
    }
    return await database_1.prisma.shop.update({
        where: { shopId },
        data: { businessHoursExceptions: exceptions }
    });
};
exports.addHoursException = addHoursException;
/**
 * Remove business hours exception
 */
const removeHoursException = async (shopId, date) => {
    const shop = await database_1.prisma.shop.findUnique({ where: { shopId } });
    if (!shop)
        throw new Error('Shop not found');
    const exceptions = shop.businessHoursExceptions || [];
    const filtered = exceptions.filter((e) => e.date !== date);
    return await database_1.prisma.shop.update({
        where: { shopId },
        data: { businessHoursExceptions: filtered }
    });
};
exports.removeHoursException = removeHoursException;
