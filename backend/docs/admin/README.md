# Admin Service Documentation

## Overview
The Admin Service provides comprehensive administrative functionality for managing the Kirata platform, including user management, shop verification, system monitoring, and administrative operations.

## System Design

### Admin Roles
- **SUPER_ADMIN**: Full system access, user management, shop verification
- **SHOP_MANAGER_ADMIN**: Shop management and verification
- **SUPPORT_ADMIN**: Customer support and issue resolution

### Key Features
- Shop verification and management
- User account management
- System monitoring and analytics
- Reporting and exports
- Configuration management

---

## API Routes & Examples

### 1. Get Pending Verifications
**Description**: Get list of shops pending verification.

**Endpoint**: `GET /api/admin/shops/pending`
**Headers**: `Authorization: Bearer <token>` (Role: SUPER_ADMIN or SHOP_MANAGER_ADMIN)

**Query Parameters**:
- `status`: Filter by verification status (PENDING, APPROVED, REJECTED)
- `page`, `limit`: Pagination

**Output (JSON)**:
```json
{
  "shops": [
    {
      "shopId": "shop-uuid",
      "name": "Ramesh Kirana Store",
      "ownerName": "Ramesh Kumar",
      "ownerPhone": "+919999999999",
      "category": "GROCERY",
      "status": "PENDING",
      "createdAt": "2026-01-04T10:30:00.000Z",
      "documents": [
        {
          "type": "AADHAAR",
          "url": "https://storage.kirata.com/documents/shop-uuid/aadhaar.pdf",
          "verified": false
        }
      ]
    }
  ],
  "total": 5,
  "page": 1,
  "limit": 10
}
```

---

### 2. Verify Shop
**Description**: Approve a shop verification request.

**Endpoint**: `POST /api/admin/shops/:shopId/verify`
**Headers**: `Authorization: Bearer <token>` (Role: SUPER_ADMIN or SHOP_MANAGER_ADMIN)

**Input (JSON)**:
```json
{
  "notes": "All documents verified and valid",
  "verificationLevel": "FULL"
}
```

**Output (JSON)**:
```json
{
  "message": "Shop verified successfully",
  "shop": {
    "shopId": "shop-uuid",
    "name": "Ramesh Kirana Store",
    "status": "ACTIVE",
    "verifiedAt": "2026-01-08T00:50:00.000Z",
    "verificationNotes": "All documents verified and valid"
  }
}
```

---

### 3. Reject Shop
**Description**: Reject a shop verification request.

**Endpoint**: `POST /api/admin/shops/:shopId/reject`
**Headers**: `Authorization: Bearer <token>` (Role: SUPER_ADMIN or SHOP_MANAGER_ADMIN)

**Input (JSON)**:
```json
{
  "reason": "Invalid GST certificate",
  "notes": "Please upload valid GST certificate"
}
```

**Output (JSON)**:
```json
{
  "message": "Shop verification rejected",
  "shop": {
    "shopId": "shop-uuid",
    "name": "Ramesh Kirana Store",
    "status": "REJECTED",
    "rejectionReason": "Invalid GST certificate",
    "rejectionNotes": "Please upload valid GST certificate"
  }
}
```

---

### 4. Get Admin Dashboard
**Description**: Get comprehensive admin dashboard with system metrics.

**Endpoint**: `GET /api/admin/dashboard`
**Headers**: `Authorization: Bearer <token>` (Role: SUPER_ADMIN or SHOP_MANAGER_ADMIN)

**Output (JSON)**:
```json
{
  "totalShops": 150,
  "pendingVerifications": 5,
  "activeShops": 120,
  "totalUsers": 500,
  "totalOrders": 1500,
  "totalRevenue": 750000.00,
  "recentActivity": [
    {
      "type": "SHOP_VERIFICATION",
      "shopId": "shop-uuid",
      "shopName": "Ramesh Kirana Store",
      "adminName": "John Doe",
      "timestamp": "2026-01-08T00:45:00.000Z"
    }
  ]
}
```

---

### 5. Search Users
**Description**: Search for users across all roles.

**Endpoint**: `GET /api/admin/users/search`
**Headers**: `Authorization: Bearer <token>` (Role: SUPER_ADMIN)

**Query Parameters**:
- `query`: Search text (name, phone, email, uniqueId)
- `role`: Filter by role (ADMIN, SHOPKEEPER, CUSTOMER)
- `status`: Filter by status (ACTIVE, INACTIVE, PENDING)
- `page`, `limit`: Pagination

**Output (JSON)**:
```json
{
  "users": [
    {
      "userId": "user-uuid",
      "uniqueId": "ramesh123",
      "name": "Ramesh Kumar",
      "phone": "+919999999999",
      "email": "ramesh@example.com",
      "role": "SHOPKEEPER",
      "status": "ACTIVE",
      "createdAt": "2026-01-04T10:30:00.000Z"
    }
  ],
  "total": 50,
  "page": 1,
  "limit": 10
}
```

---

### 6. Get User Details
**Description**: Get detailed information about a specific user.

**Endpoint**: `GET /api/admin/users/:userId`
**Headers**: `Authorization: Bearer <token>` (Role: SUPER_ADMIN)

**Output (JSON)**:
```json
{
  "userId": "user-uuid",
  "uniqueId": "ramesh123",
  "name": "Ramesh Kumar",
  "phone": "+919999999999",
  "email": "ramesh@example.com",
  "role": "SHOPKEEPER",
  "status": "ACTIVE",
  "createdAt": "2026-01-04T10:30:00.000Z",
  "lastLogin": "2026-01-08T00:45:00.000Z",
  "sessions": [
    {
      "sessionId": "session-uuid",
      "device": "Android 12",
      "ipAddress": "192.168.1.100",
      "createdAt": "2026-01-08T00:45:00.000Z"
    }
  ],
  "shops": [
    {
      "shopId": "shop-uuid",
      "name": "Ramesh Kirana Store",
      "status": "ACTIVE"
    }
  ]
}
```

---

### 7. Update User Status
**Description**: Update user account status.

**Endpoint**: `PATCH /api/admin/users/:userId/status`
**Headers**: `Authorization: Bearer <token>` (Role: SUPER_ADMIN)

**Input (JSON)**:
```json
{
  "status": "INACTIVE",
  "reason": "Account suspended for policy violation"
}
```

**Output (JSON)**:
```json
{
  "message": "User status updated successfully",
  "user": {
    "userId": "user-uuid",
    "status": "INACTIVE",
    "statusReason": "Account suspended for policy violation",
    "updatedAt": "2026-01-08T00:50:00.000Z"
  }
}
```

---

### 8. Get System Analytics
**Description**: Get comprehensive system analytics.

**Endpoint**: `GET /api/admin/analytics`
**Headers**: `Authorization: Bearer <token>` (Role: SUPER_ADMIN)

**Query Parameters**:
- `period`: Time period (DAILY, WEEKLY, MONTHLY, QUARTERLY, YEARLY)
- `startDate`, `endDate`: Custom date range

**Output (JSON)**:
```json
{
  "period": "MONTHLY",
  "metrics": [
    {
      "month": "2026-01",
      "newShops": 15,
      "newUsers": 50,
      "totalOrders": 150,
      "totalRevenue": 75000.00,
      "activeShops": 120,
      "verificationRate": 95.2
    }
  ],
  "trends": {
    "shopGrowth": 12.5,
    "userGrowth": 8.3,
    "revenueGrowth": 15.2
  }
}
```

---

### 9. Export Data
**Description**: Export system data in CSV format.

**Endpoint**: `GET /api/admin/export/:type`
**Headers**: `Authorization: Bearer <token>` (Role: SUPER_ADMIN)

**Path Parameters**:
- `type`: Export type (shops, users, orders, transactions)

**Query Parameters**:
- `format`: Export format (CSV, JSON) - default: CSV
- `startDate`, `endDate`: Date range filter
- `status`: Filter by status

**Response**: Downloadable file with requested data

---

### 10. Get Verification Queue
**Description**: Get detailed verification queue with filtering.

**Endpoint**: `GET /api/admin/verification-queue`
**Headers**: `Authorization: Bearer <token>` (Role: SUPER_ADMIN or SHOP_MANAGER_ADMIN)

**Query Parameters**:
- `category`: Filter by shop category
- `priority`: Filter by priority (HIGH, MEDIUM, LOW)
- `assignedTo`: Filter by assigned admin

**Output (JSON)**:
```json
{
  "queue": [
    {
      "shopId": "shop-uuid",
      "name": "Ramesh Kirana Store",
      "priority": "HIGH",
      "assignedTo": "admin-uuid",
      "assignedAt": "2026-01-08T00:45:00.000Z",
      "documents": [
        {
          "type": "AADHAAR",
          "status": "PENDING",
          "reviewer": null
        }
      ]
    }
  ],
  "stats": {
    "total": 5,
    "highPriority": 2,
    "mediumPriority": 3,
    "lowPriority": 0
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
  "message": "SUPER_ADMIN role required"
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
      "field": "reason",
      "message": "Rejection reason is required"
    }
  ]
}
```

---

## Key Features

### ✅ Shop Verification
- Comprehensive document review
- Multi-stage verification process
- Priority queue management
- Assignment system

### ✅ User Management
- Cross-role user search
- Detailed user profiles
- Status management
- Session monitoring

### ✅ System Analytics
- Comprehensive metrics
- Growth trends
- Performance indicators
- Custom date ranges

### ✅ Data Export
- Multiple export formats
- Date range filtering
- Status filtering
- Large dataset handling

### ✅ Dashboard
- Real-time metrics
- Recent activity
- System health indicators
- Quick access to key functions

---

## Usage Examples

### Complete Admin Workflow

```bash
# 1. Get admin dashboard
GET /api/admin/dashboard

# 2. View pending verifications
GET /api/admin/shops/pending

# 3. Review shop details
GET /api/admin/shops/shop-uuid

# 4. Verify shop
POST /api/admin/shops/shop-uuid/verify
{
  "notes": "All documents valid"
}

# 5. Search for users
GET /api/admin/users/search?query=ramesh

# 6. Get system analytics
GET /api/admin/analytics?period=MONTHLY

# 7. Export shop data
GET /api/admin/export/shops?format=CSV
```

---

## Security Considerations

### Authentication
- All routes require valid JWT token
- Role-based access control (SUPER_ADMIN or SHOP_MANAGER_ADMIN)
- Token validation on every request

### Data Privacy
- Admins can only access data within their permissions
- Sensitive user data protected
- Audit logging for all administrative actions

### Rate Limiting
- Standard rate limiting applies
- Prevents abuse and brute force attacks

---

## Integration Notes

### Frontend Integration
```javascript
// Example: Get pending verifications
const getPendingVerifications = async () => {
  const response = await fetch('/api/admin/shops/pending', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return await response.json();
};

// Example: Verify shop
const verifyShop = async (shopId, notes) => {
  const response = await fetch(`/api/admin/shops/${shopId}/verify`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ notes })
  });
  return await response.json();
};
```

### Mobile Integration
```kotlin
// Android example
val client = OkHttpClient()
val request = Request.Builder()
    .url("https://api.kirata.com/api/admin/shops/pending")
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
- User lists cached for 15 minutes
- Verification queue not cached (real-time)

### Optimization
- Complex queries use database indexes
- Frequently accessed data preloaded
- Minimal payload sizes

---

**Last Updated:** 2026-01-08
**Version:** 1.0.0
**Status:** Production Ready ✅