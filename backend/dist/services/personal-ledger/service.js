"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLedgerStats = exports.generateStatementPDF = exports.getContactDetails = exports.getContacts = exports.addEntry = void 0;
const database_1 = require("../../shared/database");
const pdfkit_1 = __importDefault(require("pdfkit"));
const date_fns_1 = require("date-fns");
const addEntry = async (data) => {
    // 1. Try to find a linked entity (Shop or Customer)
    let linkedShopId;
    let linkedCustomerId;
    // Check if contact is a Shop
    const shop = await database_1.prisma.shop.findFirst({
        where: { phone: data.contactPhone }
    });
    if (shop) {
        linkedShopId = shop.shopId;
    }
    else {
        // Check if contact is a Customer
        const customer = await database_1.prisma.customer.findUnique({
            where: { phone: data.contactPhone }
        });
        if (customer) {
            linkedCustomerId = customer.id;
        }
    }
    return database_1.prisma.personalLedgerEntry.create({
        data: {
            userId: data.userId,
            contactPhone: data.contactPhone,
            contactName: data.contactName,
            amount: data.amount,
            type: data.type,
            notes: data.notes,
            linkedShopId,
            linkedCustomerId
        }
    });
};
exports.addEntry = addEntry;
const getContacts = async (userId) => {
    // Group entries by contactPhone
    const entries = await database_1.prisma.personalLedgerEntry.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' }
    });
    const contacts = {};
    entries.forEach((entry) => {
        if (!contacts[entry.contactPhone]) {
            contacts[entry.contactPhone] = {
                contactPhone: entry.contactPhone,
                contactName: entry.contactName,
                totalGave: 0,
                totalTook: 0,
                lastTransaction: entry.createdAt,
                isLinked: !!(entry.linkedShopId || entry.linkedCustomerId)
            };
        }
        if (entry.type === 'GAVE') {
            contacts[entry.contactPhone].totalGave += Number(entry.amount);
        }
        else {
            contacts[entry.contactPhone].totalTook += Number(entry.amount);
        }
    });
    return Object.values(contacts).map(c => ({
        ...c,
        balance: c.totalGave - c.totalTook
    }));
};
exports.getContacts = getContacts;
const getContactDetails = async (userId, contactPhone) => {
    // 1. Get current user's personal records
    const myEntries = await database_1.prisma.personalLedgerEntry.findMany({
        where: { userId, contactPhone },
        orderBy: { createdAt: 'desc' }
    });
    // 2. Identify linked entity to fetch "Their Version"
    let teammateRecords = [];
    let teammateInfo = null;
    // Check if linked to a shop
    const shop = await database_1.prisma.shop.findFirst({
        where: {
            OR: [
                { phone: contactPhone },
                { phone: contactPhone.slice(-10) }, // Try without country code if possible
                { phone: "+91" + contactPhone.slice(-10) }
            ]
        },
        select: { shopId: true, name: true, city: true }
    });
    if (shop) {
        teammateInfo = { type: 'SHOP', ...shop };
        // Fetch sales and payments recorded by this shop for THIS guest customer
        // We need the shop's customer record for this user
        const customerAcct = await database_1.prisma.customer.findUnique({
            where: { id: userId },
            select: { phone: true }
        });
        if (customerAcct) {
            // Find the shop's view of this customer
            // Actually, the current user IS a customer. If their ID is in a Sale record for this shop.
            teammateRecords = await database_1.prisma.sale.findMany({
                where: { shopId: shop.shopId, customerId: userId },
                orderBy: { createdAt: 'desc' }
            });
        }
    }
    else {
        // Check if linked to another customer
        const otherCustomer = await database_1.prisma.customer.findFirst({
            where: {
                OR: [
                    { phone: contactPhone },
                    { phone: contactPhone.slice(-10) },
                    { phone: "+91" + contactPhone.slice(-10) }
                ]
            },
            select: { id: true, name: true, phone: true }
        });
        if (otherCustomer) {
            teammateInfo = { type: 'CUSTOMER', ...otherCustomer };
            // Fetch records created BY the other customer for ME
            const me = await database_1.prisma.customer.findUnique({ where: { id: userId }, select: { phone: true } });
            if (me && me.phone) {
                const myPhone = me.phone;
                const myPhoneRaw = myPhone.replace('+91', '').slice(-10);
                teammateRecords = await database_1.prisma.personalLedgerEntry.findMany({
                    where: {
                        userId: otherCustomer.id,
                        OR: [
                            { contactPhone: myPhone },
                            { contactPhone: myPhoneRaw },
                            { contactPhone: `+91${myPhoneRaw}` }
                        ]
                    },
                    orderBy: { createdAt: 'desc' }
                });
            }
        }
    }
    // Recalculate 'me' stats
    const totalGave = myEntries.reduce((acc, e) => e.type === 'GAVE' ? acc + Number(e.amount) : acc, 0);
    const totalTook = myEntries.reduce((acc, e) => e.type === 'TOOK' ? acc + Number(e.amount) : acc, 0);
    return {
        myEntries,
        myStats: {
            totalGave,
            totalTook,
            balance: totalGave - totalTook // +ve means I need to take due to me giving more
        },
        teammateInfo,
        teammateRecords
    };
};
exports.getContactDetails = getContactDetails;
const generateStatementPDF = async (userId, contactPhone) => {
    const details = await (0, exports.getContactDetails)(userId, contactPhone);
    const myEntries = details.myEntries;
    // Calculate totals
    const totalGave = myEntries.reduce((acc, e) => e.type === 'GAVE' ? acc + Number(e.amount) : acc, 0);
    const totalTook = myEntries.reduce((acc, e) => e.type === 'TOOK' ? acc + Number(e.amount) : acc, 0);
    const balance = totalGave - totalTook;
    const doc = new pdfkit_1.default({ margin: 50 });
    const buffer = [];
    doc.on('data', buffer.push.bind(buffer));
    // Check if Promise is returned and handle accordingly
    const promise = new Promise((resolve) => {
        doc.on('end', () => {
            resolve(Buffer.concat(buffer));
        });
    });
    // --- Header ---
    doc.fontSize(20).text('Personal Ledger Statement', { align: 'center' });
    doc.moveDown();
    doc.fontSize(10).text(`Generated on: ${(0, date_fns_1.format)(new Date(), 'dd MMM yyyy HH:mm')}`, { align: 'right' });
    doc.moveDown();
    // --- Summary ---
    doc.fontSize(12).font('Helvetica-Bold').text('Contact Details:');
    doc.font('Helvetica').text(`Name: ${details.myEntries[0]?.contactName || 'Unknown'}`);
    doc.text(`Phone: ${contactPhone}`);
    doc.moveDown();
    doc.font('Helvetica-Bold').text('Statement Summary:');
    doc.font('Helvetica');
    doc.text(`Total You Gave: Rs. ${totalGave.toFixed(2)}`);
    doc.text(`Total You Took: Rs. ${totalTook.toFixed(2)}`);
    doc.text(`Net Balance: Rs. ${Math.abs(balance).toFixed(2)} ${balance > 0 ? '(You will Take)' : balance < 0 ? '(You will Give)' : '(Settled)'}`);
    doc.moveDown();
    // --- Transactions Table ---
    const tableTop = 250;
    const dateX = 50;
    const typeX = 150;
    const notesX = 220;
    const amountX = 450;
    doc.font('Helvetica-Bold');
    doc.text('Date', dateX, tableTop);
    doc.text('Type', typeX, tableTop);
    doc.text('Notes', notesX, tableTop);
    doc.text('Amount', amountX, tableTop, { align: 'right' });
    doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke();
    let y = tableTop + 25;
    doc.font('Helvetica');
    myEntries.forEach((entry) => {
        if (y > 700) {
            doc.addPage();
            y = 50;
        }
        const date = (0, date_fns_1.format)(new Date(entry.createdAt), 'dd MMM yyyy');
        const typeLabel = entry.type === 'GAVE' ? 'You Gave' : 'You Took';
        const color = entry.type === 'GAVE' ? 'red' : 'green';
        doc.fillColor('black').text(date, dateX, y);
        doc.fillColor(color).text(typeLabel, typeX, y);
        doc.fillColor('black').text(entry.notes || '-', notesX, y, { width: 200 });
        doc.text(`Rs. ${Number(entry.amount).toFixed(2)}`, amountX, y, { align: 'right' });
        y += 20;
    });
    doc.end();
    return promise;
};
exports.generateStatementPDF = generateStatementPDF;
const getLedgerStats = async (userId) => {
    // 1. Get entries for last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1); // Start of the month
    sixMonthsAgo.setHours(0, 0, 0, 0);
    // Get stats PRIOR to 6 months for starting balance
    const startStats = await database_1.prisma.personalLedgerEntry.groupBy({
        by: ['type'],
        where: { userId, createdAt: { lt: sixMonthsAgo } },
        _sum: { amount: true }
    });
    let currentBalance = 0;
    startStats.forEach((stat) => {
        if (stat.type === 'GAVE')
            currentBalance += Number(stat._sum.amount || 0);
        else
            currentBalance -= Number(stat._sum.amount || 0);
    });
    const entries = await database_1.prisma.personalLedgerEntry.findMany({
        where: {
            userId,
            createdAt: { gte: sixMonthsAgo }
        },
        orderBy: { createdAt: 'asc' }
    });
    // 2. Process Monthly Data and Balance History
    const monthlyData = {};
    const balanceHistory = [];
    // Initialize months
    const today = new Date();
    for (let i = 0; i < 6; i++) {
        const d = new Date(sixMonthsAgo);
        d.setMonth(d.getMonth() + i);
        if (d > today)
            break;
        const key = (0, date_fns_1.format)(d, 'MMM yyyy');
        monthlyData[key] = { month: key, gave: 0, took: 0 };
    }
    // Capture starting balance point
    balanceHistory.push({
        date: (0, date_fns_1.format)(sixMonthsAgo, 'yyyy-MM-dd'),
        balance: currentBalance
    });
    entries.forEach((e) => {
        const key = (0, date_fns_1.format)(new Date(e.createdAt), 'MMM yyyy');
        // Monthly stats
        if (monthlyData[key]) {
            if (e.type === 'GAVE')
                monthlyData[key].gave += Number(e.amount);
            else
                monthlyData[key].took += Number(e.amount);
        }
        // If not in monthlyData (e.g. slight date diff), ignore or add? 
        // Our init loop handles it mostly.
        // Balance history update
        if (e.type === 'GAVE')
            currentBalance += Number(e.amount);
        else
            currentBalance -= Number(e.amount);
        balanceHistory.push({
            date: (0, date_fns_1.format)(new Date(e.createdAt), 'yyyy-MM-dd'),
            balance: currentBalance
        });
    });
    // 3. Top Contacts Lists
    const allContacts = await (0, exports.getContacts)(userId);
    const topBorrowers = [...allContacts]
        .filter(c => c.balance > 0)
        .sort((a, b) => b.balance - a.balance)
        .slice(0, 5);
    const topLenders = [...allContacts]
        .filter(c => c.balance < 0)
        .sort((a, b) => a.balance - b.balance) // Most negative first
        .slice(0, 5);
    return {
        monthlyChart: Object.values(monthlyData),
        balanceHistory,
        topBorrowers,
        topLenders,
        insight: {
            highestToTake: topBorrowers[0] || null,
            highestToGive: topLenders[0] || null,
            totalContacts: allContacts.length,
            activeDebts: allContacts.filter(c => c.balance !== 0).length
        }
    };
};
exports.getLedgerStats = getLedgerStats;
