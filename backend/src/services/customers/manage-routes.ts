import { Router } from 'express';
import { authMiddleware } from '../../auth/middleware';
import { asyncHandler } from '../../shared/middlewares/asyncHandler';
import { requireShop } from '../../shared/middlewares/auth.middleware';
import { ApiError } from '../../shared/errors/ApiError';
import * as ShopService from '../shops/service';
import { prisma } from '../../shared/database';

const router = Router();

router.use(authMiddleware(['SHOPKEEPER']));
router.use(requireShop);

// Get all customers for shop
router.get('/', asyncHandler(async (req, res) => {
    const shopId = (req as any).shopId;
    const { search, tag, page = '1', limit = '20' } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Build where clause
    const where: any = {
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
                    { name: { contains: search as string, mode: 'insensitive' } },
                    { phone: { contains: search as string } },
                    { email: { contains: search as string, mode: 'insensitive' } }
                ]
            }
        ];
    }

    // Add tag filter
    if (tag) {
        if (!where.AND) where.AND = [];
        where.AND.push({ tags: { has: tag as string } });
    }

    // Get total count
    const total = await prisma.customer.count({ where });

    // Get customers with aggregated data
    const customers = await prisma.customer.findMany({
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
        const balance = customer.udhaarRecords.reduce(
            (sum, record) => sum + Number(record.amount),
            0
        );
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
router.get('/:id', asyncHandler(async (req, res) => {
    const shopId = (req as any).shopId;
    const { id } = req.params;

    const customer = await prisma.customer.findUnique({
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
        throw new ApiError(404, 'Customer not found');
    }

    // Calculate balance
    const balance = customer.udhaarRecords.reduce(
        (sum, record) => sum + Number(record.amount),
        0
    );

    const { udhaarRecords, ...customerData } = customer;

    res.json({
        ...customerData,
        balance
    });
}));

// Update customer
router.patch('/:id', asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { name, creditLimit, tags, notes } = req.body;

    // Verify customer exists
    const customer = await prisma.customer.findUnique({
        where: { id }
    });

    if (!customer) {
        throw new ApiError(404, 'Customer not found');
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

export default router;
