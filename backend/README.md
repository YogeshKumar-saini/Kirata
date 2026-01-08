# Kirata Backend

![Kirata Backend](https://via.placeholder.com/800x400/4A90E2/FFFFFF?text=Kirata+Backend)

**Node.js + Express + TypeScript Backend for Kirata Shop Management System**

---

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Set up database
npx prisma db push

# Seed test data (optional)
npm run seed

# Start development server
npm run dev
```

---

## 📚 Project Structure

```
backend/
├── src/                   # Source code
│   ├── app.ts             # Main Express application
│   ├── index.ts           # Server entry point
│   ├── auth/              # Authentication service
│   ├── services/          # Business logic services (18+ services)
│   ├── shared/            # Shared utilities and middlewares
│   ├── jobs/              # Background jobs
│   └── tests/             # Test suites
├── prisma/                # Database schema and migrations
├── docs/                  # Comprehensive API documentation
├── scripts/               # Utility scripts
├── uploads/               # File uploads
├── Dockerfile             # Docker configuration
├── docker-compose.yml     # Docker Compose setup
└── README.md              # This file
```

---

## 🎯 Key Features

### Core Services
- ✅ **Authentication**: JWT + OTP based authentication
- ✅ **Shop Management**: Comprehensive shop CRUD operations
- ✅ **Order Processing**: Full order lifecycle management
- ✅ **Ledger System**: Customer balance tracking
- ✅ **Payment Processing**: Razorpay integration
- ✅ **Admin Functions**: Shop verification and user management
- ✅ **Analytics**: Comprehensive business analytics
- ✅ **Media Management**: Image upload and processing

### Technical Features
- ✅ **TypeScript**: Full type safety
- ✅ **Prisma ORM**: Modern database access
- ✅ **Express.js**: Robust web framework
- ✅ **JWT Authentication**: Secure stateless auth
- ✅ **Rate Limiting**: Protection against abuse
- ✅ **CORS**: Secure cross-origin requests
- ✅ **Helmet**: Security headers
- ✅ **Compression**: Gzip response compression

---

## 🔧 Technology Stack

### Core Technologies
- **Runtime**: Node.js 18+
- **Framework**: Express.js 4.18+
- **Language**: TypeScript 5.0+
- **Database**: PostgreSQL 14+
- **ORM**: Prisma 4.0+
- **Authentication**: JWT + OTP
- **Caching**: Redis 7+
- **Storage**: Cloudinary
- **Maps**: Google Maps API

### Development Tools
- **Testing**: Vitest + Jest
- **Linting**: ESLint
- **Formatting**: Prettier
- **Documentation**: Markdown
- **Containerization**: Docker
- **Process Management**: PM2

---

## 📂 API Documentation

### Complete API Reference
The backend provides **38+ RESTful API endpoints** organized into logical services:

### Service Documentation
- **[API Reference](./docs/api/README.md)** - Complete API overview
- **[Authentication](./docs/auth/README.md)** - User auth, OTP, JWT
- **[Shops](./docs/shops/README.md)** - Shop management
- **[Orders](./docs/orders/README.md)** - Order processing
- **[Customers](./docs/customers/README.md)** - Customer services
- **[Payments](./docs/payments/README.md)** - Payment processing
- **[Admin](./docs/admin/README.md)** - Admin functions
- **[Gateway](./docs/gateway/README.md)** - Webhook processing
- **[Ledger](./docs/ledger/README.md)** - Financial tracking
- **[Analytics](./docs/features/README.md#analytics-dashboard)** - Business analytics

### API Endpoints Summary
| Service      | Endpoints | Base Path       |
|--------------|-----------|-----------------|
| Authentication | 12        | `/api/auth`     |
| Shops         | 15        | `/api/shops`    |
| Orders        | 8         | `/api/orders`   |
| Customers     | 12        | `/api/customers`|
| Payments      | 2         | `/api/payments` |
| Admin         | 10        | `/api/admin`    |
| Gateway       | 2         | `/api/gateway`  |
| Ledger        | 6         | `/api/ledger`   |

---

## 🛠️ Development Setup

### Prerequisites
- Node.js 18+
- npm 9+
- PostgreSQL 14+
- Redis 7+
- Docker (optional)

### Installation
```bash
# Install dependencies
npm install

# Set up database
npx prisma db push

# Generate Prisma client
npx prisma generate

# Seed test data (optional)
npm run seed
```

### Environment Variables
Create `.env` file from `.env.example`:
```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/kirata"

# Authentication
JWT_SECRET="your_jwt_secret"
JWT_EXPIRES_IN="30d"
REFRESH_TOKEN_SECRET="your_refresh_secret"
REFRESH_TOKEN_EXPIRES_IN="90d"

# Cloudinary
CLOUDINARY_CLOUD_NAME="your_cloud_name"
CLOUDINARY_API_KEY="your_api_key"
CLOUDINARY_API_SECRET="your_api_secret"

# Payment Gateway
RAZORPAY_KEY_ID="your_key_id"
RAZORPAY_KEY_SECRET="your_key_secret"

# Google Maps
GOOGLE_MAPS_API_KEY="your_api_key"

# Server
PORT=3000
FRONTEND_URL="http://localhost:3000"
```

---

## 🚀 Running the Application

### Development Mode
```bash
# Start development server with hot reload
npm run dev

# Start with PM2 (production-like)
npm run start:dev
```

### Production Mode
```bash
# Build for production
npm run build

# Start production server
npm start

# Start with PM2
npm run start:prod
```

### Testing
```bash
# Run all tests
npm test

# Run unit tests
npm run test:unit

# Run integration tests
npm run test:integration

# Run with coverage
npm run test:coverage
```

---

## 📊 Database Schema

### Core Models
- **User**: Base user model (Admin, Shopkeeper, Customer)
- **Shop**: Shop information and settings
- **Order**: Customer orders
- **LedgerEntry**: Financial transactions
- **Review**: Shop reviews and ratings
- **Payment**: Payment records
- **Media**: Uploaded files and images

### Relationships
```mermaid
erDiagram
    User ||--o{ Shop : "owns"
    Shop ||--o{ Order : "receives"
    Shop ||--o{ Review : "has"
    User ||--o{ Order : "places"
    Shop ||--o{ LedgerEntry : "records"
    User ||--o{ LedgerEntry : "participates"
    Order ||--o{ Payment : "has"
```

---

## 🔒 Authentication System

### Features
- ✅ **JWT Tokens**: Secure stateless authentication
- ✅ **OTP Verification**: Phone/email based OTP
- ✅ **Role-Based Access**: Fine-grained permissions
- ✅ **Session Management**: Multi-device control
- ✅ **Password Reset**: Secure password recovery
- ✅ **Account Lockout**: Security protection

### Supported Roles
- **SUPER_ADMIN**: Full system access
- **SHOP_MANAGER_ADMIN**: Shop management
- **SUPPORT_ADMIN**: Customer support
- **SHOPKEEPER**: Shop owner
- **CUSTOMER**: End user

---

## 📈 Performance Optimization

### Caching
- ✅ **Redis Caching**: Frequent queries cached
- ✅ **Response Caching**: API response caching
- ✅ **Rate Limiting**: 1000 requests/15 minutes

### Database
- ✅ **Indexing**: Optimized query performance
- ✅ **Connection Pooling**: Efficient connections
- ✅ **Query Optimization**: Analyzed and optimized

### Security
- ✅ **Helmet**: Security headers
- ✅ **CORS**: Strict origin policies
- ✅ **CSRF Protection**: Anti-CSRF tokens
- ✅ **Input Validation**: Comprehensive validation

---

## 🎯 API Design Principles

### RESTful Design
- ✅ **Resource-Oriented**: Clear resource naming
- ✅ **HTTP Methods**: Proper method usage
- ✅ **Status Codes**: Appropriate HTTP codes
- ✅ **HATEOAS**: Hypermedia controls

### Response Format
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful",
  "timestamp": "2026-01-08T00:55:00.000Z"
}
```

### Error Format
```json
{
  "success": false,
  "error": "Error type",
  "message": "Error description",
  "details": { ... },
  "timestamp": "2026-01-08T00:55:00.000Z"
}
```

---

## 🤝 Integration Examples

### JavaScript/TypeScript
```javascript
// Authentication
const login = async (phone, password) => {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone, password })
  });
  return await response.json();
};

// Shop Operations
const getShop = async (token) => {
  const response = await fetch('/api/shops/my', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return await response.json();
};
```

### Python
```python
import requests

# Authentication
def login(phone, password):
    response = requests.post(
        'http://localhost:3000/api/auth/login',
        json={'phone': phone, 'password': password}
    )
    return response.json()

# Shop Operations
def get_shop(token):
    headers = {'Authorization': f'Bearer {token}'}
    response = requests.get(
        'http://localhost:3000/api/shops/my',
        headers=headers
    )
    return response.json()
```

---

## 🚢 Deployment

### Docker Deployment
```bash
# Build Docker image
docker build -t kirata-backend .

# Run with Docker
docker run -p 3000:3000 kirata-backend

# Docker Compose
docker-compose up -d
```

### Cloud Deployment
```bash
# AWS ECS/EKS
aws ecs create-service --cli-input-json file://ecs-service.json

# Heroku
heroku create kirata-backend
git push heroku main

# Vercel (for serverless)
vercel --prod
```

---

## 📝 Best Practices

### Code Quality
- ✅ **TypeScript**: Full type safety
- ✅ **ESLint**: Code linting
- ✅ **Prettier**: Code formatting
- ✅ **Tests**: Comprehensive test coverage

### Security
- ✅ **Input Validation**: Validate all inputs
- ✅ **Error Handling**: Proper error handling
- ✅ **Logging**: Comprehensive logging
- ✅ **Secrets Management**: Secure secrets

### Performance
- ✅ **Caching**: Use caching appropriately
- ✅ **Database Optimization**: Optimize queries
- ✅ **Connection Management**: Manage connections
- ✅ **Memory Management**: Monitor memory usage

---

## 🎉 Quick Links

- **[API Documentation](./docs/api/README.md)** - Complete API reference
- **[Setup Guide](./docs/setup/README.md)** - Installation instructions
- **[Deployment Guide](./docs/deployment/README.md)** - Production deployment
- **[Features Guide](./docs/features/README.md)** - Feature documentation

---

**Version**: 1.0.0
**Last Updated**: 2026-01-08
**Status**: 🚀 Production Ready
**Maintainer**: Yogesh Kumar Saini

---

> "Powering local businesses with robust backend technology" - Kirata Team