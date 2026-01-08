import PDFDocument from 'pdfkit';
import { prisma } from '../../shared/database';
import { getSalesSummary } from '../ledger/service';

interface ReportOptions {
    timeframe: 'daily' | 'weekly' | 'monthly';
    date: Date;
}

export const generatePDFReport = async (shopId: string, options: ReportOptions): Promise<Buffer> => {
    // 1. Fetch Data
    const startDate = new Date(options.date);
    const endDate = new Date(options.date);

    if (options.timeframe === 'daily') {
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);
    } else if (options.timeframe === 'weekly') {
        // Start of week (Monday)
        const day = startDate.getDay();
        const diff = startDate.getDate() - day + (day === 0 ? -6 : 1);
        startDate.setDate(diff);
        startDate.setHours(0, 0, 0, 0);

        // End of week
        endDate.setDate(startDate.getDate() + 6);
        endDate.setHours(23, 59, 59, 999);
    } else if (options.timeframe === 'monthly') {
        startDate.setDate(1);
        startDate.setHours(0, 0, 0, 0);

        endDate.setMonth(startDate.getMonth() + 1);
        endDate.setDate(0);
        endDate.setHours(23, 59, 59, 999);
    }

    const summary = await getSalesSummary(shopId, { startDate, endDate });
    const transactions = await prisma.sale.findMany({
        where: {
            shopId,
            createdAt: {
                gte: startDate,
                lte: endDate
            }
        },
        include: {
            customer: true
        },
        orderBy: { createdAt: 'desc' }
    });

    // 2. Create PDF
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument({ margin: 50 });
        const buffers: Buffer[] = [];

        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => resolve(Buffer.concat(buffers)));

        // Header
        doc.fontSize(20).text('Sales Report', { align: 'center' });
        doc.fontSize(12).text(`${options.timeframe.charAt(0).toUpperCase() + options.timeframe.slice(1)} Report`, { align: 'center' });
        doc.fontSize(10).text(`${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`, { align: 'center' });
        doc.moveDown();

        // Summary Section
        doc.fontSize(14).text('Summary', { underline: true });
        doc.fontSize(10);
        doc.text(`Total Revenue: Rs. ${summary.totalRevenue.toFixed(2)}`);
        doc.text(`Total Transactions: ${summary.totalTransactions}`);
        doc.text(`Average Value: Rs. ${summary.averageTransactionValue.toFixed(2)}`);
        doc.moveDown();

        doc.text(`Cash: Rs. ${summary.cashAmount.toFixed(2)}`);
        doc.text(`UPI: Rs. ${summary.upiAmount.toFixed(2)}`);
        doc.text(`Udhaar: Rs. ${summary.udhaarAmount.toFixed(2)}`);
        doc.moveDown();

        // Transactions Table Header
        const tableTop = doc.y + 10;
        doc.fontSize(10).font('Helvetica-Bold');

        const dateX = 50;
        const customerX = 150;
        const typeX = 300;
        const amountX = 450;

        doc.text('Date', dateX, tableTop);
        doc.text('Customer', customerX, tableTop);
        doc.text('Type', typeX, tableTop);
        doc.text('Amount', amountX, tableTop);

        doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke();

        // Transactions Rows
        let y = tableTop + 25;
        doc.font('Helvetica').fontSize(9);

        transactions.forEach((sale) => {
            if (y > 700) {
                doc.addPage();
                y = 50;
            }

            doc.text(sale.createdAt.toLocaleDateString(), dateX, y);
            doc.text(sale.customer?.name || 'Walk-in', customerX, y);
            doc.text(sale.paymentType, typeX, y);
            doc.text(`Rs. ${Number(sale.amount).toFixed(2)}`, amountX, y);

            y += 20;
        });

        doc.end();
    });
};

export const getReportData = async (shopId: string, timeframe: 'daily' | 'weekly' | 'monthly') => {
    // 1. Determine Date Range
    const now = new Date();
    const startDate = new Date();

    if (timeframe === 'weekly') {
        startDate.setDate(now.getDate() - 7);
    } else if (timeframe === 'monthly') {
        startDate.setMonth(now.getMonth() - 1);
    } else {
        // daily = last 24h or similar? Let's do last 30 days for daily view usually, 
        // but if timeframe is 'daily' maybe we want hourly? 
        // Let's stick to:
        // daily -> Today's hourly breakdown? Or just summary?
        // Let's interpret strictly: 
        // daily -> Last 7 days breakdown 
        // weekly -> Last 4 weeks breakdown
        // monthly -> Last 6 months breakdown
        // Actually, let's simplify for now:
        // Input `timeframe` determines the aggregation bucket, but we'll show a fixed range.
        // Let's follow the plan: "Revenue Trend Chart"

        // Let's do:
        // Dashboard always shows "Last 30 Days" trend for now to be safe and useful.
        startDate.setDate(now.getDate() - 30);
    }
    startDate.setHours(0, 0, 0, 0);

    const transactions = await prisma.sale.findMany({
        where: {
            shopId,
            createdAt: { gte: startDate }
        },
        orderBy: { createdAt: 'asc' }
    });

    // 2. Process Data for Charts

    // Revenue Trend (Daily)
    const revenueTrendMap = new Map<string, number>();
    // Initialize all days with 0
    for (let d = new Date(startDate); d <= now; d.setDate(d.getDate() + 1)) {
        revenueTrendMap.set(d.toISOString().split('T')[0], 0);
    }

    // Payment Mix
    const paymentMix = {
        CASH: 0,
        UPI: 0,
        UDHAAR: 0
    };

    let totalRevenue = 0;

    transactions.forEach(t => {
        const dateKey = t.createdAt.toISOString().split('T')[0];
        const amount = Number(t.amount);

        if (revenueTrendMap.has(dateKey)) {
            revenueTrendMap.set(dateKey, revenueTrendMap.get(dateKey)! + amount);
        }

        if (t.paymentType in paymentMix) {
            paymentMix[t.paymentType as keyof typeof paymentMix] += amount;
        }

        totalRevenue += amount;
    });

    const revenueTrend = Array.from(revenueTrendMap.entries()).map(([date, amount]) => ({
        date,
        amount
    }));

    const paymentMixData = Object.entries(paymentMix).map(([name, value]) => ({
        name,
        value
    })).filter(i => i.value > 0);

    return {
        summary: {
            totalRevenue,
            totalTransactions: transactions.length,
            averageValue: transactions.length ? totalRevenue / transactions.length : 0
        },
        revenueTrend,
        paymentMix: paymentMixData
    };
};
