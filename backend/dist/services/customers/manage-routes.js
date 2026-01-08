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
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const middleware_1 = require("../../auth/middleware");
const asyncHandler_1 = require("../../shared/middlewares/asyncHandler");
const auth_middleware_1 = require("../../shared/middlewares/auth.middleware");
const ApiError_1 = require("../../shared/errors/ApiError");
const ShopService = __importStar(require("../shops/service"));
const database_1 = require("../../shared/database");
const router = (0, express_1.Router)();
router.use((0, middleware_1.authMiddleware)(['SHOPKEEPER']));
router.use(auth_middleware_1.requireShop);
// Get all customers for shop
router.get('/', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const shopId = req.shopId;
    const { search, tag, page = '1', limit = '20' } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;
    // Build where clause
    const where = {
        OR: [
            { orders: { some: { shopId } } },
            { udhaarRecords: { some: { shopId } } },
            { sales: { some: { shopId } } }
        ]
    };
    // Add search filter
    if (search) {
        where.AND = [
            {
                OR: [
                    { name: { contains: search, mode: 'insensitive' } },
                    { phone: { contains: search } },
                    { email: { contains: search, mode: 'insensitive' } }
                ]
            }
        ];
    }
    // Add tag filter
    if (tag) {
        if (!where.AND)
            where.AND = [];
        where.AND.push({ tags: { has: tag } });
    }
    // Get total count
    const total = await database_1.prisma.customer.count({ where });
    // Get customers with aggregated data
    const customers = await database_1.prisma.customer.findMany({
        where,
        include: {
            _count: {
                select: {
                    orders: { where: { shopId } },
                    udhaarRecords: { where: { shopId, status: 'OPEN' } }
                }
            },
            udhaarRecords: {
                where: { shopId, status: 'OPEN' },
                select: { amount: true }
            }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum
    });
    // Calculate balance for each customer
    const customersWithBalance = customers.map(customer => {
        const balance = customer.udhaarRecords.reduce((sum, record) => sum + Number(record.amount), 0);
        const { udhaarRecords, ...customerData } = customer;
        return {
            ...customerData,
            balance
        };
    });
    res.json({
        customers: customersWithBalance,
        pagination: {
            total,
            page: pageNum,
            limit: limitNum,
            totalPages: Math.ceil(total / limitNum)
        }
    });
}));
// Get customer by ID
router.get('/:id', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const shopId = req.shopId;
    const { id } = req.params;
    const customer = await database_1.prisma.customer.findUnique({
        where: { id },
        include: {
            _count: {
                select: {
                    orders: { where: { shopId } },
                    udhaarRecords: { where: { shopId } }
                }
            },
            udhaarRecords: {
                where: { shopId, status: 'OPEN' },
                select: { amount: true }
            }
        }
    });
    if (!customer) {
        throw new ApiError_1.ApiError(404, 'Customer not found');
    }
    // Calculate balance
    const balance = customer.udhaarRecords.reduce((sum, record) => sum + Number(record.amount), 0);
    const { udhaarRecords, ...customerData } = customer;
    res.json({
        ...customerData,
        balance
    });
}));
// Update customer
router.patch('/:id', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const { name, creditLimit, tags, notes } = req.body;
    // Verify customer exists
    const customer = await database_1.prisma.customer.findUnique({
        where: { id }
    });
    if (!customer) {
        throw new ApiError_1.ApiError(404, 'Customer not found');
    }
    // Update customer
    const updated = await ShopService.updateCustomer(id, {
        name,
        creditLimit,
        tags,
        notes
    });
    res.json(updated);
}));
exports.default = router;
