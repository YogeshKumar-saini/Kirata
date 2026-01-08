"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateTransactionReceipt = exports.exportSalesToExcel = exports.exportSalesToCSV = exports.getCustomerBalance = exports.recordSale = exports.calculateCustomerBalance = void 0;
exports.getAllSales = getAllSales;
exports.getSalesSummary = getSalesSummary;
exports.getCustomerTransactions = getCustomerTransactions;
exports.recordPayment = recordPayment;
exports.updateTransaction = updateTransaction;
exports.bulkUpdateTransactions = bulkUpdateTransactions;
exports.deleteTransaction = deleteTransaction;
exports.deleteTransactions = deleteTransactions;
const database_1 = require("../../shared/database");
const logger_1 = require("../../shared/utils/logger");
const AnalyticsService = __importStar(require("../analytics/service"));
const XLSX = __importStar(require("xlsx"));
const ApiError_1 = require("../../shared/errors/ApiError");
const pdfkit_1 = __importDefault(require("pdfkit"));
/**
 * CENTRALIZED BALANCE CALCULATION
 * This is the single source of truth for a customer's outstanding balance.
 * Formula: Total Credit Given (UDHAAR sales) - Total Payments Received (CASH/UPI sales)
 */
const calculateCustomerBalance = async (shopId, customerId) => {
    // 1. Get total UDHAAR amount (Credit given)
    const udhaarResult = await database_1.prisma.sale.aggregate({
        where: {
            shopId,
            customerId,
            paymentType: 'UDHAAR'
        },
        _sum: {
            amount: true
        }
    });
    // 2. Get total Payment amount (Cash/UPI received)
    const paymentResult = await database_1.prisma.sale.aggregate({
        where: {
            shopId,
            customerId,
            paymentType: {
                in: ['CASH', 'UPI']
            }
        },
        _sum: {
            amount: true
        }
    });
    const totalCredit = Number(udhaarResult._sum.amount || 0);
    const totalPaid = Number(paymentResult._sum.amount || 0);
    return totalCredit - totalPaid;
};
exports.calculateCustomerBalance = calculateCustomerBalance;
// Start a new sale transaction
const recordSale = async (shopId, amount, paymentType, source, customerId, notes, bypassCreditLimit = false, profit = 0) => {
    // Check Credit Limit for UDHAAR transactions
    if (paymentType === 'UDHAAR' && customerId) {
        const customer = await database_1.prisma.customer.findUnique({
            where: { id: customerId },
            select: { creditLimit: true, name: true }
        });
        if (customer?.creditLimit) {
            const currentBalance = await (0, exports.calculateCustomerBalance)(shopId, customerId);
            const limit = Number(customer.creditLimit);
            const projectedBalance = currentBalance + Number(amount);
            if (projectedBalance > limit && !bypassCreditLimit) {
                throw new ApiError_1.ApiError(400, 'CREDIT_LIMIT_EXCEEDED', [{
                        message: `Credit limit exceeded for ${customer.name || 'customer'}. Limit: ₹${limit}, Current Balance: ₹${currentBalance}, New Balance: ₹${projectedBalance}`,
                        currentBalance,
                        creditLimit: limit,
                        projectedBalance,
                        exceededBy: projectedBalance - limit
                    }]);
            }
        }
    }
    const sale = await database_1.prisma.$transaction(async (tx) => {
        const sale = await tx.sale.create({
            data: {
                shopId,
                amount,
                paymentType,
                source,
                customerId,
                notes,
            },
        });
        if (paymentType === 'UDHAAR' && customerId) {
            await tx.udhaar.create({
                data: {
                    shopId,
                    customerId,
                    amount,
                    status: 'OPEN',
                    referenceSaleId: sale.saleId,
                },
            });
        }
        return sale;
    });
    // Update Analytics (Async)
    AnalyticsService.trackOrder(shopId, Number(amount), profit).catch(err => logger_1.logger.error(`Failed to update analytics for sale ${sale.saleId}:`, err));
    return sale;
};
exports.recordSale = recordSale;
const getCustomerBalance = async (shopId, customerId) => {
    return (0, exports.calculateCustomerBalance)(shopId, customerId);
};
exports.getCustomerBalance = getCustomerBalance;
// Get all sales for a shop with advanced filtering
async function getAllSales(shopId, limit = 50, filters) {
    const where = { shopId };
    // Apply filters
    if (filters?.paymentType) {
        where.paymentType = filters.paymentType;
    }
    if (filters?.customerId) {
        where.customerId = filters.customerId;
    }
    if (filters?.startDate || filters?.endDate) {
        where.createdAt = {};
        if (filters.startDate) {
            where.createdAt.gte = filters.startDate;
        }
        if (filters.endDate) {
            where.createdAt.lte = filters.endDate;
        }
    }
    if (filters?.minAmount || filters?.maxAmount) {
        where.amount = {};
        if (filters.minAmount) {
            where.amount.gte = filters.minAmount;
        }
        if (filters.maxAmount) {
            where.amount = { ...where.amount, lte: filters.maxAmount };
        }
    }
    if (filters?.ids && filters.ids.length > 0) {
        where.saleId = { in: filters.ids };
    }
    // Text search
    if (filters?.search) {
        const query = filters.search.trim();
        if (query) {
            where.OR = [
                { saleId: { contains: query, mode: 'insensitive' } },
                { customer: { name: { contains: query, mode: 'insensitive' } } },
                { customer: { phone: { contains: query, mode: 'insensitive' } } },
                { notes: { contains: query, mode: 'insensitive' } } // Now notes exist
            ];
        }
    }
    const queryArgs = {
        where,
        include: {
            customer: {
                select: {
                    id: true,
                    name: true,
                    phone: true,
                    uniqueId: true
                }
            }
        },
        orderBy: { createdAt: 'desc' },
        take: limit + 1, // Fetch one extra to determine if there's a next page
    };
    if (filters?.cursor) {
        queryArgs.cursor = { saleId: filters.cursor };
        queryArgs.skip = 1; // Skip the cursor itself
    }
    const sales = await database_1.prisma.sale.findMany(queryArgs);
    let nextCursor = undefined;
    if (sales.length > limit) {
        const nextItem = sales.pop(); // Remove the extra item
        nextCursor = nextItem?.saleId;
    }
    return {
        sales,
        nextCursor,
        hasMore: !!nextCursor
    };
}
// Get sales summary/analytics
async function getSalesSummary(shopId, filters) {
    const where = { shopId };
    if (filters?.startDate || filters?.endDate) {
        where.createdAt = {};
        if (filters.startDate) {
            where.createdAt.gte = filters.startDate;
        }
        if (filters.endDate) {
            where.createdAt.lte = filters.endDate;
        }
    }
    // Get all sales (Optimized: use aggregate where possible in future, for now fetching is okay for limited datasets)
    const sales = await database_1.prisma.sale.findMany({
        where,
        include: {
            customer: {
                select: {
                    id: true,
                    name: true,
                    phone: true
                }
            }
        }
    });
    // Calculate summary statistics
    const totalRevenue = sales
        .filter(s => s.paymentType === 'CASH' || s.paymentType === 'UPI')
        .reduce((sum, sale) => sum + Number(sale.amount), 0);
    const totalTransactions = sales.length;
    // Group by payment type
    const byPaymentType = sales.reduce((acc, sale) => {
        const type = sale.paymentType;
        if (!acc[type]) {
            acc[type] = { count: 0, amount: 0 };
        }
        acc[type].count += 1;
        acc[type].amount += Number(sale.amount);
        return acc;
    }, {});
    // Top customers
    const customerSales = sales.reduce((acc, sale) => {
        if (!sale.customerId)
            return acc;
        const customerId = sale.customerId;
        if (!acc[customerId]) {
            acc[customerId] = {
                customerId,
                customerName: sale.customer?.name || 'Unknown',
                customerPhone: sale.customer?.phone,
                count: 0,
                amount: 0
            };
        }
        acc[customerId].count += 1;
        acc[customerId].amount += Number(sale.amount);
        return acc;
    }, {});
    const topCustomers = Object.values(customerSales)
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 10);
    // Daily breakdown (last 7 days)
    const dailyBreakdown = {};
    sales.forEach(sale => {
        const date = new Date(sale.createdAt).toISOString().split('T')[0];
        if (!dailyBreakdown[date]) {
            dailyBreakdown[date] = { date, count: 0, amount: 0 };
        }
        dailyBreakdown[date].count += 1;
        dailyBreakdown[date].amount += Number(sale.amount);
    });
    const dailyData = Object.values(dailyBreakdown).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 7);
    return {
        totalRevenue,
        totalTransactions,
        averageTransactionValue: totalTransactions > 0 ? totalRevenue / totalTransactions : 0,
        byPaymentType,
        topCustomers,
        dailyBreakdown: dailyData,
        cashAmount: byPaymentType.CASH?.amount || 0,
        upiAmount: byPaymentType.UPI?.amount || 0,
        udhaarAmount: byPaymentType.UDHAAR?.amount || 0,
    };
}
// Get all transactions for a specific customer
async function getCustomerTransactions(shopId, customerId) {
    // Get all sales for this customer
    const sales = await database_1.prisma.sale.findMany({
        where: {
            shopId,
            customerId
        },
        orderBy: { createdAt: 'desc' },
        include: {
            customer: {
                select: {
                    id: true,
                    name: true,
                    phone: true,
                    uniqueId: true
                }
            }
        }
    });
    // Calculate totals using centralized logic
    const udhaarSales = sales.filter(s => s.paymentType === 'UDHAAR');
    const paymentSales = sales.filter(s => s.paymentType === 'CASH' || s.paymentType === 'UPI');
    const totalCredit = udhaarSales.reduce((sum, s) => sum + Number(s.amount), 0);
    const totalCash = paymentSales.reduce((sum, s) => sum + Number(s.amount), 0);
    // Use the centralized calculation to ensure consistency
    const outstandingBalance = await (0, exports.calculateCustomerBalance)(shopId, customerId);
    // Get customer info
    const customer = await database_1.prisma.customer.findUnique({
        where: { id: customerId },
        select: {
            id: true,
            name: true,
            phone: true,
            uniqueId: true,
            notes: true,
            creditLimit: true,
            tags: true
        }
    });
    // NEW: Fetch entries created BY the customer regarding THIS shop (Customer's view)
    let customerReportedEntries = [];
    if (customer && customer.phone) {
        const shopInfo = await database_1.prisma.shop.findUnique({
            where: { shopId },
            select: { phone: true }
        });
        if (shopInfo?.phone) {
            customerReportedEntries = await database_1.prisma.personalLedgerEntry.findMany({
                where: {
                    userId: customerId,
                    contactPhone: shopInfo.phone
                },
                orderBy: { createdAt: 'desc' }
            });
        }
    }
    return {
        customer,
        sales,
        customerReportedEntries,
        summary: {
            totalTransactions: sales.length,
            totalCredit,
            totalCash,
            totalAmount: totalCredit + totalCash,
            outstandingBalance
        }
    };
}
// NEW: Record payment against udhaar
async function recordPayment(shopId, customerId, amount, paymentMethod = 'CASH', notes) {
    // Validate balance before creating payment
    const currentBalance = await (0, exports.calculateCustomerBalance)(shopId, customerId);
    // Note: We used to validate that they owe money, but sometimes people pay in advance
    // or the "balance" might be calculated differently if we missed something.
    // Generally it's safer to allow receiving money, but good to log current balance.
    return database_1.prisma.$transaction(async (tx) => {
        // Record as a CASH/UPI sale (payment received)
        const sale = await tx.sale.create({
            data: {
                shopId,
                customerId,
                amount,
                paymentType: paymentMethod,
                source: 'MANUAL',
                notes
            }
        });
        // Update Udhaar status - find open ones and mark as paid if possible
        // This is "best effort" to keep Udhaar table status in sync, 
        // but the REAL balance is always calculated from Sales table sum.
        const openUdhaars = await tx.udhaar.findMany({
            where: { shopId, customerId, status: 'OPEN' },
            orderBy: { createdAt: 'asc' }
        });
        let remainingAmount = amount;
        const updatedUdhaars = [];
        for (const udhaar of openUdhaars) {
            if (remainingAmount <= 0)
                break;
            const udhaarAmount = Number(udhaar.amount);
            // Simple logic: if payment >= specific udhaar amount, close that udhaar.
            // This is imperfect for partial payments against specific bills, but works for "running balance" model.
            if (remainingAmount >= udhaarAmount) {
                await tx.udhaar.update({
                    where: { udhaarId: udhaar.udhaarId },
                    data: { status: 'PAID', closedAt: new Date() }
                });
                updatedUdhaars.push({ udhaarId: udhaar.udhaarId, status: 'PAID' });
                remainingAmount -= udhaarAmount;
            }
            else {
                // Partial payment against this specific udhaar isn't directly supported by 'status' enum
                // So we just leave it open. The global balance calculation handles the math.
                // Optionally we could split the udhaar record, but that gets complex.
                remainingAmount = 0;
            }
        }
        // Return new balance
        const newBalance = currentBalance - amount;
        return { sale, updatedUdhaars, currentBalance: newBalance };
    });
}
// NEW: Update transaction with validation
async function updateTransaction(saleId, shopId, updates) {
    // 1. Fetch original transaction
    const sale = await database_1.prisma.sale.findFirst({
        where: { saleId, shopId },
        include: { udhaarRef: true }
    });
    if (!sale) {
        throw new ApiError_1.ApiError(404, 'Transaction not found');
    }
    return database_1.prisma.$transaction(async (tx) => {
        const updateData = {
            notes: updates.notes,
            editedAt: new Date(),
            editedBy: updates.userId,
            editReason: updates.editReason
        };
        if (updates.tags) {
            updateData.tags = updates.tags;
        }
        // If changing core financial fields, perform validation
        if (updates.amount !== undefined || updates.paymentType !== undefined) {
            const newAmount = updates.amount !== undefined ? updates.amount : Number(sale.amount);
            const newPaymentType = updates.paymentType !== undefined ? updates.paymentType : sale.paymentType;
            // Scenario 1: Changing Payment Type UDHAAR -> CASH/UPI
            if (sale.paymentType === 'UDHAAR' && newPaymentType !== 'UDHAAR') {
                // Must delete the associated Udhaar record
                if (sale.udhaarRef) {
                    // Check if this Udhaar is already paid/closed
                    if (sale.udhaarRef.status === 'PAID') {
                        throw new ApiError_1.ApiError(400, 'Cannot change payment type of a settled Udhaar transaction. Please delete the payment transaction first.');
                    }
                    await tx.udhaar.delete({
                        where: { udhaarId: sale.udhaarRef.udhaarId }
                    });
                }
            }
            // Scenario 2: Changing Payment Type CASH/UPI -> UDHAAR
            if (sale.paymentType !== 'UDHAAR' && newPaymentType === 'UDHAAR') {
                if (!sale.customerId) {
                    throw new ApiError_1.ApiError(400, 'Cannot convert to Udhaar without a customer assigned.');
                }
                // Create new Udhaar record
                await tx.udhaar.create({
                    data: {
                        shopId,
                        customerId: sale.customerId,
                        amount: newAmount,
                        status: 'OPEN',
                        referenceSaleId: sale.saleId,
                    },
                });
            }
            // Scenario 3: Changing Amount on existing UDHAAR
            if (sale.paymentType === 'UDHAAR' && newPaymentType === 'UDHAAR' && updates.amount !== undefined) {
                if (sale.udhaarRef) {
                    if (sale.udhaarRef.status === 'PAID') {
                        throw new ApiError_1.ApiError(400, 'Cannot modify amount of a settled Udhaar transaction.');
                    }
                    await tx.udhaar.update({
                        where: { udhaarId: sale.udhaarRef.udhaarId },
                        data: { amount: newAmount }
                    });
                }
            }
            updateData.amount = newAmount;
            updateData.paymentType = newPaymentType;
        }
        // Apply updates
        const updatedSale = await tx.sale.update({
            where: { saleId },
            data: updateData
        });
        return updatedSale;
    });
}
// NEW: Bulk update transactions
async function bulkUpdateTransactions(shopId, updates) {
    // Perform updates sequentially strictly within a transaction to ensure atomicity
    return database_1.prisma.$transaction(async (tx) => {
        let successCount = 0;
        const errors = [];
        for (const saleId of updates.saleIds) {
            try {
                // We reuse the single update logic to ensure continuous validation
                // Note: We're calling the exported function which starts its own transaction.
                // However, Prisma nested transactions (savepoints) work, or we can just call the logic.
                // BUT, calling `updateTransaction` which does `prisma.$transaction` inside `prisma.$transaction`
                // is supported in recent Prisma versions.
                // Construct input
                const input = {
                    userId: updates.userId,
                    editReason: 'Bulk Edit'
                };
                if (updates.paymentType)
                    input.paymentType = updates.paymentType;
                if (updates.tags)
                    input.tags = updates.tags;
                await updateTransaction(saleId, shopId, input);
                successCount++;
            }
            catch (err) {
                errors.push({ saleId, error: err.message });
            }
        }
        // If any failed, we might want to revert ALL? 
        // For bulk edit, usually "all or nothing" is expected.
        if (errors.length > 0) {
            throw new ApiError_1.ApiError(400, `Bulk update failed for some items. No changes applied. Errors: ${errors.map(e => e.error).join(', ')}`);
        }
        // Audit Log for the bulk action
        await tx.auditLog.create({
            data: {
                userId: updates.userId,
                action: 'BULK_UPDATE_TRANSACTION',
                details: {
                    shopId,
                    count: successCount,
                    saleIds: updates.saleIds,
                    updates: {
                        paymentType: updates.paymentType,
                        tags: updates.tags
                    }
                }
            }
        });
        return { count: successCount };
    });
}
// NEW: Delete transaction (hard delete with cleanup)
async function deleteTransaction(saleId, shopId, performedBy) {
    const sale = await database_1.prisma.sale.findFirst({
        where: { saleId, shopId },
        include: { udhaarRef: true }
    });
    if (!sale) {
        throw new ApiError_1.ApiError(404, 'Transaction not found');
    }
    return database_1.prisma.$transaction(async (tx) => {
        // If it's an Udhaar transaction, check status
        if (sale.udhaarRef) {
            if (sale.udhaarRef.status === 'PAID') {
                // If it's marked paid in Udhaar table, we should warn or block. 
                // But since we use global balance calc, it's safer to just warn.
                // For now, allow delete but log it.
            }
            await tx.udhaar.delete({
                where: { udhaarId: sale.udhaarRef.udhaarId }
            });
        }
        // Delete the sale
        await tx.sale.delete({
            where: { saleId }
        });
        // Audit Log
        await tx.auditLog.create({
            data: {
                userId: performedBy,
                action: 'DELETE_TRANSACTION',
                details: {
                    shopId,
                    saleId,
                    amount: sale.amount,
                    type: sale.paymentType,
                    customer: sale.customerId
                }
            }
        });
        return { success: true };
    });
}
// NEW: Delete multiple transactions
async function deleteTransactions(saleIds, shopId, performedBy) {
    if (!saleIds.length)
        return { count: 0 };
    return database_1.prisma.$transaction(async (tx) => {
        const sales = await tx.sale.findMany({
            where: {
                saleId: { in: saleIds },
                shopId
            },
            include: { udhaarRef: true }
        });
        if (sales.length === 0)
            return { count: 0 };
        // Collect udhaar IDs to delete
        const udhaarIdsToDelete = sales
            .filter(s => s.udhaarRef)
            .map(s => s.udhaarRef.udhaarId);
        if (udhaarIdsToDelete.length > 0) {
            await tx.udhaar.deleteMany({
                where: { udhaarId: { in: udhaarIdsToDelete } }
            });
        }
        // Delete sales
        const result = await tx.sale.deleteMany({
            where: {
                saleId: { in: saleIds },
                shopId
            }
        });
        // Audit Log
        await tx.auditLog.create({
            data: {
                userId: performedBy,
                action: 'BULK_DELETE_TRANSACTION',
                details: {
                    shopId,
                    count: result.count,
                    saleIds
                }
            }
        });
        return { count: result.count };
    });
}
// NEW: Export sales to CSV format
const exportSalesToCSV = async (shopId, filters) => {
    // Reuse getAllSales logic but increase limit
    const { sales } = await getAllSales(shopId, 10000, filters);
    const headers = ['Date', 'Customer Name', 'Customer Phone', 'Payment Type', 'Source', 'Amount', 'Notes'];
    const rows = sales.map((sale) => [
        sale.createdAt.toISOString().split('T')[0],
        sale.customer?.name || 'Unknown',
        sale.customer?.phone || '-',
        sale.paymentType,
        sale.source,
        sale.amount.toString(),
        sale.notes || ''
    ]);
    // Calculate totals
    const totalAmount = sales.reduce((sum, s) => sum + Number(s.amount), 0);
    const totalUdhaar = sales.filter(s => s.paymentType === 'UDHAAR').reduce((sum, s) => sum + Number(s.amount), 0);
    const totalRecd = sales.filter(s => ['CASH', 'UPI'].includes(s.paymentType)).reduce((sum, s) => sum + Number(s.amount), 0);
    const footer = [
        [],
        ['TOTALS', '', '', '', '', totalAmount.toString()],
        ['Total Credit Given (Udhaar)', '', '', '', '', totalUdhaar.toString()],
        ['Total Payments Received', '', '', '', '', totalRecd.toString()]
    ];
    const csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(',')),
        ...footer.map(row => row.join(','))
    ].join('\n');
    return csvContent;
};
exports.exportSalesToCSV = exportSalesToCSV;
const exportSalesToExcel = async (shopId, filters) => {
    // If IDs are provided, only export those. Otherwise use filters.
    if (filters.ids && filters.ids.length > 0) {
        // Clear other filters if specific IDs are requested
        filters = { ids: filters.ids };
    }
    // Reuse getAllSales logic but increase limit
    const { sales } = await getAllSales(shopId, 10000, filters);
    // Format data for Excel
    const data = sales.map((sale) => ({
        'Date': sale.createdAt.toISOString().split('T')[0],
        'Time': sale.createdAt.toLocaleTimeString(),
        'Customer Name': sale.customer?.name || 'Walk-in Customer',
        'Phone Number': sale.customer?.phone || '-',
        'Payment Type': sale.paymentType,
        'Source': sale.source,
        'Amount': Number(sale.amount),
        'Notes': sale.notes || '',
        'Transaction ID': sale.saleId
    }));
    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(data);
    // Add summary at bottom
    // ... logic for summary row (simplified for brevity)
    // Set column widths
    const colWidths = [
        { wch: 12 }, // Date
        { wch: 10 }, // Time
        { wch: 25 }, // Customer Name
        { wch: 15 }, // Phone
        { wch: 12 }, // Payment Type
        { wch: 10 }, // Source
        { wch: 10 }, // Amount
        { wch: 30 }, // Notes
        { wch: 36 } // ID
    ];
    ws['!cols'] = colWidths;
    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Sales Ledger');
    // Generate buffer
    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    return buffer;
};
exports.exportSalesToExcel = exportSalesToExcel;
// Generate a PDF receipt for a transaction
const generateTransactionReceipt = async (shopId, transactionId) => {
    const sale = await database_1.prisma.sale.findUnique({
        where: { saleId: transactionId, shopId },
        select: {
            saleId: true,
            amount: true,
            paymentType: true,
            source: true,
            createdAt: true,
            notes: true,
            shop: true,
            customer: true
        }
    });
    if (!sale) {
        throw new ApiError_1.ApiError(404, 'Transaction not found');
    }
    return new Promise((resolve, reject) => {
        const doc = new pdfkit_1.default({ margin: 50 });
        const buffers = [];
        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {
            const pdfData = Buffer.concat(buffers);
            resolve(pdfData);
        });
        doc.on('error', reject);
        // Header
        const address = [sale.shop.addressLine1, sale.shop.addressLine2, sale.shop.city, sale.shop.state, sale.shop.pincode]
            .filter(Boolean)
            .join(', ');
        doc.fontSize(20).text(sale.shop.name || 'Shop Receipt', { align: 'center' });
        doc.fontSize(10).text(address, { align: 'center' });
        doc.moveDown();
        // Transaction Details Box
        const startY = doc.y;
        doc.rect(50, startY, 500, 150).stroke();
        doc.fontSize(12).text('Transaction Receipt', 70, startY + 20);
        doc.fontSize(10);
        const leftColX = 70;
        const rightColX = 300;
        let currentY = startY + 50;
        const lineHeight = 20;
        // Date
        doc.text('Date:', leftColX, currentY);
        doc.text(sale.createdAt.toLocaleDateString() + ' ' + sale.createdAt.toLocaleTimeString(), leftColX + 80, currentY);
        // Transaction ID
        doc.text('Receipt #:', rightColX, currentY);
        doc.text(sale.saleId.substring(0, 8).toUpperCase(), rightColX + 80, currentY);
        currentY += lineHeight;
        // Customer
        if (sale.customer) {
            doc.text('Customer:', leftColX, currentY);
            doc.text(`${sale.customer.name || 'Unknown'} (${sale.customer.phone || '-'})`, leftColX + 80, currentY);
            currentY += lineHeight;
        }
        // Notes
        if (sale.notes) {
            doc.text('Notes:', leftColX, currentY);
            doc.text(sale.notes, leftColX + 80, currentY);
            currentY += lineHeight;
        }
        // Divider
        currentY = startY + 110;
        doc.moveTo(50, currentY).lineTo(550, currentY).stroke();
        // Amount
        currentY += 15;
        doc.fontSize(14).text('Total Amount:', leftColX, currentY);
        doc.fontSize(14).font('Helvetica-Bold').text(`₹${Number(sale.amount).toFixed(2)}`, rightColX, currentY);
        doc.fontSize(10).font('Helvetica').text(`(${sale.paymentType})`, rightColX + 100, currentY + 3);
        // Footer
        doc.fontSize(10).text('Thank you for your business!', 50, 700, { align: 'center', width: 500 });
        doc.end();
    });
};
exports.generateTransactionReceipt = generateTransactionReceipt;
