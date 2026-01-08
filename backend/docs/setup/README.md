# Setup Guide

## Prerequisites

- **Node.js** >= 16.x
- **PostgreSQL** >= 13.x
- **Redis** (optional, for caching)
- **npm** or **yarn**

## Installation Steps

### 1. Clone Repository
```bash
git clone <repository-url>
cd Kirata
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration

Create `.env` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/kirata"

# JWT
JWT_SECRET="your-super-secret-jwt-key-change-this"

# Google Maps API (for geocoding)
GOOGLE_MAPS_API_KEY="your-google-maps-api-key"

# Cloudinary (for image storage)
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

# Redis (optional)
REDIS_URL="redis://localhost:6379"

# Server
PORT=3000
NODE_ENV=development
```

### 4. Database Setup

```bash
# Generate Prisma Client
npx prisma generate

# Push schema to database
npx prisma db push

# (Optional) Seed database
npx prisma db seed
```

### 5. Build Application

```bash
npm run build
```

### 6. Start Server

**Development:**
```bash
npm run dev
```

**Production:**
```bash
npm start
```

## Verification

Test the installation:

```bash
# Run feature tests
npx ts-node test-features.ts

# Run route tests
npx ts-node test-routes.ts

# Check health endpoint
curl http://localhost:3000/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2024-01-04T10:00:00.000Z"
}
```

## Troubleshooting

### Database Connection Issues
- Verify PostgreSQL is running
- Check DATABASE_URL format
- Ensure database exists

### Prisma Client Errors
```bash
npx prisma generate
```

### Build Errors
```bash
rm -rf node_modules
npm install
npm run build
```

### Port Already in Use
Change PORT in `.env` or kill the process:
```bash
lsof -ti:3000 | xargs kill
```

## Next Steps

- [API Documentation](../api/README.md)
- [Features Guide](../features/README.md)
- [Deployment Guide](../deployment/README.md)
