<div align="center">

# 🏪 Kirata

![Kirata Logo](branding/hero.png)

### *Empowering Local Businesses with Modern Technology*

[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js&logoColor=white)](https://nextjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green?logo=node.js&logoColor=white)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14+-blue?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

**A comprehensive, production-ready shop management system designed for local businesses and their customers**

[🚀 Quick Start](#-quick-start) • [📖 Documentation](#-documentation) • [✨ Features](#-key-features) • [🛠️ Tech Stack](#-technology-stack) • [🤝 Contributing](#-contributing)

</div>

---
---

## 🌟 Overview

**Kirata** is a full-stack shop management platform that bridges the gap between local businesses and their customers. Built with modern web technologies, it provides a seamless experience for shopkeepers to manage their operations, customers to discover and order from local shops, and administrators to oversee the entire ecosystem.

### 🎯 Why Kirata?

- **🚀 Production Ready** - Battle-tested with real-world use cases
- **🔒 Enterprise Security** - JWT authentication, role-based access, and PCI DSS compliance
- **⚡ High Performance** - Redis caching, optimized queries, and SSR/SSG
- **📱 Mobile First** - Responsive design that works beautifully on all devices
- **🌐 Scalable Architecture** - Microservices-ready with clean separation of concerns
- **📊 Data-Driven** - Comprehensive analytics for all user types

---

## 🚀 Quick Start

Get up and running in less than 5 minutes:

```bash
# 1. Clone the repository
git clone https://github.com/YogeshKumar-saini/Kirata.git
cd Kirata

# 2. Install dependencies for both frontend and backend
npm install

# 3. Set up environment variables
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
# Edit .env files with your configuration

# 4. Set up the database
cd backend
npx prisma db push
npx prisma db seed  # Optional: Load sample data

# 5. Start development servers
cd ..
npm run dev
```

🎉 **That's it!** Your application is now running:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **API Docs**: http://localhost:5000/api-docs

---

## ✨ Key Features

<table>
<tr>
<td width="33%" valign="top">

### 🏪 For Shopkeepers

- **📋 Shop Management**
  - Complete shop profile customization
  - Business hours configuration
  - Vacation mode with custom messages
  - Multi-image gallery support

- **📦 Order Processing**
  - Real-time order notifications
  - Accept/reject orders instantly
  - Order history and tracking
  - Bulk order management

- **💰 Financial Management**
  - Customer ledger system
  - Transaction tracking
  - Payment reconciliation
  - Revenue analytics

- **📊 Analytics Dashboard**
  - Sales trends and insights
  - Customer behavior analysis
  - Performance metrics
  - Export reports (CSV/PDF)

</td>
<td width="33%" valign="top">

### 🛒 For Customers

- **🔍 Shop Discovery**
  - Location-based search
  - Filter by category & ratings
  - Real-time availability status
  - Interactive map view

- **🛍️ Easy Ordering**
  - Quick order placement
  - Multiple shop support
  - Order history tracking
  - Reorder with one click

- **💳 Flexible Payments**
  - UPI integration
  - Card payments
  - Cash on delivery
  - Digital wallet support

- **⭐ Review System**
  - Rate shops and products
  - Write detailed reviews
  - Photo uploads
  - Helpful vote system

- **📈 Personal Analytics**
  - Spending insights
  - Order statistics
  - Favorite shops
  - Transaction history

</td>
<td width="33%" valign="top">

### 👨‍💼 For Admins

- **✅ Shop Verification**
  - Approve/reject registrations
  - Document verification
  - Compliance checks
  - Quality control

- **👥 User Management**
  - Advanced search & filters
  - User activity monitoring
  - Account management
  - Role assignment

- **📊 Platform Analytics**
  - System-wide metrics
  - User growth tracking
  - Revenue monitoring
  - Performance dashboards

- **🛠️ System Tools**
  - Data export utilities
  - Bulk operations
  - System health monitoring
  - Configuration management

</td>
</tr>
</table>

---

## 🔧 Technology Stack

<details open>
<summary><b>Backend Technologies</b></summary>

| Category | Technology | Purpose |
|----------|-----------|---------|
| **Runtime** | Node.js 18+ | JavaScript runtime environment |
| **Framework** | Express.js | Web application framework |
| **Language** | TypeScript | Type-safe development |
| **Database** | PostgreSQL 14+ | Primary data store |
| **ORM** | Prisma | Database toolkit and ORM |
| **Caching** | Redis 7+ | In-memory data structure store |
| **Authentication** | JWT + OTP | Secure authentication system |
| **Storage** | Cloudinary | Media storage and CDN |
| **Maps** | Google Maps API | Location services |
| **Payments** | Razorpay/Stripe | Payment processing |
| **Email** | Nodemailer | Email notifications |
| **Logging** | Winston | Application logging |

</details>

<details open>
<summary><b>Frontend Technologies</b></summary>

| Category | Technology | Purpose |
|----------|-----------|---------|
| **Framework** | Next.js 14 | React framework with SSR/SSG |
| **Language** | TypeScript | Type-safe development |
| **Styling** | Tailwind CSS | Utility-first CSS framework |
| **State** | React Context + Zustand | State management |
| **UI Components** | Radix UI + Custom | Accessible component library |
| **Forms** | React Hook Form | Form handling and validation |
| **Validation** | Zod | Schema validation |
| **HTTP Client** | Axios | API communication |
| **Maps** | Google Maps React | Interactive maps |
| **Charts** | Recharts | Data visualization |
| **Icons** | Lucide React | Icon library |
| **Animations** | Framer Motion | Animation library |

</details>

<details>
<summary><b>DevOps & Tools</b></summary>

| Category | Technology | Purpose |
|----------|-----------|---------|
| **Containerization** | Docker | Application containerization |
| **CI/CD** | GitHub Actions | Automated workflows |
| **Process Manager** | PM2 | Production process management |
| **Testing** | Jest + React Testing Library | Unit and integration testing |
| **Code Quality** | ESLint + Prettier | Code linting and formatting |
| **Version Control** | Git + GitHub | Source code management |
| **Deployment** | Vercel + AWS/Heroku | Cloud hosting |

</details>

---

## 📂 Project Structure

```
Kirata/
├── 📁 backend/                 # Node.js + Express backend
│   ├── src/
│   │   ├── app.ts             # Main Express application
│   │   ├── auth/              # Authentication & authorization
│   │   ├── services/          # Business logic (18+ services)
│   │   │   ├── shops/         # Shop management
│   │   │   ├── orders/        # Order processing
│   │   │   ├── customers/     # Customer services
│   │   │   ├── payments/      # Payment processing
│   │   │   ├── ledger/        # Ledger system
│   │   │   ├── reviews/       # Review system
│   │   │   ├── analytics/     # Analytics engine
│   │   │   └── admin/         # Admin functions
│   │   ├── shared/            # Shared utilities & middleware
│   │   └── jobs/              # Background jobs & cron tasks
│   ├── prisma/                # Database schema & migrations
│   ├── docs/                  # Comprehensive API documentation
│   └── tests/                 # Test suites
│
├── 📁 frontend/               # Next.js 14 frontend
│   ├── app/                   # Next.js app router
│   │   ├── (auth)/           # Authentication pages
│   │   ├── customer/         # Customer dashboard
│   │   ├── shop/             # Shopkeeper dashboard
│   │   └── admin/            # Admin panel
│   ├── components/           # Reusable React components
│   │   ├── ui/               # Base UI components
│   │   ├── landing/          # Landing page sections
│   │   ├── customer/         # Customer-specific components
│   │   ├── shop/             # Shop-specific components
│   │   └── admin/            # Admin-specific components
│   ├── context/              # React context providers
│   ├── hooks/                # Custom React hooks
│   ├── lib/                  # Utilities & helpers
│   ├── services/             # API service layer
│   └── types/                # TypeScript type definitions
│
├── 📁 branding/              # Brand assets & design files
├── 📄 README.md              # This file
├── 📄 CONTRIBUTING.md        # Contribution guidelines
├── 📄 LICENSE                # MIT License
└── 📄 .gitignore             # Git ignore rules
```

---

## 📖 Documentation

We maintain comprehensive documentation for all aspects of the project:

### 📚 Core Documentation

| Document | Description |
|----------|-------------|
| **[Backend Documentation](./backend/docs/README.md)** | Complete backend API reference, service documentation, and integration guides |
| **[Frontend Documentation](./frontend/README.md)** | Frontend architecture, component library, and development guidelines |
| **[API Reference](./backend/docs/api/README.md)** | Detailed documentation for 38+ API endpoints |
| **[Setup Guide](./backend/docs/setup/README.md)** | Step-by-step installation and configuration instructions |
| **[Features Guide](./backend/docs/features/README.md)** | In-depth feature documentation with examples |
| **[Deployment Guide](./backend/docs/deployment/README.md)** | Production deployment instructions and best practices |

---

## 🛠️ Development Setup

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **npm** 9+ (comes with Node.js)
- **PostgreSQL** 14+ ([Download](https://www.postgresql.org/download/))
- **Redis** 7+ ([Download](https://redis.io/download))
- **Docker** (optional, for containerized development)

### Installation Steps

<details>
<summary><b>1. Clone and Install Dependencies</b></summary>

```bash
# Clone the repository
git clone https://github.com/YogeshKumar-saini/Kirata.git
cd Kirata

# Install dependencies for both frontend and backend
npm install
```

</details>

<details>
<summary><b>2. Configure Environment Variables</b></summary>

Create `.env` files for both backend and frontend:

**Backend (.env)**
```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/kirata"

# Redis
REDIS_URL="redis://localhost:6379"

# JWT
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRES_IN="7d"

# Cloudinary
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

# Google Maps
GOOGLE_MAPS_API_KEY="your-google-maps-key"

# Payment Gateway
RAZORPAY_KEY_ID="your-razorpay-key"
RAZORPAY_KEY_SECRET="your-razorpay-secret"

# Email
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
```

**Frontend (.env.local)**
```env
NEXT_PUBLIC_API_URL="http://localhost:5000/api"
NEXT_PUBLIC_GOOGLE_MAPS_KEY="your-google-maps-key"
```

</details>

<details>
<summary><b>3. Set Up Database</b></summary>

```bash
cd backend

# Push schema to database
npx prisma db push

# Generate Prisma Client
npx prisma generate

# Seed database with sample data (optional)
npm run seed
```

</details>

<details>
<summary><b>4. Start Development Servers</b></summary>

```bash
# From project root, start both servers
npm run dev

# Or start individually:
# Backend only
cd backend && npm run dev

# Frontend only
cd frontend && npm run dev
```

</details>

### 🧪 Running Tests

```bash
# Run all tests
npm test

# Run backend tests with coverage
cd backend && npm run test:coverage

# Run frontend tests
cd frontend && npm test

# Run tests in watch mode
npm run test:watch
```

---

## 🚀 Deployment

### Production Build

```bash
# Build both frontend and backend
npm run build

# Start production server
npm start
```

### Docker Deployment

```bash
# Build Docker images
docker-compose build

# Start containers
docker-compose up -d

# View logs
docker-compose logs -f
```

### Environment-Specific Deployment

- **Frontend (Vercel)**: Automatic deployment on push to main branch
- **Backend (AWS/Heroku)**: CI/CD pipeline via GitHub Actions
- **Database**: Managed PostgreSQL (AWS RDS, Heroku Postgres, etc.)
- **Redis**: Managed Redis (AWS ElastiCache, Redis Cloud, etc.)

---

## 🔒 Security Features

### 🔐 Authentication & Authorization

- **JWT Tokens** - Secure, stateless authentication with refresh token rotation
- **OTP Verification** - Phone and email-based one-time passwords
- **Role-Based Access Control (RBAC)** - Fine-grained permissions for different user types
- **Multi-Device Session Management** - Control active sessions across devices
- **OAuth Integration** - Google and social login support

### 🛡️ Data Protection

- **Password Hashing** - bcrypt with configurable salt rounds
- **HTTPS Enforcement** - TLS 1.2+ required in production
- **Rate Limiting** - 1000 requests per 15 minutes per IP
- **CORS Protection** - Strict origin policies and whitelisting
- **SQL Injection Prevention** - Parameterized queries via Prisma ORM
- **XSS Protection** - Input sanitization and output encoding

### 📋 Compliance

- **PCI DSS** - Payment Card Industry Data Security Standard compliance
- **GDPR Ready** - Data privacy features and user consent management
- **Audit Logging** - Comprehensive logging of all critical actions
- **Soft Delete** - Data recovery capabilities and retention policies
- **Data Encryption** - At-rest and in-transit encryption

---

## 📈 Performance Optimization

### ⚡ Backend Optimizations

- **Redis Caching** - Intelligent caching for frequently accessed data
- **Database Indexing** - Optimized indexes for common query patterns
- **Connection Pooling** - Efficient database connection management
- **Response Compression** - Gzip/Brotli compression for API responses
- **Query Optimization** - Efficient joins and eager loading
- **Background Jobs** - Async processing for heavy operations

### 🚀 Frontend Optimizations

- **Server-Side Rendering (SSR)** - Fast initial page loads
- **Static Site Generation (SSG)** - Pre-rendered pages for better performance
- **Code Splitting** - Automatic route-based code splitting
- **Image Optimization** - Next.js Image component with lazy loading
- **Lazy Loading** - Component-level lazy loading
- **Bundle Optimization** - Tree shaking and minification
- **CDN Integration** - Static assets served via CDN

---

## 🎯 Roadmap

### 🔜 Upcoming Features (Q1 2026)

- [ ] **Multi-Language Support** - Hindi, Tamil, Telugu, and other regional languages
- [ ] **Subscription Plans** - Premium features for shops (featured listings, advanced analytics)
- [ ] **Loyalty Program** - Customer rewards and points system
- [ ] **Inventory Management** - Advanced stock tracking and alerts
- [ ] **Delivery Tracking** - Real-time delivery status with GPS tracking
- [ ] **Chat System** - In-app messaging between customers and shops

### 🔮 Future Enhancements (Q2-Q3 2026)

- [ ] **Mobile Apps** - Native iOS and Android applications
- [ ] **GraphQL API** - Alternative to REST for flexible data fetching
- [ ] **WebSockets** - Real-time updates and notifications
- [ ] **AI Recommendations** - Personalized shop and product suggestions
- [ ] **Voice Orders** - Voice-based order placement
- [ ] **Blockchain Integration** - Transparent transaction ledger

### 🏗️ Technical Improvements

- [ ] **Microservices Architecture** - Service decomposition for better scalability
- [ ] **Kubernetes** - Container orchestration for production
- [ ] **Advanced Monitoring** - Prometheus + Grafana integration
- [ ] **A/B Testing Framework** - Feature experimentation platform
- [ ] **Automated E2E Testing** - Cypress/Playwright integration

---

## 🤝 Contributing

We welcome contributions from the community! Whether you're fixing bugs, adding features, or improving documentation, your help is appreciated.

### 🚀 Getting Started

1. **Fork** the repository
2. **Clone** your fork: `git clone https://github.com/YOUR_USERNAME/Kirata.git`
3. **Create** a feature branch: `git checkout -b feature/amazing-feature`
4. **Make** your changes
5. **Commit** your changes: `git commit -m 'Add amazing feature'`
6. **Push** to your branch: `git push origin feature/amazing-feature`
7. **Open** a Pull Request

### 📋 Development Guidelines

- **Code Style** - Follow existing code style and use ESLint/Prettier
- **Testing** - Write tests for new features and bug fixes
- **Documentation** - Update documentation for API changes
- **Commits** - Use semantic commit messages (feat, fix, docs, etc.)
- **Backward Compatibility** - Avoid breaking changes when possible

### 🐛 Reporting Bugs

Found a bug? Please [open an issue](https://github.com/YogeshKumar-saini/Kirata/issues/new) with:
- Clear description of the bug
- Steps to reproduce
- Expected vs actual behavior
- Screenshots (if applicable)
- Environment details

### 💡 Feature Requests

Have an idea? We'd love to hear it! [Open a feature request](https://github.com/YogeshKumar-saini/Kirata/issues/new) with:
- Clear description of the feature
- Use case and benefits
- Proposed implementation (optional)

---

## 📝 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

**TL;DR**: You can use, modify, and distribute this software freely, even for commercial purposes.

---

## 🆘 Support & Community

### 💬 Get Help

- **📖 Documentation** - Check our comprehensive [docs](./backend/docs/README.md)
- **🐛 Issues** - [Report bugs](https://github.com/YogeshKumar-saini/Kirata/issues) or request features
- **💡 Discussions** - [Ask questions](https://github.com/YogeshKumar-saini/Kirata/discussions) and share ideas
- **📧 Email** - support@kirata.com for professional support

### 🌟 Show Your Support

If you find this project helpful, please consider:
- ⭐ **Starring** the repository
- 🐦 **Sharing** on social media
- 🤝 **Contributing** to the codebase
- 💰 **Sponsoring** the project

---

## 🎉 Quick Links

| Resource | Description |
|----------|-------------|
| [🌐 Live Demo](https://kirata-demo.vercel.app) | Try the live application |
| [📖 API Documentation](./backend/docs/api/README.md) | Complete API reference with examples |
| [🚀 Setup Guide](./backend/docs/setup/README.md) | Detailed installation instructions |
| [📝 Changelog](./CHANGELOG.md) | Latest updates and release notes |
| [🤝 Contributing](./CONTRIBUTING.md) | How to contribute to the project |
| [📄 License](./LICENSE) | MIT License details |

---

<div align="center">

## 📊 Project Stats

![GitHub stars](https://img.shields.io/github/stars/YogeshKumar-saini/Kirata?style=social)
![GitHub forks](https://img.shields.io/github/forks/YogeshKumar-saini/Kirata?style=social)
![GitHub watchers](https://img.shields.io/github/watchers/YogeshKumar-saini/Kirata?style=social)

**Version**: 1.0.0 | **Status**: 🚀 Production Ready | **Last Updated**: January 8, 2026

**Maintainer**: [Yogesh Kumar Saini](https://github.com/YogeshKumar-saini)

---

### *"Empowering local businesses with modern technology"*

**Built with ❤️ by the Kirata Team**

[⬆ Back to Top](#-kirata)

</div>