"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTodayAnalytics = exports.getShopAnalytics = exports.trackOrder = exports.trackShopView = void 0;
const database_1 = require("../../shared/database");
const logger_1 = require("../../shared/utils/logger");
/**
 * Track shop view
 */
const trackShopView = async (shopId) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    try {
        await database_1.prisma.shopAnalytics.upsert({
            where: {
                shopId_date: {
                    shopId,
                    date: today
                }
            },
            update: {
                views: {
                    increment: 1
                }
            },
            create: {
                shopId,
                date: today,
                views: 1,
                orders: 0,
                revenue: 0
            }
        });
    }
    catch (error) {
        logger_1.logger.error('Failed to track shop view:', error);
    }
};
exports.trackShopView = trackShopView;
/**
 * Track order creation
 */
const trackOrder = async (shopId, orderAmount, profit) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    try {
        await database_1.prisma.shopAnalytics.upsert({
            where: {
                shopId_date: {
                    shopId,
                    date: today
                }
            },
            update: {
                orders: {
                    increment: 1
                },
                revenue: {
                    increment: orderAmount
                },
                profit: {
                    increment: profit
                }
            },
            create: {
                shopId,
                date: today,
                views: 0,
                orders: 1,
                revenue: orderAmount,
                profit
            }
        });
    }
    catch (error) {
        logger_1.logger.error('Failed to track order:', error);
    }
};
exports.trackOrder = trackOrder;
/**
 * Get shop analytics for date range
 */
const getShopAnalytics = async (shopId, startDate, endDate) => {
    const analytics = await database_1.prisma.shopAnalytics.findMany({
        where: {
            shopId,
            date: {
                gte: startDate,
                lte: endDate
            }
        },
        orderBy: {
            date: 'asc'
        }
    });
    // Get Top Customers
    const topCustomersRaw = await database_1.prisma.sale.groupBy({
        by: ['customerId'],
        where: {
            shopId,
            createdAt: { gte: startDate, lte: endDate },
            customerId: { not: null }
        },
        _sum: { amount: true },
        _count: { saleId: true },
        orderBy: { _sum: { amount: 'desc' } },
        take: 5
    });
    const customerIds = topCustomersRaw.map(c => c.customerId).filter(Boolean);
    const customers = await database_1.prisma.customer.findMany({
        where: { id: { in: customerIds } },
        select: { id: true, name: true, phone: true }
    });
    const topCustomers = topCustomersRaw.map(tc => {
        const customer = customers.find(c => c.id === tc.customerId);
        return {
            id: tc.customerId,
            name: customer?.name || 'Unknown',
            phone: customer?.phone || 'N/A',
            totalSpent: Number(tc._sum.amount || 0),
            orderCount: tc._count.saleId
        };
    });
    const summary = {
        totalViews: analytics.reduce((sum, a) => sum + a.views, 0),
        totalOrders: analytics.reduce((sum, a) => sum + a.orders, 0),
        totalRevenue: analytics.reduce((sum, a) => sum + Number(a.revenue), 0),
        totalProfit: analytics.reduce((sum, a) => sum + Number(a.profit || 0), 0),
        averageOrderValue: 0,
        dailyData: analytics,
        topCustomers
    };
    if (summary.totalOrders > 0) {
        summary.averageOrderValue = summary.totalRevenue / summary.totalOrders;
    }
    return summary;
};
exports.getShopAnalytics = getShopAnalytics;
/**
 * Get today's analytics for a shop
 */
const getTodayAnalytics = async (shopId) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const analytics = await database_1.prisma.shopAnalytics.findUnique({
        where: {
            shopId_date: {
                shopId,
                date: today
            }
        }
    });
    return analytics || {
        views: 0,
        orders: 0,
        revenue: 0,
        profit: 0
    };
};
exports.getTodayAnalytics = getTodayAnalytics;
