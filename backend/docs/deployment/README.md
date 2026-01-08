# Deployment Guide

Production deployment guide for Kirata Shop Management System.

## 🚀 Pre-Deployment Checklist

### Code
- [ ] All tests passing
- [ ] Build successful (`npm run build`)
- [ ] No TypeScript errors
- [ ] Environment variables configured

### Database
- [ ] Production database created
- [ ] Migrations applied
- [ ] Indexes created
- [ ] Backup strategy in place

### Services
- [ ] Cloudinary account configured
- [ ] Google Maps API key obtained
- [ ] Redis instance ready (optional)
- [ ] Email service configured (if applicable)

### Security
- [ ] Strong JWT secret
- [ ] HTTPS enabled
- [ ] CORS configured
- [ ] Rate limiting enabled

---

## 🔧 Environment Variables

### Required Variables

```env
# Database
DATABASE_URL="postgresql://user:password@host:5432/kirata"

# JWT
JWT_SECRET="your-super-secret-jwt-key-min-32-characters"

# Google Maps
GOOGLE_MAPS_API_KEY="your-google-maps-api-key"

# Cloudinary
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

# Server
PORT=3000
NODE_ENV=production
```

### Optional Variables

```env
# Redis (for caching)
REDIS_URL="redis://user:password@host:6379"

# Logging
LOG_LEVEL="info"

# CORS
ALLOWED_ORIGINS="https://yourdomain.com,https://www.yourdomain.com"
```

---

## 🐳 Docker Deployment

### Dockerfile

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npx prisma generate
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

### docker-compose.yml

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://postgres:password@db:5432/kirata
      - REDIS_URL=redis://redis:6379
    depends_on:
      - db
      - redis

  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=kirata
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

### Deploy

```bash
docker-compose up -d
```

---

## ☁️ Cloud Platforms

### Heroku

```bash
# Login
heroku login

# Create app
heroku create kirata-app

# Add PostgreSQL
heroku addons:create heroku-postgresql:mini

# Add Redis (optional)
heroku addons:create heroku-redis:mini

# Set environment variables
heroku config:set JWT_SECRET="your-secret"
heroku config:set GOOGLE_MAPS_API_KEY="your-key"
heroku config:set CLOUDINARY_CLOUD_NAME="your-cloud"

# Deploy
git push heroku main

# Run migrations
heroku run npx prisma db push
```

### AWS EC2

1. **Launch EC2 Instance**
   - Ubuntu 22.04 LTS
   - t3.small or larger
   - Security group: Allow ports 22, 80, 443

2. **Install Dependencies**
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Install Redis (optional)
sudo apt install -y redis-server

# Install Nginx
sudo apt install -y nginx
```

3. **Setup Application**
```bash
# Clone repository
git clone <your-repo>
cd kirata

# Install dependencies
npm install

# Build
npm run build

# Setup PM2
sudo npm install -g pm2
pm2 start dist/index.js --name kirata
pm2 startup
pm2 save
```

4. **Configure Nginx**
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Vercel/Railway

```bash
# Install CLI
npm i -g vercel

# Deploy
vercel --prod
```

---

## 🔒 Security Best Practices

### SSL/TLS
- Use Let's Encrypt for free SSL
- Enforce HTTPS
- Set HSTS headers

### Environment Variables
- Never commit `.env` to git
- Use secrets management
- Rotate credentials regularly

### Database
- Use strong passwords
- Enable SSL connections
- Regular backups
- Restrict IP access

### Application
- Keep dependencies updated
- Enable rate limiting
- Use helmet middleware
- Validate all inputs

---

## 📊 Monitoring

### Application Monitoring
- **PM2:** Process monitoring
- **New Relic:** APM
- **Sentry:** Error tracking
- **LogRocket:** Session replay

### Infrastructure Monitoring
- **CloudWatch:** AWS metrics
- **Datadog:** Full-stack monitoring
- **Prometheus + Grafana:** Custom metrics

### Logging
```javascript
// Use structured logging
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});
```

---

## 🔄 CI/CD Pipeline

### GitHub Actions

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm test
      
      - name: Build
        run: npm run build
      
      - name: Deploy to production
        run: |
          # Your deployment script
```

---

## 📦 Database Migrations

### Production Migration Strategy

```bash
# 1. Backup database
pg_dump $DATABASE_URL > backup.sql

# 2. Test migration locally
npx prisma db push --preview-feature

# 3. Apply to production
npx prisma db push

# 4. Verify
npx prisma db pull
```

### Rollback Plan
```bash
# Restore from backup
psql $DATABASE_URL < backup.sql
```

---

## 🔍 Health Checks

### Endpoint
```http
GET /health
```

### Response
```json
{
  "status": "ok",
  "timestamp": "2024-01-04T10:00:00.000Z",
  "database": "connected",
  "redis": "connected"
}
```

### Monitoring
- Set up alerts for health check failures
- Monitor response times
- Track error rates

---

## 📈 Scaling

### Horizontal Scaling
- Load balancer (Nginx/AWS ALB)
- Multiple app instances
- Session management (Redis)
- Database read replicas

### Vertical Scaling
- Increase server resources
- Optimize database queries
- Enable caching
- CDN for static assets

---

## 🆘 Troubleshooting

### Common Issues

**Database Connection**
```bash
# Check connection
psql $DATABASE_URL

# Verify credentials
echo $DATABASE_URL
```

**Build Failures**
```bash
# Clear cache
rm -rf node_modules dist
npm install
npm run build
```

**Memory Issues**
```bash
# Increase Node.js memory
NODE_OPTIONS="--max-old-space-size=4096" npm start
```

---

## 📞 Support

For deployment issues:
1. Check logs: `pm2 logs kirata`
2. Review error tracking (Sentry)
3. Contact DevOps team

---

## Next Steps

- [Setup Guide](../setup/README.md)
- [API Reference](../api/README.md)
- [Features Guide](../features/README.md)
