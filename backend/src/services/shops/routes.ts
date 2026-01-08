import { Router } from 'express';
import { validate } from '../../shared/middlewares/validate.middleware';
import { asyncHandler } from '../../shared/middlewares/asyncHandler';
import { authMiddleware } from '../../auth/middleware';
import { createShopSchema, updateShopSchema } from '../../shared/validations/shop.validation';
import * as ShopService from './service';
import * as SearchService from './search.service';
import * as LedgerService from '../ledger/service';
import { ApiError } from '../../shared/errors/ApiError';
import { prisma } from '../../shared/database';
import { ShopCategory } from '@prisma/client';

const router = Router();

// Public search endpoint
router.get('/search', asyncHandler(async (req, res) => {
    const filters: SearchService.SearchFilters = {
        latitude: req.query.lat ? parseFloat(req.query.lat as string) : undefined,
        longitude: req.query.lng ? parseFloat(req.query.lng as string) : undefined,
        radius: req.query.radius ? parseFloat(req.query.radius as string) : 5,
        category: req.query.category as ShopCategory,
        deliveryAvailable: req.query.delivery === 'true',
        minRating: req.query.minRating ? parseFloat(req.query.minRating as string) : undefined,
        status: req.query.status as string,
        searchText: req.query.search as string
    };

    const shops = await SearchService.searchShops(filters);
    res.json(shops);
}));

// Get nearby shops
router.get('/nearby', asyncHandler(async (req, res) => {
    const lat = parseFloat(req.query.lat as string);
    const lng = parseFloat(req.query.lng as string);
    const radius = req.query.radius ? parseFloat(req.query.radius as string) : 5;

    if (!lat || !lng) {
        throw new ApiError(400, 'Latitude and longitude are required');
    }

    const shops = await SearchService.getNearbyShops(lat, lng, radius);
    res.json(shops);
}));

// Get top-rated shops
router.get('/top-rated', asyncHandler(async (req, res) => {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
    const shops = await SearchService.getTopRatedShops(limit);
    res.json(shops);
}));

// Get my shop (Protected, placed here to avoid conflict with /:shopId)
router.get('/my', authMiddleware(['SHOPKEEPER']), asyncHandler(async (req, res) => {
    const { userId } = (req as any).user;
    const shop = await ShopService.getShopByOwnerId(userId);

    if (!shop) {
        throw new ApiError(404, 'No shop found. Please create your shop first.');
    }

    res.json(shop);
}));

// Get shop by ID (public)
router.get('/:shopId', asyncHandler(async (req, res) => {
    const { shopId } = req.params;
    const shop = await ShopService.getShopById(shopId);

    if (!shop || shop.deletedAt) {
        throw new ApiError(404, 'Shop not found');
    }

    res.json(shop);
}));

// Get shop products (public)
router.get('/:shopId/products', asyncHandler(async (req, res) => {
    const { shopId } = req.params;
    const { category, search, page, limit } = req.query;

    const pageNum = page ? parseInt(page as string) : 1;
    const limitNum = limit ? parseInt(limit as string) : 50; // Higher limit for storefront

    // Check if shop exists
    const shop = await ShopService.getShopById(shopId);
    if (!shop || shop.deletedAt) {
        throw new ApiError(404, 'Shop not found');
    }

    // Reuse ProductService logic but force isActive=true
    const { getShopProducts } = await import('../products/service');
    const result = await getShopProducts(shopId, {
        category: category as string,
        search: search as string,
        isActive: true
    }, pageNum, limitNum);

    res.json(result);
}));

// Protected Routes
router.use(authMiddleware(['SHOPKEEPER']));

// Create shop with comprehensive details (ONE PER ACCOUNT)
router.post('/', validate(createShopSchema), asyncHandler(async (req, res) => {
    const { userId } = (req as any).user;

    const shopData: ShopService.DetailedShopInput = {
        name: req.body.name,
        category: req.body.category,
        addressLine1: req.body.addressLine1,
        addressLine2: req.body.addressLine2,
        city: req.body.city,
        state: req.body.state,
        pincode: req.body.pincode,
        phone: req.body.phone,
        alternatePhone: req.body.alternatePhone,
        email: req.body.email,
        whatsappNumber: req.body.whatsappNumber,
        gstNumber: req.body.gstNumber,
        businessHours: req.body.businessHours,
        location: req.body.location, // Legacy support
    };

    const shop = await ShopService.createDetailedShop(userId, shopData);
    res.status(201).json(shop);
}));



// Update my shop
router.patch('/my', validate(updateShopSchema), asyncHandler(async (req, res) => {
    const { userId } = (req as any).user;

    // Get shop ID
    const existingShop = await ShopService.getShopByOwnerId(userId);
    if (!existingShop) {
        throw new ApiError(404, 'No shop found. Please create your shop first.');
    }

    const shop = await ShopService.updateShop(existingShop.shopId, userId, req.body);
    res.json(shop);
}));

// Delete my shop (soft delete)
router.delete('/my', asyncHandler(async (req, res) => {
    const { userId } = (req as any).user;

    const existingShop = await ShopService.getShopByOwnerId(userId);
    if (!existingShop) {
        throw new ApiError(404, 'No shop found.');
    }

    await ShopService.softDeleteShop(existingShop.shopId, userId);
    res.json({ message: 'Shop deleted successfully. You can create a new shop now.' });
}));

// Get shop profile completion status
router.get('/my/completion', asyncHandler(async (req, res) => {
    const { userId } = (req as any).user;

    const shop = await ShopService.getShopByOwnerId(userId);
    if (!shop) {
        throw new ApiError(404, 'No shop found.');
    }

    const completion = await ShopService.checkProfileCompletion(shop.shopId);
    res.json(completion);
}));

// Lookup or create a customer for Ledger/Orders
// Search customers by phone or name (for autocomplete)
router.get('/customers/search', authMiddleware(['SHOPKEEPER']), asyncHandler(async (req, res) => {
    const { userId } = (req as any).user;
    const query = req.query.q as string;

    const shopResult = await ShopService.getShopByOwnerId(userId);
    if (!shopResult) throw new ApiError(404, 'Shop not found');

    // Build where clause: filter by query if provided (>= 2 chars), otherwise return all
    const whereClause = query && query.length >= 2 ? {
        AND: [
            {
                OR: [
                    { phone: { contains: query } },
                    { name: { contains: query, mode: 'insensitive' as const } }
                ]
            },
            {
                OR: [
                    { sales: { some: { shopId: shopResult.shopId } } },
                    { orders: { some: { shopId: shopResult.shopId } } }
                ]
            }
        ]
    } : {
        OR: [
            { sales: { some: { shopId: shopResult.shopId } } },
            { orders: { some: { shopId: shopResult.shopId } } }
        ]
    };

    // Search customers who have transacted with this shop
    const customers = await prisma.customer.findMany({
        where: whereClause,
        select: {
            id: true,
            phone: true,
            name: true,
            uniqueId: true,
            _count: {
                select: {
                    sales: { where: { shopId: shopResult.shopId } }
                }
            }
        },
        take: query && query.length >= 2 ? 10 : 100, // Return more customers when showing all
        orderBy: { createdAt: 'desc' }
    });

    // Calculate balance for each customer
    const customersWithBalance = await Promise.all(
        customers.map(async (customer) => {
            const balance = await LedgerService.getCustomerBalance(shopResult.shopId, customer.id);
            return {
                id: customer.id,
                phone: customer.phone,
                name: customer.name,
                uniqueId: customer.uniqueId,
                balance,
                transactionCount: customer._count.sales
            };
        })
    );

    res.json({ customers: customersWithBalance });
}));

// Get quick-select customers (Udhaar + Recent)
router.get('/customers/quick-select', authMiddleware(['SHOPKEEPER']), asyncHandler(async (req, res) => {
    const { userId } = (req as any).user;

    const shopResult = await ShopService.getShopByOwnerId(userId);
    if (!shopResult) throw new ApiError(404, 'Shop not found');

    const quickSelectData = await ShopService.getQuickSelectCustomers(shopResult.shopId);
    res.json(quickSelectData);
}));

router.post('/customers/lookup', asyncHandler(async (req, res) => {
    const { phone, name } = req.body;

    if (!phone) {
        throw new ApiError(400, 'Phone number is required');
    }

    // Use shared service logic to find or create customer
    const customer = await ShopService.findOrCreateCustomer(phone, name);

    res.json({
        id: customer.id,
        phone: customer.phone,
        name: customer.name,
        uniqueId: customer.uniqueId
    });
}));

// Update customer details
router.patch('/customers/:id', authMiddleware(['SHOPKEEPER']), asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { name, creditLimit, tags, notes } = req.body;

    const updateData: ShopService.CustomerUpdateInput = {
        name,
        creditLimit,
        tags,
        notes
    };

    const updatedCustomer = await ShopService.updateCustomer(id, updateData);
    res.json(updatedCustomer);
}));


// Upload shop photo with automatic image processing
router.post('/my/photo', asyncHandler(async (req, res) => {
    const { userId } = (req as any).user;

    const shop = await ShopService.getShopByOwnerId(userId);
    if (!shop) {
        throw new ApiError(404, 'No shop found. Please create your shop first.');
    }

    // Import multer and image processing
    const { shopPhotoUpload } = await import('../../shared/middlewares/upload.middleware');
    const { processShopImage } = await import('../../shared/services/image.service');

    // Use multer middleware
    shopPhotoUpload.single('photo')(req, res, async (err: any) => {
        if (err) {
            throw new ApiError(400, err.message || 'Photo upload failed');
        }

        if (!req.file) {
            throw new ApiError(400, 'No photo file provided');
        }

        try {
            // Process image with Sharp - generates 3 sizes
            const processedImages = await processShopImage(req.file.path, shop.shopId);

            // Update shop with all image sizes
            const updatedShop = await ShopService.updateShop(shop.shopId, userId, {
                photoUrl: processedImages.large,
                photoThumbnail: processedImages.thumbnail,
                photoMedium: processedImages.medium
            } as any);

            res.json({
                message: 'Photo uploaded and optimized successfully',
                images: {
                    thumbnail: processedImages.thumbnail,
                    medium: processedImages.medium,
                    large: processedImages.large
                },
                shop: {
                    photoUrl: updatedShop.photoUrl,
                    photoThumbnail: (updatedShop as any).photoThumbnail,
                    photoMedium: (updatedShop as any).photoMedium
                }
            });
        } catch (error) {
            throw new ApiError(500, 'Image processing failed');
        }
    });
}));

// Vacation Mode
router.post('/my/vacation', asyncHandler(async (req, res) => {
    const { userId } = (req as any).user;
    const { startDate, endDate, message } = req.body;

    const shop = await ShopService.getShopByOwnerId(userId);
    if (!shop) {
        throw new ApiError(404, 'No shop found');
    }

    const { enableVacationMode } = await import('./business-hours.service');
    const updated = await enableVacationMode(
        shop.shopId,
        new Date(startDate),
        new Date(endDate),
        message
    );

    res.json({
        message: 'Vacation mode enabled',
        vacationMode: true,
        startDate: updated.vacationStartDate,
        endDate: updated.vacationEndDate
    });
}));

router.delete('/my/vacation', asyncHandler(async (req, res) => {
    const { userId } = (req as any).user;

    const shop = await ShopService.getShopByOwnerId(userId);
    if (!shop) {
        throw new ApiError(404, 'No shop found');
    }

    const { disableVacationMode } = await import('./business-hours.service');
    await disableVacationMode(shop.shopId);

    res.json({ message: 'Vacation mode disabled', vacationMode: false });
}));

// Business Hours Exceptions
router.post('/my/hours-exception', asyncHandler(async (req, res) => {
    const { userId } = (req as any).user;
    const { date, open, close, closed } = req.body;

    const shop = await ShopService.getShopByOwnerId(userId);
    if (!shop) {
        throw new ApiError(404, 'No shop found');
    }

    const { addHoursException } = await import('./business-hours.service');
    const updated = await addHoursException(shop.shopId, date, { open, close, closed });

    res.json({ message: 'Hours exception added', businessHoursExceptions: updated.businessHoursExceptions });
}));

router.delete('/my/hours-exception/:date', asyncHandler(async (req, res) => {
    const { userId } = (req as any).user;
    const { date } = req.params;

    const shop = await ShopService.getShopByOwnerId(userId);
    if (!shop) {
        throw new ApiError(404, 'No shop found');
    }

    const { removeHoursException } = await import('./business-hours.service');
    await removeHoursException(shop.shopId, date);

    res.json({ message: 'Hours exception removed' });
}));

export default router;
