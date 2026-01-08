import { prisma } from '../../shared/database';
import { logger } from '../../shared/utils/logger';

/**
 * Track shop view
 */
export const trackShopView = async (shopId: string): Promise<void> => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    try {
        await prisma.shopAnalytics.upsert({
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
    } catch (error) {
        logger.error('Failed to track shop view:', error);
    }
};

/**
 * Track order creation
 */
export const trackOrder = async (
    shopId: string,
    orderAmount: number,
    profit: number
): Promise<void> => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    try {
        await prisma.shopAnalytics.upsert({
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
    } catch (error) {
        logger.error('Failed to track order:', error);
    }
};

/**
 * Get shop analytics for date range
 */
export const getShopAnalytics = async (
    shopId: string,
    startDate: Date,
    endDate: Date
) => {
    const analytics = await prisma.shopAnalytics.findMany({
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
    const topCustomersRaw = await prisma.sale.groupBy({
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

    const customerIds = topCustomersRaw.map(c => c.customerId!).filter(Boolean);
    const customers = await prisma.customer.findMany({
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

/**
 * Get today's analytics for a shop
 */
export const getTodayAnalytics = async (shopId: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const analytics = await prisma.shopAnalytics.findUnique({
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
