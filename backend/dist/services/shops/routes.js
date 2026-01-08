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
const validate_middleware_1 = require("../../shared/middlewares/validate.middleware");
const asyncHandler_1 = require("../../shared/middlewares/asyncHandler");
const middleware_1 = require("../../auth/middleware");
const shop_validation_1 = require("../../shared/validations/shop.validation");
const ShopService = __importStar(require("./service"));
const SearchService = __importStar(require("./search.service"));
const LedgerService = __importStar(require("../ledger/service"));
const ApiError_1 = require("../../shared/errors/ApiError");
const database_1 = require("../../shared/database");
const router = (0, express_1.Router)();
// Public search endpoint
router.get('/search', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const filters = {
        latitude: req.query.lat ? parseFloat(req.query.lat) : undefined,
        longitude: req.query.lng ? parseFloat(req.query.lng) : undefined,
        radius: req.query.radius ? parseFloat(req.query.radius) : 5,
        category: req.query.category,
        deliveryAvailable: req.query.delivery === 'true',
        minRating: req.query.minRating ? parseFloat(req.query.minRating) : undefined,
        status: req.query.status,
        searchText: req.query.search
    };
    const shops = await SearchService.searchShops(filters);
    res.json(shops);
}));
// Get nearby shops
router.get('/nearby', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const lat = parseFloat(req.query.lat);
    const lng = parseFloat(req.query.lng);
    const radius = req.query.radius ? parseFloat(req.query.radius) : 5;
    if (!lat || !lng) {
        throw new ApiError_1.ApiError(400, 'Latitude and longitude are required');
    }
    const shops = await SearchService.getNearbyShops(lat, lng, radius);
    res.json(shops);
}));
// Get top-rated shops
router.get('/top-rated', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const shops = await SearchService.getTopRatedShops(limit);
    res.json(shops);
}));
// Get my shop (Protected, placed here to avoid conflict with /:shopId)
router.get('/my', (0, middleware_1.authMiddleware)(['SHOPKEEPER']), (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { userId } = req.user;
    const shop = await ShopService.getShopByOwnerId(userId);
    if (!shop) {
        throw new ApiError_1.ApiError(404, 'No shop found. Please create your shop first.');
    }
    res.json(shop);
}));
// Get shop by ID (public)
router.get('/:shopId', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { shopId } = req.params;
    const shop = await ShopService.getShopById(shopId);
    if (!shop || shop.deletedAt) {
        throw new ApiError_1.ApiError(404, 'Shop not found');
    }
    res.json(shop);
}));
// Get shop products (public)
router.get('/:shopId/products', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { shopId } = req.params;
    const { category, search, page, limit } = req.query;
    const pageNum = page ? parseInt(page) : 1;
    const limitNum = limit ? parseInt(limit) : 50; // Higher limit for storefront
    // Check if shop exists
    const shop = await ShopService.getShopById(shopId);
    if (!shop || shop.deletedAt) {
        throw new ApiError_1.ApiError(404, 'Shop not found');
    }
    // Reuse ProductService logic but force isActive=true
    const { getShopProducts } = await Promise.resolve().then(() => __importStar(require('../products/service')));
    const result = await getShopProducts(shopId, {
        category: category,
        search: search,
        isActive: true
    }, pageNum, limitNum);
    res.json(result);
}));
// Protected Routes
router.use((0, middleware_1.authMiddleware)(['SHOPKEEPER']));
// Create shop with comprehensive details (ONE PER ACCOUNT)
router.post('/', (0, validate_middleware_1.validate)(shop_validation_1.createShopSchema), (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { userId } = req.user;
    const shopData = {
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
router.patch('/my', (0, validate_middleware_1.validate)(shop_validation_1.updateShopSchema), (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { userId } = req.user;
    // Get shop ID
    const existingShop = await ShopService.getShopByOwnerId(userId);
    if (!existingShop) {
        throw new ApiError_1.ApiError(404, 'No shop found. Please create your shop first.');
    }
    const shop = await ShopService.updateShop(existingShop.shopId, userId, req.body);
    res.json(shop);
}));
// Delete my shop (soft delete)
router.delete('/my', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { userId } = req.user;
    const existingShop = await ShopService.getShopByOwnerId(userId);
    if (!existingShop) {
        throw new ApiError_1.ApiError(404, 'No shop found.');
    }
    await ShopService.softDeleteShop(existingShop.shopId, userId);
    res.json({ message: 'Shop deleted successfully. You can create a new shop now.' });
}));
// Get shop profile completion status
router.get('/my/completion', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { userId } = req.user;
    const shop = await ShopService.getShopByOwnerId(userId);
    if (!shop) {
        throw new ApiError_1.ApiError(404, 'No shop found.');
    }
    const completion = await ShopService.checkProfileCompletion(shop.shopId);
    res.json(completion);
}));
// Lookup or create a customer for Ledger/Orders
// Search customers by phone or name (for autocomplete)
router.get('/customers/search', (0, middleware_1.authMiddleware)(['SHOPKEEPER']), (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { userId } = req.user;
    const query = req.query.q;
    const shopResult = await ShopService.getShopByOwnerId(userId);
    if (!shopResult)
        throw new ApiError_1.ApiError(404, 'Shop not found');
    // Build where clause: filter by query if provided (>= 2 chars), otherwise return all
    const whereClause = query && query.length >= 2 ? {
        AND: [
            {
                OR: [
                    { phone: { contains: query } },
                    { name: { contains: query, mode: 'insensitive' } }
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
    const customers = await database_1.prisma.customer.findMany({
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
    const customersWithBalance = await Promise.all(customers.map(async (customer) => {
        const balance = await LedgerService.getCustomerBalance(shopResult.shopId, customer.id);
        return {
            id: customer.id,
            phone: customer.phone,
            name: customer.name,
            uniqueId: customer.uniqueId,
            balance,
            transactionCount: customer._count.sales
        };
    }));
    res.json({ customers: customersWithBalance });
}));
// Get quick-select customers (Udhaar + Recent)
router.get('/customers/quick-select', (0, middleware_1.authMiddleware)(['SHOPKEEPER']), (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { userId } = req.user;
    const shopResult = await ShopService.getShopByOwnerId(userId);
    if (!shopResult)
        throw new ApiError_1.ApiError(404, 'Shop not found');
    const quickSelectData = await ShopService.getQuickSelectCustomers(shopResult.shopId);
    res.json(quickSelectData);
}));
router.post('/customers/lookup', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { phone, name } = req.body;
    if (!phone) {
        throw new ApiError_1.ApiError(400, 'Phone number is required');
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
router.patch('/customers/:id', (0, middleware_1.authMiddleware)(['SHOPKEEPER']), (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const { name, creditLimit, tags, notes } = req.body;
    const updateData = {
        name,
        creditLimit,
        tags,
        notes
    };
    const updatedCustomer = await ShopService.updateCustomer(id, updateData);
    res.json(updatedCustomer);
}));
// Upload shop photo with automatic image processing
router.post('/my/photo', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { userId } = req.user;
    const shop = await ShopService.getShopByOwnerId(userId);
    if (!shop) {
        throw new ApiError_1.ApiError(404, 'No shop found. Please create your shop first.');
    }
    // Import multer and image processing
    const { shopPhotoUpload } = await Promise.resolve().then(() => __importStar(require('../../shared/middlewares/upload.middleware')));
    const { processShopImage } = await Promise.resolve().then(() => __importStar(require('../../shared/services/image.service')));
    // Use multer middleware
    shopPhotoUpload.single('photo')(req, res, async (err) => {
        if (err) {
            throw new ApiError_1.ApiError(400, err.message || 'Photo upload failed');
        }
        if (!req.file) {
            throw new ApiError_1.ApiError(400, 'No photo file provided');
        }
        try {
            // Process image with Sharp - generates 3 sizes
            const processedImages = await processShopImage(req.file.path, shop.shopId);
            // Update shop with all image sizes
            const updatedShop = await ShopService.updateShop(shop.shopId, userId, {
                photoUrl: processedImages.large,
                photoThumbnail: processedImages.thumbnail,
                photoMedium: processedImages.medium
            });
            res.json({
                message: 'Photo uploaded and optimized successfully',
                images: {
                    thumbnail: processedImages.thumbnail,
                    medium: processedImages.medium,
                    large: processedImages.large
                },
                shop: {
                    photoUrl: updatedShop.photoUrl,
                    photoThumbnail: updatedShop.photoThumbnail,
                    photoMedium: updatedShop.photoMedium
                }
            });
        }
        catch (error) {
            throw new ApiError_1.ApiError(500, 'Image processing failed');
        }
    });
}));
// Vacation Mode
router.post('/my/vacation', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { userId } = req.user;
    const { startDate, endDate, message } = req.body;
    const shop = await ShopService.getShopByOwnerId(userId);
    if (!shop) {
        throw new ApiError_1.ApiError(404, 'No shop found');
    }
    const { enableVacationMode } = await Promise.resolve().then(() => __importStar(require('./business-hours.service')));
    const updated = await enableVacationMode(shop.shopId, new Date(startDate), new Date(endDate), message);
    res.json({
        message: 'Vacation mode enabled',
        vacationMode: true,
        startDate: updated.vacationStartDate,
        endDate: updated.vacationEndDate
    });
}));
router.delete('/my/vacation', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { userId } = req.user;
    const shop = await ShopService.getShopByOwnerId(userId);
    if (!shop) {
        throw new ApiError_1.ApiError(404, 'No shop found');
    }
    const { disableVacationMode } = await Promise.resolve().then(() => __importStar(require('./business-hours.service')));
    await disableVacationMode(shop.shopId);
    res.json({ message: 'Vacation mode disabled', vacationMode: false });
}));
// Business Hours Exceptions
router.post('/my/hours-exception', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { userId } = req.user;
    const { date, open, close, closed } = req.body;
    const shop = await ShopService.getShopByOwnerId(userId);
    if (!shop) {
        throw new ApiError_1.ApiError(404, 'No shop found');
    }
    const { addHoursException } = await Promise.resolve().then(() => __importStar(require('./business-hours.service')));
    const updated = await addHoursException(shop.shopId, date, { open, close, closed });
    res.json({ message: 'Hours exception added', businessHoursExceptions: updated.businessHoursExceptions });
}));
router.delete('/my/hours-exception/:date', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { userId } = req.user;
    const { date } = req.params;
    const shop = await ShopService.getShopByOwnerId(userId);
    if (!shop) {
        throw new ApiError_1.ApiError(404, 'No shop found');
    }
    const { removeHoursException } = await Promise.resolve().then(() => __importStar(require('./business-hours.service')));
    await removeHoursException(shop.shopId, date);
    res.json({ message: 'Hours exception removed' });
}));
exports.default = router;
