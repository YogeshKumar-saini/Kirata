import { prisma } from '../../shared/database';
import { ApiError } from '../../shared/errors/ApiError';

// 1. Dashboard Stats
export const getCustomerDashboardStats = async (customerId: string) => {
    // Correct Logic: Balance = Sum(UDHAAR) - Sum(CASH/UPI)
    // We need to aggregate across ALL shops
    const sales = await prisma.sale.groupBy({
        by: ['paymentType'],
        where: { customerId },
        _sum: { amount: true }
    });

    let totalUdhaar = 0;
    let totalPaid = 0;
    let totalSpend = 0; // For loyalty points

    sales.forEach(group => {
        const amount = Number(group._sum.amount || 0);
        if (group.paymentType === 'UDHAAR') {
            totalUdhaar += amount;
        } else if (['CASH', 'UPI'].includes(group.paymentType)) {
            totalPaid += amount;
            totalSpend += amount;
        }
    });

    const outstandingBalance = totalUdhaar - totalPaid;

    // Active Orders
    const activeOrdersCount = await prisma.order.count({
        where: { customerId, status: { in: ['PENDING', 'ACCEPTED', 'READY'] } }
    });

    // Recent Activity
    const recentActivity = await prisma.sale.findMany({
        where: { customerId },
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
            shop: { select: { name: true, photoUrl: true } }
        }
    });

    // Loyalty Points Logic (1 Point per 100 spent)
    const loyaltyPoints = Math.floor(totalSpend / 100);

    // Fetch one active featured offer
    const promotionalOffer = await prisma.offer.findFirst({
        where: { isActive: true },
        orderBy: { createdAt: 'desc' },
        include: {
            shop: { select: { name: true } }
        }
    });

    return {
        totalUdhaar: outstandingBalance,
        activeOrdersCount,
        recentActivity,
        loyaltyPoints,
        promotionalOffer
    };
};

// 2. Get Shops List
export const getCustomerShops = async (customerId: string) => {
    // Find shops where customer has sales
    const distinctShops = await prisma.sale.findMany({
        where: { customerId },
        distinct: ['shopId'],
        select: { shopId: true }
    });

    const shopIds = distinctShops.map(s => s.shopId);

    const shops = await prisma.shop.findMany({
        where: { shopId: { in: shopIds } },
        select: {
            shopId: true,
            name: true,
            city: true,
            category: true,
            phone: true
        }
    });

    // Calculate balance per shop
    const shopsWithBalance = await Promise.all(shops.map(async (shop) => {
        // Reuse logic: Sum(UDHAAR) - Sum(CASH/UPI) for this shop
        const sales = await prisma.sale.groupBy({
            by: ['paymentType'],
            where: { customerId, shopId: shop.shopId },
            _sum: { amount: true }
        });

        let credit = 0;
        let debit = 0;
        sales.forEach(g => {
            if (g.paymentType === 'UDHAAR') credit += Number(g._sum.amount || 0);
            else if (['CASH', 'UPI'].includes(g.paymentType)) debit += Number(g._sum.amount || 0);
        });

        return { ...shop, balance: credit - debit };
    }));

    return shopsWithBalance;
};

// 3. Get Shop Ledger
export const getCustomerShopLedger = async (customerId: string, shopId: string) => {
    const shop = await prisma.shop.findUnique({
        where: { shopId },
        select: { name: true, phone: true, addressLine1: true, city: true }
    });

    if (!shop) throw new Error('Shop not found');

    // Calculate totals and running balance
    let totalCredit = 0;
    let totalPaid = 0;

    // To calculate running balance, we process transactions from oldest to newest
    // But we fetched them DESC. Le's reverse, calculate, then reverse back (or just return as is).
    // Actually, sorting ASC in query is cleaner for calculation.

    const ascTransactions = await prisma.sale.findMany({
        where: { customerId, shopId },
        orderBy: { createdAt: 'asc' }
    });

    let currentBalance = 0;
    const historyWithBalance = ascTransactions.map(t => {
        if (t.paymentType === 'UDHAAR') {
            totalCredit += Number(t.amount);
            currentBalance += Number(t.amount);
        } else if (['CASH', 'UPI'].includes(t.paymentType)) {
            totalPaid += Number(t.amount);
            currentBalance -= Number(t.amount);
        }
        return { ...t, runningBalance: currentBalance };
    });

    // We want to show latest at top
    const historyDesc = historyWithBalance.reverse();

    return {
        shop,
        transactions: historyDesc,
        summary: {
            totalCredit,
            totalPaid,
            balance: totalCredit - totalPaid
        }
    };
};

// 4. Get Orders
export const getCustomerOrders = async (customerId: string) => {
    return prisma.order.findMany({
        where: { customerId },
        orderBy: { createdAt: 'desc' },
        include: {
            shop: { select: { name: true } }
        }
    });
};

// 5. Update Profile
export const updateCustomerProfile = async (customerId: string, data: any) => {
    return prisma.customer.update({
        where: { id: customerId },
        data: {
            name: data.name,
            email: data.email,
            address: data.address,
            addressLine1: data.addressLine1,
            addressLine2: data.addressLine2,
            city: data.city,
            state: data.state,
            pincode: data.pincode,
            photoUrl: data.photoUrl,
            notificationPrefs: data.notificationPrefs,
            gender: data.gender,
            dateOfBirth: data.dateOfBirth
        }
    });
};

// 6. Analytics
export const getCustomerAnalytics = async (customerId: string) => {
    // Monthly Spend (Last 6 Months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const sales = await prisma.sale.findMany({
        where: {
            customerId,
            createdAt: { gte: sixMonthsAgo },
            paymentType: { in: ['CASH', 'UPI', 'UDHAAR'] } // Tracking all spending including credit
        },
        include: {
            shop: { select: { category: true, name: true } }
        }
    });

    // 1. Spend by Category
    const byCategory: Record<string, number> = {};
    sales.forEach(sale => {
        const cat = sale.shop?.category || 'Uncategorized';
        byCategory[cat] = (byCategory[cat] || 0) + Number(sale.amount);
    });

    // 2. Monthly Trend
    const monthlyTrend: Record<string, number> = {};
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    sales.forEach(sale => {
        const date = new Date(sale.createdAt);
        const key = `${monthNames[date.getMonth()]} ${date.getFullYear()} `; // e.g. "Jan 2024"
        monthlyTrend[key] = (monthlyTrend[key] || 0) + Number(sale.amount);
    });

    // 3. Top Shops with Stats
    const shopStats: Record<string, { name: string; category: string; amount: number; visits: number }> = {};

    sales.forEach(sale => {
        if (!sale.shopId) return;
        if (!shopStats[sale.shopId]) {
            shopStats[sale.shopId] = {
                name: sale.shop?.name || 'Unknown',
                category: sale.shop?.category || 'General',
                amount: 0,
                visits: 0
            };
        }
        shopStats[sale.shopId].amount += Number(sale.amount);
        shopStats[sale.shopId].visits += 1;
    });

    const topShops = Object.values(shopStats)
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 5);

    // 4. Payment Stats (Including Udhaar)
    // For payment stats, we need ALL transactions, not just spent ones
    const allTransactions = await prisma.sale.findMany({
        where: { customerId, createdAt: { gte: sixMonthsAgo } }
    });

    const paymentStats = {
        CASH: 0,
        UPI: 0,
        UDHAAR: 0
    };

    allTransactions.forEach(t => {
        if (t.paymentType === 'CASH') paymentStats.CASH += 1;
        else if (t.paymentType === 'UPI') paymentStats.UPI += 1;
        else if (t.paymentType === 'UDHAAR') paymentStats.UDHAAR += 1;
    });

    const totalTxns = allTransactions.length;
    const avgOrderValue = totalTxns > 0
        ? allTransactions.reduce((acc, t) => acc + Number(t.amount), 0) / totalTxns
        : 0;

    return {
        byCategory: Object.entries(byCategory).map(([name, value]) => ({ name, value })),
        monthlyTrend: Object.entries(monthlyTrend).map(([name, value]) => ({ name, value })),
        topShops,
        paymentDistribution: [
            { name: 'Cash', value: paymentStats.CASH },
            { name: 'UPI', value: paymentStats.UPI },
            { name: 'Credit (Udhaar)', value: paymentStats.UDHAAR }
        ],
        stats: {
            totalTransactions: totalTxns,
            avgOrderValue
        }
    };
};

// 7. UPI Payment
export const generateUpiIntent = async (shopId: string, amount: number) => {
    const shop = await prisma.shop.findUnique({
        where: { shopId },
        select: {
            name: true,
            phone: true
        }
    });

    if (!shop) throw new Error('Shop not found');
    if (!shop.phone) throw new Error('Shop has no registered phone for UPI');

    // Construct UPI Intent URL
    // pn = Payee Name, pa = Payee Address (VPA), am = Amount, cu = Currency
    // Example: upi://pay?pa=9876543210@upi&pn=MyShop&am=100.00&cu=INR

    // Fallback VPA logic: phone@upi (very common default)
    const vpa = `${shop.phone}@upi`;
    const payeeName = encodeURIComponent(shop.name);
    const amountStr = amount.toFixed(2);

    const intentUrl = `upi://pay?pa=${vpa}&pn=${payeeName}&am=${amountStr}&cu=INR`;

    return {
        intentUrl,
        vpa,
        payeeName,
        amount: amountStr
    };
};

// 8. Shop Reviews
export const createShopReview = async (customerId: string, shopId: string, rating: number, comment?: string) => {
    // 1. Create Review
    const review = await prisma.review.create({
        data: {
            customerId,
            shopId,
            rating,
            comment
        }
    });

    // 2. Update Shop Average Rating (Async or inline)
    const aggregations = await prisma.review.aggregate({
        where: { shopId },
        _avg: { rating: true },
        _count: { reviewId: true }
    });

    await prisma.shop.update({
        where: { shopId },
        data: {
            averageRating: aggregations._avg.rating || 0,
            totalReviews: aggregations._count.reviewId || 0
        }
    });

    return review;
};
// 9. Record Payment (Customer Initiated)
export const recordCustomerPayment = async (customerId: string, shopId: string, amount: number, paymentMethod: string, notes?: string) => {
    // Import LedgerService dynamically to avoid circular dependencies if any
    const LedgerService = await import('../ledger/service');

    // We use the same ledger service logic
    // This will either reduce udhaar or record a POS sale with credit balance if no udhaar exists
    return LedgerService.recordPayment(
        shopId,
        customerId,
        amount,
        paymentMethod,
        notes
    );
};

export const getCustomerTransactions = async (customerId: string, filters: any) => {
    const where: any = { customerId };

    if (filters.shopId) {
        where.shopId = filters.shopId;
    }

    if (filters.paymentType) {
        where.paymentType = filters.paymentType;
    }

    if (filters.startDate || filters.endDate) {
        where.createdAt = {};
        if (filters.startDate) where.createdAt.gte = filters.startDate;
        if (filters.endDate) where.createdAt.lte = filters.endDate;
    }

    return prisma.sale.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: filters.limit || 50,
        include: {
            shop: { select: { name: true, city: true } }
        }
    });
};

export const exportCustomerLedger = async (customerId: string, shopId: string, format: string) => {
    const LedgerService = await import('../ledger/service');
    // Using existing export logic from LedgerService
    if (format === 'csv') {
        return LedgerService.exportSalesToCSV(shopId, { customerId });
    }
    // We can add Excel/PDF later as needed
    return { message: "Format not supported yet" };
};

export const getCustomerTransactionReceipt = async (customerId: string, transactionId: string) => {
    const sale = await prisma.sale.findUnique({
        where: { saleId: transactionId }
    });

    if (!sale || sale.customerId !== customerId) {
        throw new Error('Transaction not found or unauthorized');
    }

    const LedgerService = await import('../ledger/service');
    return LedgerService.generateTransactionReceipt(sale.shopId, transactionId);
};
