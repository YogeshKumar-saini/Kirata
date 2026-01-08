import { Parser } from 'json2csv';
import { prisma } from '../../shared/database';

/**
 * Export shop orders to CSV
 */
export const exportOrders = async (shopId: string): Promise<string> => {
    const orders = await prisma.order.findMany({
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

    const parser = new Parser({
        fields: ['orderId', 'customerName', 'customerPhone', 'status', 'pickupEta', 'createdAt', 'items']
    });

    return parser.parse(data);
};

/**
 * Export shop analytics to CSV
 */
export const exportAnalytics = async (shopId: string, startDate: Date, endDate: Date): Promise<string> => {
    const analytics = await prisma.shopAnalytics.findMany({
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

    const parser = new Parser({
        fields: ['date', 'views', 'orders', 'revenue']
    });

    return parser.parse(data);
};

/**
 * Export shop reviews to CSV
 */
export const exportReviews = async (shopId: string): Promise<string> => {
    const reviews = await prisma.review.findMany({
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

    const parser = new Parser({
        fields: ['reviewId', 'customerName', 'rating', 'comment', 'createdAt']
    });

    return parser.parse(data);
};
