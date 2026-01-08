# Kirata API Reference

Base URL: `http://localhost:3000/api`

## Table of Contents
- [Authentication](#authentication)
- [Shops](#shops)
- [Orders](#orders)
- [Ledger](#ledger)
- [Analytics](#analytics)
- [Reviews](#reviews)
- [Media](#media)
- [Export](#export)
- [Admin](#admin)
- [Customers](#customers)
- [Gateway](#gateway)
- [Payments](#payments)
- [**New: Shopkeeper Features Guide**](../SHOPKEEPER_FEATURES.md)

---

## Authentication

### Register Shopkeeper
`POST /shopkeeper/register`

**Request:**
```json
{
  "phone": "+919876543210",
  "email": "shopkeeper@test.com",
  "name": "John Doe"
}
```

**Response:**
```json
{
  "message": "User registered successfully",
  "user": { "id": "uuid", "uniqueId": "johndoe123", "role": "SHOPKEEPER" }
}
```

### Register Customer
`POST /customer/register`
_(Same format as Shopkeeper)_

### Login (Unified)
`POST /auth/login`

**Request (Password):**
```json
{
  "phone": "+919876543210",
  "password": "SecretPassword123"
}
```
**Request (OTP):**
```json
{
  "phone": "+919876543210",
  "otp": "123456"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "token": "jwt.token.string",
  "refreshToken": "refresh.token.string",
  "user": { ... }
}
```

### Get Profile
`GET /me`
Headers: `Authorization: Bearer <token>`

---

## Shops

Base Path: `/shops`

### Create Shop
`POST /`
Headers: `Authorization: Bearer <token>`

**Request:**
```json
{
  "name": "My Super Store",
  "category": "GROCERY",
  "phone": "+919876543210",
  "addressLine1": "123 Market St",
  "city": "Mumbai",
  "state": "Maharashtra",
  "pincode": "400001",
  "latitude": 19.0760,
  "longitude": 72.8777
}
```

### Get My Shop
`GET /my`

### Update Shop
`PATCH /my`

**Request:**
```json
{
  "name": "Updated Store Name",
  "deliveryAvailable": true,
  "minOrderAmount": 500
}
```

### Search Shops (Public)
`GET /search?lat=19.07&lng=72.87&radius=5&category=GROCERY`

**Response:**
```json
[
  {
    "shopId": "uuid",
    "name": "My Super Store",
    "distance": 1.2,
    "averageRating": 4.5
  }
]
```

### Get Nearby Shops (Public)
`GET /nearby?lat=19.07&lng=72.87&radius=2`

---

## Orders

Base Path: `/orders`

### Create Order (Customer)
`POST /`

**Request:**
```json
{
  "shopId": "shop-uuid",
  "items": [
    { "name": "Milk", "quantity": 2, "price": 50 },
    { "name": "Bread", "quantity": 1, "price": 40 }
  ]
}
```

### Get My Orders (Customer)
`GET /my`

### Get Shop Orders (Shopkeeper)
`GET /shop/my`

### Update Order Status (Shopkeeper)
`PATCH /:orderId/status`

**Request:**
```json
{
  "status": "ACCEPTED" 
}
```
_(Statuses: PENDING, ACCEPTED, REJECTED, READY, COMPLETED, CANCELLED)_

---

## Ledger

Base Path: `/ledger`

### Record Sale (Shopkeeper)
`POST /sale`

**Request:**
```json
{
  "amount": 150.00,
  "paymentType": "CASH",
  "source": "MANUAL",
  "customerId": "optional-customer-uuid"
}
```

### Get Customer Balance (Shopkeeper)
`GET /balance/:customerId`

**Response:**
```json
{
  "balance": 500.00
}
```

### Get My Balance (Customer)
`GET /shop/:shopId/balance`

**Response:**
```json
{
  "balance": 150.00
}
```

---

## Media

Base Path: `/media`

### Upload Logo
`POST /logo`
Content-Type: `multipart/form-data`
Field: `logo` (file)

**Response:**
```json
{
  "message": "Logo uploaded successfully",
  "logoUrl": "https://res.cloudinary.com/cloudname/image/upload/v12345/shops/uuid/logo.webp"
}
```

### Upload Photos
`POST /photos`
Content-Type: `multipart/form-data`
Field: `photos` (multiple files, max 10)

**Response:**
```json
{
  "message": "3 photos uploaded successfully",
  "photoUrls": [
    "https://res.cloudinary.com/cloudname/image/upload/v12345/shops/uuid/photos/img1.webp",
    "https://res.cloudinary.com/cloudname/image/upload/v12345/shops/uuid/photos/img2.webp"
  ],
  "totalPhotos": 3
}
```

---

## Analytics

Base Path: `/analytics`

### Get Shop Analytics
`GET /my?days=30`

**Response:**
```json
{
  "totalOrders": 150,
  "totalRevenue": 75000,
  "totalViews": 1200,
  "dailyStats": [ ... ]
}
```

---

## Export

Base Path: `/export`

### Export Data (CSV)
- `GET /orders`
- `GET /analytics`
- `GET /reviews`

Response is a downloadable CSV file.

---

## Reviews

Base Path: `/reviews`

### Create Review (Customer)
`POST /shop/:shopId`

**Request:**
```json
{
  "rating": 5,
  "comment": "Great service!",
  "images": ["url1", "url2"]
}
```

### Get Shop Reviews (Public)
`GET /shop/:shopId`

---

## Customers

Base Path: `/customers`

### Customer Dashboard
`GET /dashboard`

### Get Shops
`GET /shops`

### Get Shop Ledger
`GET /shops/:shopId/ledger`

### Get Orders
`GET /orders`

### Get Analytics
`GET /analytics`

### Get Transactions
`GET /transactions`

### Get Transaction Receipt
`GET /transactions/:transactionId/receipt`

### Export Shop Ledger
`GET /shops/:shopId/export`

### Get UPI Payment Intent
`POST /shops/:shopId/pay/upi`

### Record Payment
`POST /shops/:shopId/payments`

### Create Review
`POST /shops/:shopId/reviews`

### Update Profile
`PATCH /profile`

---

## Gateway

Base Path: `/gateway`

### Webhook Verification
`GET /webhook`

### Webhook Handler
`POST /webhook`

---

## Payments

Base Path: `/payments`

### Create Payment Order
`POST /create-order`

### Verify Payment
`POST /verify`

---

## Admin

Base Path: `/admin`

### Get Pending Verifications
`GET /shops/pending`

### Verify Shop
`POST /shops/:shopId/verify`

**Request:**
```json
{ "notes": "Documents verified" }
```

### Reject Shop
`POST /shops/:shopId/reject`

**Request:**
```json
{ "reason": "Invalid license" }
```
