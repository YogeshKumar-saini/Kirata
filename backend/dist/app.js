"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const express_1 = __importDefault(require("express"));
const morgan_1 = __importDefault(require("morgan"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const compression_1 = __importDefault(require("compression"));
const error_middleware_1 = require("./shared/middlewares/error.middleware");
const routes_1 = __importDefault(require("./services/gateway/routes"));
const routes_2 = __importDefault(require("./auth/routes"));
const routes_3 = __importDefault(require("./services/shops/routes"));
const routes_4 = __importDefault(require("./services/orders/routes"));
const routes_5 = __importDefault(require("./services/ledger/routes"));
const routes_6 = __importDefault(require("./services/reviews/routes"));
const routes_7 = __importDefault(require("./services/staff/routes"));
const routes_8 = __importDefault(require("./services/media/routes"));
const routes_9 = __importDefault(require("./services/analytics/routes"));
const routes_10 = __importDefault(require("./services/export/routes"));
const routes_11 = __importDefault(require("./services/reports/routes"));
const routes_12 = __importDefault(require("./services/admin/routes"));
const routes_13 = __importDefault(require("./services/shopkeepers/routes"));
const routes_14 = __importDefault(require("./services/products/routes"));
const routes_15 = __importDefault(require("./services/preferences/routes"));
const routes_16 = __importDefault(require("./services/notifications/routes"));
const routes_17 = __importDefault(require("./services/suppliers/routes"));
const routes_18 = __importDefault(require("./services/backup/routes"));
const routes_19 = __importDefault(require("./services/offers/routes"));
const routes_20 = __importDefault(require("./services/customers/routes"));
const manage_routes_1 = __importDefault(require("./services/customers/manage-routes"));
const routes_21 = __importDefault(require("./services/personal-ledger/routes"));
const routes_22 = __importDefault(require("./services/payments/routes"));
const cors_1 = __importDefault(require("cors"));
exports.app = (0, express_1.default)();
// CORS - Must be before routes
exports.app.use((0, cors_1.default)({
    origin: [
        process.env.FRONTEND_URL || 'http://localhost:3000',
        'http://localhost:3000',
        'http://127.0.0.1:3000'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
// Logging
exports.app.use((0, morgan_1.default)('combined'));
// Security Middleware
exports.app.use((0, helmet_1.default)());
exports.app.use((0, compression_1.default)());
// Rate Limiting
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // Increased for development // Limit each IP to 100 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
    message: 'Too many requests from this IP, please try again after 15 minutes'
});
exports.app.use(limiter);
exports.app.use(express_1.default.json());
// Serve uploaded files
exports.app.use('/uploads', express_1.default.static('uploads'));
// Routes
exports.app.use('/api/export', routes_10.default);
exports.app.use('/api/reports', routes_11.default);
exports.app.use('/api/admin', routes_12.default);
exports.app.use('/api', routes_2.default);
exports.app.use('/api/shops', routes_3.default);
exports.app.use('/api/staff', routes_7.default);
exports.app.use('/api/preferences', routes_15.default);
exports.app.use('/api/shopkeepers', routes_13.default);
exports.app.use('/api/products', routes_14.default);
exports.app.use('/api/suppliers', routes_17.default);
exports.app.use('/api/offers', routes_19.default);
exports.app.use('/api/customers', routes_20.default);
exports.app.use('/api/shop/customers', manage_routes_1.default);
exports.app.use('/api/orders', routes_4.default);
exports.app.use('/api/notifications', routes_16.default);
exports.app.use('/api/ledger', routes_5.default);
exports.app.use('/api/reviews', routes_6.default);
exports.app.use('/api/media', routes_8.default);
exports.app.use('/api/analytics', routes_9.default);
exports.app.use('/api/export', routes_10.default);
exports.app.use('/api/backup', routes_18.default);
exports.app.use('/api/personal-ledger', routes_21.default);
exports.app.use('/api/payments', routes_22.default);
exports.app.use('/api', routes_1.default);
// Health Check
exports.app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date() });
});
// Middleware for error handling
exports.app.use(error_middleware_1.errorHandler);
