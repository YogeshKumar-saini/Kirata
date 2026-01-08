import express from 'express';
import morgan from 'morgan';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import compression from 'compression';
import { errorHandler } from './shared/middlewares/error.middleware';
import routes from './services/gateway/routes';
import authRoutes from './auth/routes';
import shopRoutes from './services/shops/routes';
import orderRoutes from './services/orders/routes';
import ledgerRoutes from './services/ledger/routes';
import reviewRoutes from './services/reviews/routes';
import staffRoutes from './services/staff/routes';
import mediaRoutes from './services/media/routes';
import analyticsRoutes from './services/analytics/routes';
import exportRoutes from './services/export/routes';
import reportRoutes from './services/reports/routes';
import adminRoutes from './services/admin/routes';
import shopkeeperRoutes from './services/shopkeepers/routes';
import productRoutes from './services/products/routes';
import preferencesRoutes from './services/preferences/routes';
import notificationRoutes from './services/notifications/routes';
import supplierRoutes from './services/suppliers/routes';
import backupRoutes from './services/backup/routes';
import offerRoutes from './services/offers/routes';
import customerRoutes from './services/customers/routes';
import customerManageRoutes from './services/customers/manage-routes';
import personalLedgerRoutes from './services/personal-ledger/routes';
import paymentRoutes from './services/payments/routes';

import cors from 'cors';

export const app = express();

// CORS - Must be before routes
app.use(cors({
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
app.use(morgan('combined'));

// Security Middleware
app.use(helmet());
app.use(compression());

// Rate Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // Increased for development // Limit each IP to 100 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
    message: 'Too many requests from this IP, please try again after 15 minutes'
});
app.use(limiter);

app.use(express.json());

// Serve uploaded files
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/export', exportRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api', authRoutes);
app.use('/api/shops', shopRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/preferences', preferencesRoutes);
app.use('/api/shopkeepers', shopkeeperRoutes);
app.use('/api/products', productRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/offers', offerRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/shop/customers', customerManageRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/ledger', ledgerRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/export', exportRoutes);
app.use('/api/backup', backupRoutes);
app.use('/api/personal-ledger', personalLedgerRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api', routes);


// Health Check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date() });
});

// Middleware for error handling
app.use(errorHandler);
