# Shop Service Documentation

## Overview
The Shop Service allows Shopkeepers to manage their shop with comprehensive business details. **One shop per account** is enforced.

## System Design
- **One-to-One Relationship**: A `Shopkeeper` can create and own **ONE** `Shop`
- **Simplified API**: All endpoints use `/my` since only one shop exists
- **Soft Deletes**: Shops support soft deletion, allowing recreation
- **Categories**: GROCERY, MEDICAL, HARDWARE, OTHER
- **Status**: ACTIVE, TEMPORARILY_CLOSED, PERMANENTLY_CLOSED, PENDING_VERIFICATION
- **Profile Completion**: Tracks whether shop has all required fields filled

---

## API Routes & Examples

### 1. Create Shop (One-Time Only)
**Description**: Create your shop with comprehensive details. Can only be done once per account.

**Endpoint**: `POST /api/shops`
**Header**: `Authorization: Bearer <token>` (Role: SHOPKEEPER)

**Input (JSON)**:
```json
{
  "name": "Ramesh Kirana Store",
  "category": "GROCERY",
  
  // Address (Required)
  "addressLine1": "Shop No. 45, Main Market",
  "addressLine2": "Near HDFC Bank",
  "city": "Gurgaon",
  "state": "Haryana",
  "pincode": "122001",
  
  // GPS Coordinates (Optional)
  "latitude": 28.4595,
  "longitude": 77.0266,
  
  // Contact (At least one required)
  "phone": "+919999999999",
  "alternatePhone": "+918888888888",
  "email": "ramesh@gmail.com",
  "whatsappNumber": "+919999999999",
  
  // Business Details (Optional)
  "gstNumber": "07AAACR5055K1Z5",
  "businessHours": {
    "monday": {"open": "09:00", "close": "21:00"},
    "tuesday": {"open": "09:00", "close": "21:00"},
    "wednesday": {"open": "09:00", "close": "21:00"},
    "thursday": {"open": "09:00", "close": "21:00"},
    "friday": {"open": "09:00", "close": "21:00"},
    "saturday": {"open": "09:00", "close": "21:00"},
    "sunday": {"open": "10:00", "close": "20:00"}
  },
  
  // Delivery Settings (Optional)
  "deliveryAvailable": true,
  "deliveryRadius": 5.0,
  "minimumOrderAmount": 100.00,
  "deliveryCharge": 20.00
}
```

**Validation Rules**:
- `name`: 3-100 characters
- `category`: GROCERY | MEDICAL | HARDWARE | OTHER
- `addressLine1`: Required, 5-200 characters
- `city`, `state`: Required, 2-50 characters
- `pincode`: Required, 6 digits
- `latitude`: -90 to 90
- `longitude`: -180 to 180
- `phone`, `alternatePhone`, `whatsappNumber`: Format +91XXXXXXXXXX
- `email`: Valid email format
- `gstNumber`: Valid Indian GST format (optional)
- **At least one contact method** (phone, email, or WhatsApp) is required

**Output (JSON)**:
```json
{
  "shopId": "550e8400-e29b-41d4-a716-446655440000",
  "ownerId": "shopkeeper-uuid",
  "name": "Ramesh Kirana Store",
  "category": "GROCERY",
  "status": "PENDING_VERIFICATION",
  
  "photoUrl": null,
  
  "addressLine1": "Shop No. 45, Main Market",
  "addressLine2": "Near HDFC Bank",
  "city": "Gurgaon",
  "state": "Haryana",
  "pincode": "122001",
  
  "latitude": 28.4595,
  "longitude": 77.0266,
  
  "phone": "+919999999999",
  "alternatePhone": "+918888888888",
  "email": "ramesh@gmail.com",
  "whatsappNumber": "+919999999999",
  
  "gstNumber": "07AAACR5055K1Z5",
  "businessHours": {...},
  
  "deliveryAvailable": true,
  "deliveryRadius": 5.0,
  "minimumOrderAmount": "100.00",
  "deliveryCharge": "20.00",
  
  "isVerified": false,
  "verifiedAt": null,
  "isProfileComplete": true,
  "isActive": true,
  "createdAt": "2026-01-04T00:00:00.000Z",
  "deletedAt": null
}
```

**Error - Already Have Shop**:
```json
{
  "error": "You already have a shop. Only one shop per account is allowed. Please update your existing shop instead."
}
```

---

### 2. Get My Shop
**Description**: Retrieve your shop details.

**Endpoint**: `GET /api/shops/my`
**Header**: `Authorization: Bearer <token>` (Role: SHOPKEEPER)

**Output (JSON)**: Same as create shop response

**Error - No Shop**:
```json
{
  "error": "No shop found. Please create your shop first."
}
```

---

### 3. Update My Shop
**Description**: Update your shop details. All fields are optional.

**Endpoint**: `PATCH /api/shops/my`
**Header**: `Authorization: Bearer <token>` (Role: SHOPKEEPER)

**Input (JSON)** - All fields optional:
```json
{
  "name": "Updated Shop Name",
  "city": "New City",
  "latitude": 28.5000,
  "longitude": 77.0500,
  "businessHours": {
    "monday": {"open": "10:00", "close": "22:00"}
  },
  "deliveryAvailable": true,
  "deliveryRadius": 10.0
}
```

**Output**: Updated shop object

---

### 4. Delete My Shop
**Description**: Soft delete your shop. You can create a new shop after deletion.

**Endpoint**: `DELETE /api/shops/my`
**Header**: `Authorization: Bearer <token>` (Role: SHOPKEEPER)

**Output**:
```json
{
  "message": "Shop deleted successfully. You can create a new shop now."
}
```

---

### 5. Upload Shop Photo
**Description**: Upload a photo for your shop.

**Endpoint**: `POST /api/shops/my/photo`
**Header**: `Authorization: Bearer <token>` (Role: SHOPKEEPER)
**Content-Type**: `multipart/form-data`

**Input (Form Data)**:
- `photo`: Image file (JPEG, PNG, WebP)
- Max size: 5MB

**Output (JSON)**:
```json
{
  "message": "Photo uploaded and optimized successfully",
  "shop": {
    "photoUrl": "https://res.cloudinary.com/dndk9996y/image/upload/v1767509178/shop-photos/large/fxqqohiem1bqu0rh34zm.png",
    "photoThumbnail": "https://res.cloudinary.com/dndk9996y/image/upload/v1767509178/shop-photos/thumbnails/n9bnnw4gieeroqgxwf1e.png",
    "photoMedium": "https://res.cloudinary.com/dndk9996y/image/upload/v1767509178/shop-photos/medium/vlkctdeivswezhpkey8x.png"
  }
}
```

**Photo Access**: Images are served via Cloudinary global CDN.

---

### 6. Get Shop Profile Completion
**Description**: Check how complete your shop's profile is.

**Endpoint**: `GET /api/shops/my/completion`
**Header**: `Authorization: Bearer <token>` (Role: SHOPKEEPER)

**Output (JSON)**:
```json
{
  "isComplete": false,
  "completionPercentage": 73,
  "missingFields": [
    "photoUrl",
    "businessHours",
    "whatsappNumber"
  ]
}
```

**Profile Completion Criteria**:
- **Required Fields**: name, category, addressLine1, city, state, pincode
- **Recommended Fields**: phone, email, whatsappNumber, photoUrl, businessHours

---

## Shop Status Enum

```typescript
enum ShopStatus {
  ACTIVE                // Shop is open for business
  TEMPORARILY_CLOSED    // Vacation, maintenance
  PERMANENTLY_CLOSED    // Shop closed permanently
  PENDING_VERIFICATION  // Awaiting admin verification (default)
}
```

---

## Delivery Settings

Shops can configure delivery options:

```json
{
  "deliveryAvailable": true,      // Enable/disable delivery
  "deliveryRadius": 5.0,          // Delivery radius in km
  "minimumOrderAmount": 100.00,   // Minimum order for delivery
  "deliveryCharge": 20.00         // Delivery fee
}
```

---

## GPS Coordinates & Search

Add location coordinates for map integration and location-based search:

```json
{
  "latitude": 28.4595,   // -90 to 90
  "longitude": 77.0266   // -180 to 180
}
```

### Location APIs

**1. Nearby Shops**
Find shops within a specific radius (in km):
```http
GET /api/shops/nearby?lat=28.4595&lng=77.0266&radius=5
```

**2. Advanced Search**
Search by location, category, and more:
```http
GET /api/shops/search?lat=28.4595&lng=77.0266&radius=10&category=GROCERY&minRating=4
```

**3. Top Rated**
Get highest rated shops globally or regionally:
```http
GET /api/shops/top-rated?limit=10
```

---

## Business Hours Format

Business hours are stored as JSON:

```json
{
  "monday": {
    "open": "09:00",
    "close": "21:00",
    "closed": false
  },
  "tuesday": {
    "open": "09:00",
    "close": "21:00"
  },
  "sunday": {
    "closed": true
  }
}
```

- Time format: 24-hour (HH:MM)
- `closed`: Optional boolean (default: false)
- Days: monday, tuesday, wednesday, thursday, friday, saturday, sunday

---

## Complete Workflow

### New Shopkeeper Journey

```bash
# 1. Register
POST /api/shopkeeper/register
{
  "phone": "+919999999999",
  "name": "Ramesh Kumar"
}

# 2. Verify OTP & Login
POST /api/auth/login
{
  "phone": "+919999999999",
  "otp": "123456"
}

# 3. Create Shop (One Time)
POST /api/shops
{
  "name": "Ramesh Kirana",
  "category": "GROCERY",
  "addressLine1": "Shop 45, Main Market",
  "city": "Gurgaon",
  "state": "Haryana",
  "pincode": "122001",
  "phone": "+919999999999",
  "latitude": 28.4595,
  "longitude": 77.0266,
  "deliveryAvailable": true,
  "deliveryRadius": 5.0
}

# 4. Upload Photo
POST /api/shops/my/photo
Content-Type: multipart/form-data
photo: <file>

# 5. Check Completion
GET /api/shops/my/completion

# 6. Update Shop (Anytime)
PATCH /api/shops/my
{
  "businessHours": {
    "monday": {"open": "09:00", "close": "21:00"}
  }
}

# 7. Get Shop Details
GET /api/shops/my
```

---

## Error Responses

### 400 Bad Request
```json
{
  "error": "Validation failed",
  "details": [
    {
      "field": "pincode",
      "message": "Invalid pincode (must be 6 digits)"
    }
  ]
}
```

### 404 Not Found
```json
{
  "error": "No shop found. Please create your shop first."
}
```

### 409 Conflict
```json
{
  "error": "You already have a shop. Only one shop per account is allowed."
}
```

---

## Key Features

### ✅ One Shop Per Account
- Simplifies user experience
- Clearer business logic
- Easier to manage
- Can delete and recreate if needed

### ✅ Comprehensive Profile
- Detailed address with GPS
- Multiple contact methods
- Business hours configuration
- Delivery settings
- GST number support

### ✅ Photo Upload
- 5MB max file size
- JPEG, PNG, WebP supported
- Accessible via static URL

### ✅ Profile Completion Tracking
- Required vs recommended fields
- Completion percentage
- Missing fields list

### ✅ Soft Delete
- Data preserved
- Can create new shop after deletion
- Shopkeeper setup status reset

---

## Image Optimization (Ready to Use)

An image optimization service is available to process uploaded photos:

```typescript
import { processShopImage } from '../shared/services/image.service';

// Generates 3 sizes: thumbnail (150x150), medium (500x500), large (1200x1200)
const processedImages = await processShopImage(filePath, shopId);

// Returns:
{
  thumbnail: "/uploads/shop-photos/shop-uuid-thumb-timestamp.webp",
  medium: "/uploads/shop-photos/shop-uuid-medium-timestamp.webp",
  large: "/uploads/shop-photos/shop-uuid-large-timestamp.webp"
}
```

**Features**:
- Converts to WebP format (better compression)
- Generates 3 sizes for different use cases
- Quality optimization (80%, 85%, 90%)
- Deletes original upload
- Parallel processing for speed
