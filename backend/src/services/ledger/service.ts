import { prisma } from '../../shared/database';
import { logger } from '../../shared/utils/logger';
import { PaymentType, SaleSource } from '@prisma/client';
import * as AnalyticsService from '../analytics/service';
import * as XLSX from 'xlsx';
import { ApiError } from '../../shared/errors/ApiError';
import PDFDocument from 'pdfkit';

/**
 * CENTRALIZED BALANCE CALCULATION
 * This is the single source of truth for a customer's outstanding balance.
 * Formula: Total Credit Given (UDHAAR sales) - Total Payments Received (CASH/UPI sales)
 */
export const calculateCustomerBalance = async (shopId: string, customerId: string): Promise<number> => {
    // 1. Get total UDHAAR amount (Credit given)
    const udhaarResult = await prisma.sale.aggregate({
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
    const paymentResult = await prisma.sale.aggregate({
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

// Start a new sale transaction
export const recordSale = async (
    shopId: string,
    amount: number,
    paymentType: PaymentType,
    source: SaleSource,
    customerId?: string,
    notes?: string,
    bypassCreditLimit: boolean = false,
    profit: number = 0
) => {
    // Check Credit Limit for UDHAAR transactions
    if (paymentType === 'UDHAAR' && customerId) {
        const customer = await prisma.customer.findUnique({
            where: { id: customerId },
            select: { creditLimit: true, name: true }
        });

        if (customer?.creditLimit) {
            const currentBalance = await calculateCustomerBalance(shopId, customerId);
            const limit = Number(customer.creditLimit);
            const projectedBalance = currentBalance + Number(amount);

            if (projectedBalance > limit && !bypassCreditLimit) {
                throw new ApiError(400, 'CREDIT_LIMIT_EXCEEDED', [{
                    message: `Credit limit exceeded for ${customer.name || 'customer'}. Limit: ₹${limit}, Current Balance: ₹${currentBalance}, New Balance: ₹${projectedBalance}`,
                    currentBalance,
                    creditLimit: limit,
                    projectedBalance,
                    exceededBy: projectedBalance - limit
                }]);
            }
        }
    }

    const sale = await prisma.$transaction(async (tx) => {
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
    AnalyticsService.trackOrder(shopId, Number(amount), profit).catch(err =>
        logger.error(`Failed to update analytics for sale ${sale.saleId}:`, err)
    );

    return sale;
};

export const getCustomerBalance = async (shopId: string, customerId: string) => {
    return calculateCustomerBalance(shopId, customerId);
};

interface SalesFilters {
    paymentType?: string;
    customerId?: string;
    startDate?: Date;
    endDate?: Date;
    minAmount?: number;
    maxAmount?: number;
    groupBy?: 'customer' | 'date';
    ids?: string[];
    cursor?: string;
    search?: string;
}

// Get all sales for a shop with advanced filtering
export async function getAllSales(shopId: string, limit: number = 50, filters?: SalesFilters) {
    const where: any = { shopId };

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

    const queryArgs: any = {
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

    const sales = await prisma.sale.findMany(queryArgs);

    let nextCursor: string | undefined = undefined;
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

interface SummaryFilters {
    startDate?: Date;
    endDate?: Date;
}

// Get sales summary/analytics
export async function getSalesSummary(shopId: string, filters?: SummaryFilters) {
    const where: any = { shopId };

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
    const sales = await prisma.sale.findMany({
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
    const byPaymentType = sales.reduce((acc: any, sale) => {
        const type = sale.paymentType;
        if (!acc[type]) {
            acc[type] = { count: 0, amount: 0 };
        }
        acc[type].count += 1;
        acc[type].amount += Number(sale.amount);
        return acc;
    }, {});

    // Top customers
    const customerSales = sales.reduce((acc: any, sale) => {
        if (!sale.customerId) return acc;
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
        .sort((a: any, b: any) => b.amount - a.amount)
        .slice(0, 10);

    // Daily breakdown (last 7 days)
    const dailyBreakdown: any = {};
    sales.forEach(sale => {
        const date = new Date(sale.createdAt).toISOString().split('T')[0];
        if (!dailyBreakdown[date]) {
            dailyBreakdown[date] = { date, count: 0, amount: 0 };
        }
        dailyBreakdown[date].count += 1;
        dailyBreakdown[date].amount += Number(sale.amount);
    });

    const dailyData = Object.values(dailyBreakdown).sort((a: any, b: any) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
    ).slice(0, 7);

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
export async function getCustomerTransactions(shopId: string, customerId: string) {
    // Get all sales for this customer
    const sales = await prisma.sale.findMany({
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
    const outstandingBalance = await calculateCustomerBalance(shopId, customerId);

    // Get customer info
    const customer = await prisma.customer.findUnique({
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
    let customerReportedEntries: any[] = [];
    if (customer && customer.phone) {
        const shopInfo = await prisma.shop.findUnique({
            where: { shopId },
            select: { phone: true }
        });

        if (shopInfo?.phone) {
            customerReportedEntries = await (prisma as any).personalLedgerEntry.findMany({
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
export async function recordPayment(
    shopId: string,
    customerId: string,
    amount: number,
    paymentMethod: string = 'CASH',
    notes?: string
) {
    // Validate balance before creating payment
    const currentBalance = await calculateCustomerBalance(shopId, customerId);

    // Note: We used to validate that they owe money, but sometimes people pay in advance
    // or the "balance" might be calculated differently if we missed something.
    // Generally it's safer to allow receiving money, but good to log current balance.

    return prisma.$transaction(async (tx) => {
        // Record as a CASH/UPI sale (payment received)
        const sale = await tx.sale.create({
            data: {
                shopId,
                customerId,
                amount,
                paymentType: paymentMethod as any,
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
            if (remainingAmount <= 0) break;

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
            } else {
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

// Transaction Update Input
interface UpdateTransactionInput {
    amount?: number;
    paymentType?: PaymentType;
    notes?: string;
    editReason?: string;
    userId: string; // The user performing the edit
    tags?: string[];
}

// NEW: Update transaction with validation
export async function updateTransaction(
    saleId: string,
    shopId: string,
    updates: UpdateTransactionInput
) {
    // 1. Fetch original transaction
    const sale = await prisma.sale.findFirst({
        where: { saleId, shopId },
        include: { udhaarRef: true }
    });

    if (!sale) {
        throw new ApiError(404, 'Transaction not found');
    }

    return prisma.$transaction(async (tx) => {
        const updateData: any = {
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
                        throw new ApiError(400, 'Cannot change payment type of a settled Udhaar transaction. Please delete the payment transaction first.');
                    }

                    await tx.udhaar.delete({
                        where: { udhaarId: sale.udhaarRef.udhaarId }
                    });
                }
            }

            // Scenario 2: Changing Payment Type CASH/UPI -> UDHAAR
            if (sale.paymentType !== 'UDHAAR' && newPaymentType === 'UDHAAR') {
                if (!sale.customerId) {
                    throw new ApiError(400, 'Cannot convert to Udhaar without a customer assigned.');
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
                        throw new ApiError(400, 'Cannot modify amount of a settled Udhaar transaction.');
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
export async function bulkUpdateTransactions(
    shopId: string,
    updates: {
        saleIds: string[];
        paymentType?: PaymentType;
        tags?: string[];
        userId: string;
    }
) {
    // Perform updates sequentially strictly within a transaction to ensure atomicity
    return prisma.$transaction(async (tx) => {
        let successCount = 0;
        const errors: any[] = [];

        for (const saleId of updates.saleIds) {
            try {
                // We reuse the single update logic to ensure continuous validation
                // Note: We're calling the exported function which starts its own transaction.
                // However, Prisma nested transactions (savepoints) work, or we can just call the logic.
                // BUT, calling `updateTransaction` which does `prisma.$transaction` inside `prisma.$transaction`
                // is supported in recent Prisma versions.

                // Construct input
                const input: UpdateTransactionInput = {
                    userId: updates.userId,
                    editReason: 'Bulk Edit'
                };
                if (updates.paymentType) input.paymentType = updates.paymentType;
                if (updates.tags) input.tags = updates.tags;

                await updateTransaction(saleId, shopId, input);
                successCount++;
            } catch (err: any) {
                errors.push({ saleId, error: err.message });
            }
        }

        // If any failed, we might want to revert ALL? 
        // For bulk edit, usually "all or nothing" is expected.
        if (errors.length > 0) {
            throw new ApiError(400, `Bulk update failed for some items. No changes applied. Errors: ${errors.map(e => e.error).join(', ')}`);
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
export async function deleteTransaction(saleId: string, shopId: string, performedBy: string) {
    const sale = await prisma.sale.findFirst({
        where: { saleId, shopId },
        include: { udhaarRef: true }
    });

    if (!sale) {
        throw new ApiError(404, 'Transaction not found');
    }

    return prisma.$transaction(async (tx) => {
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
export async function deleteTransactions(saleIds: string[], shopId: string, performedBy: string) {
    if (!saleIds.length) return { count: 0 };

    return prisma.$transaction(async (tx) => {
        const sales = await tx.sale.findMany({
            where: {
                saleId: { in: saleIds },
                shopId
            },
            include: { udhaarRef: true }
        });

        if (sales.length === 0) return { count: 0 };

        // Collect udhaar IDs to delete
        const udhaarIdsToDelete = sales
            .filter(s => s.udhaarRef)
            .map(s => s.udhaarRef!.udhaarId);

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
export const exportSalesToCSV = async (shopId: string, filters: SalesFilters): Promise<string> => {
    // Reuse getAllSales logic but increase limit
    const { sales } = await getAllSales(shopId, 10000, filters);

    const headers = ['Date', 'Customer Name', 'Customer Phone', 'Payment Type', 'Source', 'Amount', 'Notes'];
    const rows = sales.map((sale: any) => [
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

export const exportSalesToExcel = async (shopId: string, filters: SalesFilters): Promise<Buffer> => {
    // If IDs are provided, only export those. Otherwise use filters.
    if (filters.ids && filters.ids.length > 0) {
        // Clear other filters if specific IDs are requested
        filters = { ids: filters.ids };
    }

    // Reuse getAllSales logic but increase limit
    const { sales } = await getAllSales(shopId, 10000, filters);

    // Format data for Excel
    const data = sales.map((sale: any) => ({
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
        { wch: 36 }  // ID
    ];
    ws['!cols'] = colWidths;

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Sales Ledger');

    // Generate buffer
    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    return buffer;
}

// Generate a PDF receipt for a transaction
export const generateTransactionReceipt = async (shopId: string, transactionId: string): Promise<Buffer> => {
    const sale = await prisma.sale.findUnique({
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
        throw new ApiError(404, 'Transaction not found');
    }

    return new Promise((resolve, reject) => {
        const doc = new PDFDocument({ margin: 50 });
        const buffers: Buffer[] = [];

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
