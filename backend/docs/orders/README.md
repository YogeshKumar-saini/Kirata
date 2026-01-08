# Order Service Documentation

## Overview
The Order Service manages the lifecycle of orders placed by Customers to Shops. It handles creation, retrieval, and status updates.

## System Design
- **Relationship**: An Order links a `Customer` to a `Shop`.
- **Items**: Stored as a JSON object (`items` column) for flexibility.
- **Status Workflow**: PENDING -> ACCEPTED -> READY -> COLLECTED (or CANCELLED).
- **Soft Deletes**: Supports `deletedAt` for history preservation.

---

## API Routes & Examples

### 1. Create Order
**Description**: Create a new order as a customer.

**Endpoint**: `POST /api/orders`
**Header**: `Authorization: Bearer <token>` (Role: CUSTOMER)

**Input (JSON)**:
```json
{
  "shopId": "uuid-string-of-shop",
  "items": [
    { "name": "Rice", "qty": "1kg", "price": 50 },
    { "name": "Sugar", "qty": "500g" }
  ]
}
```

**Output (JSON)**:
```json
{
  "orderId": "uuid-string",
  "shopId": "uuid-string-of-shop",
  "customerId": "uuid-string-of-customer",
  "status": "PENDING",
  "items": [...],
  "createdAt": "2024-01-01T10:00:00.000Z"
}
```

### 2. Get My Orders
**Description**: Get all orders placed by the logged-in customer.

**Endpoint**: `GET /api/orders/my`
**Header**: `Authorization: Bearer <token>` (Role: CUSTOMER)

**Output (JSON)**:
```json
[
  {
    "orderId": "uuid-string",
    "shopId": "uuid-string",
    "shop": { "name": "Ramesh Any Store" },
    "status": "PENDING",
    "createdAt": "..."
  }
]
```

### 3. Update Order Status
**Description**: Update the status of an order (Shopkeeper/Admin).

**Endpoint**: `PATCH /api/orders/:orderId/status`
**Header**: `Authorization: Bearer <token>` (Role: SHOPKEEPER / ADMIN)

**Input (JSON)**:
```json
{
  "status": "ACCEPTED" 
}
// Statuses: PENDING, ACCEPTED, READY, COLLECTED, CANCELLED
```

**Output (JSON)**:
```json
{
  "orderId": "uuid-string",
  "status": "ACCEPTED",
  "updatedAt": "..."
}
```
