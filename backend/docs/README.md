# Kirata Documentation Index

Complete documentation for the Kirata Shop Management System.

## 📚 Documentation Structure

```
DOCS/
├── README.md (this file)
├── setup/          - Installation & Configuration
├── api/            - Complete API Reference
├── features/       - Feature Guides
├── deployment/     - Production Deployment
├── auth/           - Authentication System
├── shops/          - Shop Management
├── orders/         - Order Processing
├── ledger/         - Ledger & Accounting
├── router/         - Router Service
├── ingestion/      - Data Ingestion
├── customers/      - Customer Services
├── gateway/        - Gateway & Webhooks
├── payments/       - Payment Processing
└── admin/          - Admin Functions
```

---

## 🚀 Quick Navigation

### Getting Started
- **[Setup Guide](./setup/README.md)** - Install and configure the system
- **[API Reference](./api/README.md)** - Complete API documentation
- **[Features](./features/README.md)** - Feature guides and tutorials

### Core Services
- **[Authentication](./auth/README.md)** - User auth, OTP, JWT
- **[Shop Management](./shops/README.md)** - Shop CRUD, photos, vacation mode
- **[Orders](./orders/README.md)** - Order processing
- **[Ledger](./ledger/README.md)** - Financial tracking

### Advanced
- **[Deployment](./deployment/README.md)** - Production deployment guide
- **[Router Service](./router/README.md)** - Intent routing
- **[Ingestion](./ingestion/README.md)** - Data ingestion

---

## 📖 Main Documentation

### [Setup Guide](./setup/README.md)
Complete installation and configuration guide:
- Prerequisites
- Installation steps
- Environment configuration
- Database setup
- Verification

### [API Reference](./api/README.md)
Complete API documentation with examples:
- **38 endpoints** across 10 route groups
- Request/response examples
- Authentication requirements
- Error handling
- Rate limiting

### [Features Guide](./features/README.md)
Detailed feature documentation:
- Shop management
- Vacation mode
- Business hours
- Media management
- Search & discovery
- Reviews & ratings
- Analytics
- Data export
- Admin verification

### [Deployment Guide](./deployment/README.md)
Production deployment instructions:
- Docker deployment
- Cloud platforms (AWS, Heroku, Vercel)
- Security best practices
- Monitoring & logging
- CI/CD pipeline
- Scaling strategies

---

## 🎯 By User Role

### For Developers
1. [Setup Guide](./setup/README.md) - Get started
2. [API Reference](./api/README.md) - Integrate APIs
3. [Authentication](./auth/README.md) - Implement auth

### For DevOps
1. [Deployment Guide](./deployment/README.md) - Deploy to production
2. [Setup Guide](./setup/README.md) - Environment config

### For Product Managers
1. [Features Guide](./features/README.md) - Understand features
2. [API Reference](./api/README.md) - API capabilities

---

## 🔍 Search by Topic

### Authentication & Security
- [Authentication System](./auth/README.md)
- [Security Best Practices](./deployment/README.md#security-best-practices)
- Rate Limiting
- JWT Tokens

### Shop Management
- [Shop CRUD Operations](./shops/README.md)
- [Vacation Mode](./features/README.md#vacation-mode)
- [Business Hours](./features/README.md#business-hours-management)
- [Media Management](./features/README.md#media-management)

### Customer Features
- [Reviews & Ratings](./features/README.md#reviews--ratings)
- [Search & Discovery](./features/README.md#search--discovery)
- Order Placement

### Analytics & Reporting
- [Analytics Dashboard](./features/README.md#analytics-dashboard)
- [Data Export](./features/README.md#data-export)
- Performance Metrics

### Admin Features
- [Verification System](./features/README.md#verification-system)
- Shop Approval
- User Management

---

## 📊 System Overview

### Technology Stack
- **Runtime:** Node.js + TypeScript
- **Framework:** Express.js
- **Database:** PostgreSQL + Prisma ORM
- **Caching:** Redis
- **Storage:** Cloudinary
- **Maps:** Google Maps API

### Key Features
- ✅ 38 API endpoints
- ✅ 10 route groups
- ✅ 7 database models
- ✅ 15 performance indexes
- ✅ Image optimization
- ✅ Location-based search
- ✅ Real-time analytics
- ✅ CSV export
- ✅ Admin verification

---

## 🆘 Support & Resources

### Documentation
- **Main README:** [../README.md](../README.md)
- **API Docs:** [./api/README.md](./api/README.md)
- **Setup:** [./setup/README.md](./setup/README.md)

### Testing
- Feature tests: `npx ts-node test-features.ts`
- Route tests: `npx ts-node test-routes.ts`
- Health check: `GET /health`

### Troubleshooting
- [Setup Issues](./setup/README.md#troubleshooting)
- [Deployment Issues](./deployment/README.md#troubleshooting)
- Check logs: `pm2 logs kirata`

---

## 📝 Contributing

When adding new features:
1. Update relevant documentation
2. Add API examples
3. Update this index
4. Test thoroughly

---

## 🎉 Quick Start

```bash
# 1. Install
npm install

# 2. Configure
cp .env.example .env

# 3. Setup database
npx prisma db push

# 4. Start
npm run dev
```

See [Setup Guide](./setup/README.md) for detailed instructions.

---

**Last Updated:** 2026-01-04  
**Version:** 1.0.0  
**Status:** Production Ready ✅
