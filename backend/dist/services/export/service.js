"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.exportReviews = exports.exportAnalytics = exports.exportOrders = void 0;
const json2csv_1 = require("json2csv");
const database_1 = require("../../shared/database");
/**
 * Export shop orders to CSV
 */
const exportOrders = async (shopId) => {
    const orders = await database_1.prisma.order.findMany({
        where: { shopId, deletedAt: null },
        include: {
            customer: {
                select: { name: true, phone: true }
            }
        },
        orderBy: { createdAt: 'desc' }
    });
    const data = orders.map(order => ({
        orderId: order.orderId,
        customerName: order.customer.name,
        customerPhone: order.customer.phone,
        status: order.status,
        pickupEta: order.pickupEtaMinutes,
        createdAt: order.createdAt.toISOString(),
        items: JSON.stringify(order.items)
    }));
    const parser = new json2csv_1.Parser({
        fields: ['orderId', 'customerName', 'customerPhone', 'status', 'pickupEta', 'createdAt', 'items']
    });
    return parser.parse(data);
};
exports.exportOrders = exportOrders;
/**
 * Export shop analytics to CSV
 */
const exportAnalytics = async (shopId, startDate, endDate) => {
    const analytics = await database_1.prisma.shopAnalytics.findMany({
        where: {
            shopId,
            date: {
                gte: startDate,
                lte: endDate
            }
        },
        orderBy: { date: 'asc' }
    });
    const data = analytics.map(a => ({
        date: a.date.toISOString().split('T')[0],
        views: a.views,
        orders: a.orders,
        revenue: a.revenue.toString()
    }));
    const parser = new json2csv_1.Parser({
        fields: ['date', 'views', 'orders', 'revenue']
    });
    return parser.parse(data);
};
exports.exportAnalytics = exportAnalytics;
/**
 * Export shop reviews to CSV
 */
const exportReviews = async (shopId) => {
    const reviews = await database_1.prisma.review.findMany({
        where: { shopId },
        include: {
            customer: {
                select: { name: true }
            }
        },
        orderBy: { createdAt: 'desc' }
    });
    const data = reviews.map(r => ({
        reviewId: r.reviewId,
        customerName: r.customer.name,
        rating: r.rating,
        comment: r.comment || '',
        createdAt: r.createdAt.toISOString()
    }));
    const parser = new json2csv_1.Parser({
        fields: ['reviewId', 'customerName', 'rating', 'comment', 'createdAt']
    });
    return parser.parse(data);
};
exports.exportReviews = exportReviews;
