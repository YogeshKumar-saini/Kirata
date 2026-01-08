# Customer Service Documentation

## Overview
The Customer Service provides comprehensive APIs for customer users to manage their profile, view shops, access ledger information, place orders, and manage transactions.

## System Design

### User Context
- **Role**: CUSTOMER
- **Authentication**: All routes require JWT authentication with CUSTOMER role
- **Scope**: Customer-specific data only (no cross-customer access)

### Key Features
- Dashboard with personalized information
- Shop discovery and browsing
- Ledger tracking with shops
- Order management
- Transaction history
- Payment processing
- Review system

---

## API Routes & Examples

### 1. Customer Dashboard
**Description**: Get personalized dashboard with summary information.

**Endpoint**: `GET /api/customers/dashboard`
**Headers**: `Authorization: Bearer <token>` (Role: CUSTOMER)

**Output (JSON)**:
```json
{
  "totalShops": 15,
  "totalOrders": 8,
  "totalTransactions": 12,
  "totalBalance": 1500.00,
  "recentActivity": [
    {
      "type": "ORDER",
      "shopId": "shop-uuid",
      "shopName": "Ramesh Kirana",
      "amount": 250.00,
      "date": "2026-01-04T10:30:00.000Z"
    }
  ]
}
```

---

### 2. Get Shops
**Description**: Get list of shops available to the customer.

**Endpoint**: `GET /api/customers/shops`
**Headers**: `Authorization: Bearer <token>` (Role: CUSTOMER)

**Query Parameters**:
- `category`: Filter by shop category (GROCERY, MEDICAL, HARDWARE, OTHER)
- `search`: Search text for shop name
- `lat`, `lng`, `radius`: Location-based filtering

**Output (JSON)**:
```json
{
  "shops": [
    {
      "shopId": "shop-uuid",
      "name": "Ramesh Kirana Store",
      "category": "GROCERY",
      "distance": 1.2,
      "averageRating": 4.5,
      "isOpen": true
    }
  ],
  "total": 15,
  "page": 1,
  "limit": 10
}
```

---

### 3. Get Shop Ledger
**Description**: Get ledger information for a specific shop.

**Endpoint**: `GET /api/customers/shops/:shopId/ledger`
**Headers**: `Authorization: Bearer <token>` (Role: CUSTOMER)

**Output (JSON)**:
```json
{
  "shopId": "shop-uuid",
  "shopName": "Ramesh Kirana Store",
  "balance": 1500.00,
  "transactions": [
    {
      "transactionId": "txn-uuid",
      "type": "SALE",
      "amount": 250.00,
      "date": "2026-01-04T10:30:00.000Z",
      "description": "Grocery purchase"
    }
  ]
}
```

---

### 4. Get Orders
**Description**: Get customer's order history.

**Endpoint**: `GET /api/customers/orders`
**Headers**: `Authorization: Bearer <token>` (Role: CUSTOMER)

**Query Parameters**:
- `status`: Filter by order status (PENDING, ACCEPTED, COMPLETED, CANCELLED)
- `shopId`: Filter by specific shop
- `page`, `limit`: Pagination

**Output (JSON)**:
```json
{
  "orders": [
    {
      "orderId": "order-uuid",
      "shopId": "shop-uuid",
      "shopName": "Ramesh Kirana Store",
      "status": "COMPLETED",
      "totalAmount": 250.00,
      "items": [
        {
          "name": "Milk",
          "quantity": 2,
          "price": 50.00
        }
      ],
      "createdAt": "2026-01-04T10:30:00.000Z",
      "updatedAt": "2026-01-04T11:00:00.000Z"
    }
  ],
  "total": 8,
  "page": 1,
  "limit": 10
}
```

---

### 5. Get Analytics
**Description**: Get customer's shopping analytics.

**Endpoint**: `GET /api/customers/analytics`
**Headers**: `Authorization: Bearer <token>` (Role: CUSTOMER)

**Query Parameters**:
- `days`: Time period in days (default: 30)

**Output (JSON)**:
```json
{
  "totalSpent": 5000.00,
  "totalOrders": 8,
  "averageOrderValue": 625.00,
  "favoriteCategories": [
    {
      "category": "GROCERY",
      "spent": 3000.00,
      "percentage": 60
    }
  ],
  "monthlyTrend": [
    {
      "month": "2026-01",
      "spent": 1500.00,
      "orders": 3
    }
  ]
}
```

---

### 6. Get Transactions
**Description**: Get customer's transaction history.

**Endpoint**: `GET /api/customers/transactions`
**Headers**: `Authorization: Bearer <token>` (Role: CUSTOMER)

**Query Parameters**:
- `shopId`: Filter by specific shop
- `type`: Filter by transaction type (SALE, PAYMENT, REFUND)
- `page`, `limit`: Pagination

**Output (JSON)**:
```json
{
  "transactions": [
    {
      "transactionId": "txn-uuid",
      "shopId": "shop-uuid",
      "shopName": "Ramesh Kirana Store",
      "type": "SALE",
      "amount": 250.00,
      "balanceAfter": 1500.00,
      "description": "Grocery purchase",
      "createdAt": "2026-01-04T10:30:00.000Z"
    }
  ],
  "total": 12,
  "page": 1,
  "limit": 10
}
```

---

### 7. Get Transaction Receipt
**Description**: Get detailed receipt for a specific transaction.

**Endpoint**: `GET /api/customers/transactions/:transactionId/receipt`
**Headers**: `Authorization: Bearer <token>` (Role: CUSTOMER)

**Output (JSON)**:
```json
{
  "transactionId": "txn-uuid",
  "shopId": "shop-uuid",
  "shopName": "Ramesh Kirana Store",
  "shopAddress": "Shop No. 45, Main Market, Gurgaon",
  "shopPhone": "+919999999999",
  "customerName": "John Doe",
  "customerPhone": "+918888888888",
  "type": "SALE",
  "amount": 250.00,
  "items": [
    {
      "name": "Milk",
      "quantity": 2,
      "price": 50.00,
      "total": 100.00
    },
    {
      "name": "Bread",
      "quantity": 1,
      "price": 40.00,
      "total": 40.00
    }
  ],
  "subtotal": 140.00,
  "tax": 10.00,
  "total": 150.00,
  "paymentMethod": "CASH",
  "createdAt": "2026-01-04T10:30:00.000Z",
  "receiptNumber": "RCPT-20260104-001"
}
```

---

### 8. Export Shop Ledger
**Description**: Export ledger data for a specific shop in CSV format.

**Endpoint**: `GET /api/customers/shops/:shopId/export`
**Headers**: `Authorization: Bearer <token>` (Role: CUSTOMER)

**Query Parameters**:
- `format`: Export format (CSV, PDF) - default: CSV
- `startDate`, `endDate`: Date range filter

**Response**: Downloadable CSV file with ledger data

---

### 9. Get UPI Payment Intent
**Description**: Generate UPI payment intent for a shop.

**Endpoint**: `POST /api/customers/shops/:shopId/pay/upi`
**Headers**: `Authorization: Bearer <token>` (Role: CUSTOMER)

**Input (JSON)**:
```json
{
  "amount": 250.00,
  "orderId": "order-uuid",
  "description": "Payment for grocery order"
}
```

**Output (JSON)**:
```json
{
  "upiIntentId": "upi-intent-uuid",
  "amount": 250.00,
  "currency": "INR",
  "shopId": "shop-uuid",
  "shopName": "Ramesh Kirana Store",
  "customerId": "customer-uuid",
  "customerName": "John Doe",
  "upiId": "rameshkirana@upi",
  "qrCodeUrl": "https://api.kirata.com/upi/qr/upi-intent-uuid",
  "expiresAt": "2026-01-04T11:00:00.000Z"
}
```

---

### 10. Record Payment
**Description**: Record a payment made to a shop.

**Endpoint**: `POST /api/customers/shops/:shopId/payments`
**Headers**: `Authorization: Bearer <token>` (Role: CUSTOMER)

**Input (JSON)**:
```json
{
  "amount": 250.00,
  "paymentMethod": "UPI",
  "transactionId": "upi-txn-uuid",
  "orderId": "order-uuid",
  "description": "Payment for grocery order"
}
```

**Output (JSON)**:
```json
{
  "paymentId": "payment-uuid",
  "amount": 250.00,
  "paymentMethod": "UPI",
  "status": "COMPLETED",
  "transactionId": "upi-txn-uuid",
  "orderId": "order-uuid",
  "createdAt": "2026-01-04T10:30:00.000Z"
}
```

---

### 11. Create Review
**Description**: Create a review for a shop.

**Endpoint**: `POST /api/customers/shops/:shopId/reviews`
**Headers**: `Authorization: Bearer <token>` (Role: CUSTOMER)

**Input (JSON)**:
```json
{
  "rating": 5,
  "comment": "Great service and quality products!",
  "images": ["image-url-1", "image-url-2"]
}
```

**Output (JSON)**:
```json
{
  "reviewId": "review-uuid",
  "shopId": "shop-uuid",
  "customerId": "customer-uuid",
  "rating": 5,
  "comment": "Great service and quality products!",
  "images": ["image-url-1", "image-url-2"],
  "createdAt": "2026-01-04T10:30:00.000Z"
}
```

---

### 12. Update Profile
**Description**: Update customer profile information.

**Endpoint**: `PATCH /api/customers/profile`
**Headers**: `Authorization: Bearer <token>` (Role: CUSTOMER)

**Input (JSON)**:
```json
{
  "name": "John Doe",
  "address": "123 Main Street, Apt 4B",
  "city": "Mumbai",
  "state": "Maharashtra",
  "pincode": "400001",
  "phone": "+918888888888"
}
```

**Output (JSON)**:
```json
{
  "message": "Profile updated successfully",
  "customer": {
    "id": "customer-uuid",
    "name": "John Doe",
    "phone": "+918888888888",
    "email": "john@example.com",
    "address": "123 Main Street, Apt 4B",
    "city": "Mumbai",
    "state": "Maharashtra",
    "pincode": "400001"
  }
}
```

---

## Error Responses

### 401 Unauthorized
```json
{
  "error": "Unauthorized",
  "message": "Invalid or expired token"
}
```

### 403 Forbidden
```json
{
  "error": "Forbidden",
  "message": "Customer role required"
}
```

### 404 Not Found
```json
{
  "error": "Not Found",
  "message": "Shop not found"
}
```

### 400 Bad Request
```json
{
  "error": "Validation Error",
  "details": [
    {
      "field": "amount",
      "message": "Amount must be positive"
    }
  ]
}
```

---

## Key Features

### ✅ Comprehensive Dashboard
- Personalized summary information
- Recent activity tracking
- Quick access to key metrics

### ✅ Shop Discovery
- Category filtering
- Location-based search
- Search functionality

### ✅ Ledger Management
- Balance tracking
- Transaction history
- Detailed receipts

### ✅ Order Management
- Full order history
- Status tracking
- Itemized details

### ✅ Analytics
- Spending analysis
- Category breakdown
- Monthly trends

### ✅ Payment Processing
- UPI integration
- Multiple payment methods
- Secure transaction recording

### ✅ Review System
- Rating and comments
- Image uploads
- Shop feedback

### ✅ Profile Management
- Personal information updates
- Address management
- Contact details

---

## Usage Examples

### Complete Customer Workflow

```bash
# 1. Get Dashboard
GET /api/customers/dashboard

# 2. Discover Shops
GET /api/customers/shops?category=GROCERY&lat=19.07&lng=72.87&radius=5

# 3. View Shop Ledger
GET /api/customers/shops/shop-uuid/ledger

# 4. Place Order (via Orders API)
POST /api/orders

# 5. Get UPI Payment Intent
POST /api/customers/shops/shop-uuid/pay/upi
{
  "amount": 250.00,
  "orderId": "order-uuid"
}

# 6. Record Payment
POST /api/customers/shops/shop-uuid/payments
{
  "amount": 250.00,
  "paymentMethod": "UPI",
  "transactionId": "upi-txn-uuid"
}

# 7. Leave Review
POST /api/customers/shops/shop-uuid/reviews
{
  "rating": 5,
  "comment": "Excellent service!"
}

# 8. Update Profile
PATCH /api/customers/profile
{
  "name": "John Doe",
  "address": "123 Main Street"
}
```

---

## Security Considerations

### Authentication
- All routes require valid JWT token
- Role-based access control (CUSTOMER role only)
- Token validation on every request

### Data Privacy
- Customers can only access their own data
- No cross-customer data leakage
- Sensitive information protected

### Rate Limiting
- Standard rate limiting applies
- Prevents abuse and brute force attacks

---

## Integration Notes

### Frontend Integration
```javascript
// Example: Get customer dashboard
const fetchDashboard = async () => {
  const response = await fetch('/api/customers/dashboard', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return await response.json();
};

// Example: Create review
const createReview = async (shopId, rating, comment) => {
  const response = await fetch(`/api/customers/shops/${shopId}/reviews`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ rating, comment })
  });
  return await response.json();
};
```

### Mobile Integration
```kotlin
// Android example
val client = OkHttpClient()
val request = Request.Builder()
    .url("https://api.kirata.com/api/customers/dashboard")
    .header("Authorization", "Bearer $token")
    .build()

val response = client.newCall(request).execute()
```

---

## Performance Considerations

### Pagination
- Use `page` and `limit` parameters for large datasets
- Default limit: 10 items per page
- Maximum limit: 100 items per page

### Caching
- Dashboard data cached for 5 minutes
- Shop lists cached for 15 minutes
- Transaction data not cached (real-time)

### Optimization
- Location-based queries use spatial indexes
- Frequently accessed data preloaded
- Minimal payload sizes

---

**Last Updated:** 2026-01-08
**Version:** 1.0.0
**Status:** Production Ready ✅