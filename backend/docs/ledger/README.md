# Ledger Service Documentation

## Overview
The Ledger Service records financial transactions, specifically **Sales** and **Udhaar (Credit)** management. It serves as digital bookkeeping for Shopkeepers.

## System Design
- **Flexible Payments**: Supports `CASH`, `UPI`, and `UDHAAR`.
- **Udhaar Logic**:
    - If `paymentType` is `UDHAAR`, a `customerId` is MANDATORY.
    - Creates entries in `Udhaar` table linked to the Sale.
- **Single Source of Truth**: Balance is calculated by aggregating `Udhaar` entries (though currently it might be a simple sum query).

---

## API Routes & Examples

### 1. Record Sale
**Description**: Record a new sale transaction.

**Endpoint**: `POST /api/ledger/sale`
**Header**: `Authorization: Bearer <token>` (Role: SHOPKEEPER)

**Input (JSON) - Cash Sale**:
```json
{
  "amount": 100,
  "paymentType": "CASH",
  "source": "MANUAL", 
  "customerId": "optional-uuid"
}
```

**Input (JSON) - Udhaar Sale**:
```json
{
  "amount": 500,
  "paymentType": "UDHAAR",
  "source": "MANUAL",
  "customerId": "uuid-string-of-customer" // REQUIRED for Udhaar
}
```

**Output (JSON)**:
```json
{
  "saleId": "uuid-string",
  "amount": "500",
  "paymentType": "UDHAAR",
  "createdAt": "..."
}
```

### 2. Get Customer Balance
**Description**: Get the current Udhaar balance for a specific customer.

**Endpoint**: `GET /api/ledger/balance/:customerId`
**Header**: `Authorization: Bearer <token>` (Role: SHOPKEEPER)

**Output (JSON)**:
```json
{
  "balance": 500
}
```
