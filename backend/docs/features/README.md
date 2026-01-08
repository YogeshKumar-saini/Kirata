# Features Guide

Comprehensive guide to all features in Kirata Shop Management System.

## 🏪 Shop Management

### One Shop Per Account
Each shopkeeper can create and manage one shop. This ensures focused management and prevents account abuse.

### Profile Completion
Track shop profile completion percentage:
- Basic info (name, category)
- Address details
- Contact information
- Business hours
- Photos

### Soft Delete
Shops are soft-deleted (marked as deleted) rather than permanently removed, allowing for data recovery.

---

## 📸 Media Management

### Image Processing
Automatic image optimization using Sharp:
- **Thumbnail:** 150x150px (80% quality)
- **Medium:** 500x500px (85% quality)
- **Large:** 1200x1200px (90% quality)
- **Format:** WebP (30-50% smaller than JPEG)

### Cloud Storage (Verified)
- **Integration:** [Cloudinary](https://cloudinary.com)
- **CDN:** Automatic global content delivery
- **Secure URLs:** `https://res.cloudinary.com/...`
- **Optimization:** Automatic format selection (WebP/AVIF) based on browser support
- **Performance:** Images served via fast CDN edge locations

### Logo & Photos
- **Logo:** Single logo image
- **Photos:** Up to 10 shop photos
- **Deletion:** Remove individual photos by index

---

## 🏖️ Vacation Mode

Temporarily close your shop with a custom message.

### Features
- Set start and end dates
- Custom vacation message
- Automatic shop status update
- Visible to customers

### Use Cases
- Holidays
- Renovations
- Personal leave
- Seasonal closures

### API
```http
POST /api/shops/my/vacation
{
  "startDate": "2024-12-20",
  "endDate": "2024-12-27",
  "message": "Closed for Christmas holidays"
}
```

---

## ⏰ Business Hours Management

### Regular Hours
Define weekly operating hours:
```json
{
  "monday": { "open": "09:00", "close": "21:00" },
  "tuesday": { "open": "09:00", "close": "21:00" },
  "sunday": { "closed": true }
}
```

### Hours Exceptions
Override hours for specific dates:
- Public holidays
- Special events
- Early closures
- Extended hours

### isShopOpen() Function
Automatically determines if shop is open:
1. Checks vacation mode
2. Checks hours exceptions
3. Checks regular business hours

---

## 🔍 Search & Discovery

### Location-Based Search
Find shops within a radius using GPS coordinates.

**Algorithm:** Haversine formula for accurate distance calculation

**Features:**
- Search by radius (km)
- Filter by category
- Filter by minimum rating
- Sort by distance

### Advanced Filters
- **Category:** GROCERY, MEDICAL, HARDWARE, etc.
- **Rating:** Minimum rating (1-5 stars)
- **Delivery:** Shops offering delivery
- **Open Now:** Currently open shops

### Top Rated Shops
Get highest-rated shops in your area.

---

## ⭐ Reviews & Ratings

### Customer Reviews
Customers can:
- Rate shops (1-5 stars)
- Write comments
- Upload review images
- Edit/delete their reviews

### Automatic Aggregation
Shop ratings automatically updated:
- Average rating calculated
- Total review count tracked
- Real-time updates

### Review Management
- One review per customer per shop
- Edit within reasonable time
- Delete anytime
- Moderation support

---

## 📊 Analytics Dashboard

### Metrics Tracked
- **Views:** Shop profile views
- **Orders:** Total orders received
- **Revenue:** Total sales amount

### Time Periods
- Today's stats
- Last 7 days
- Last 30 days
- Custom date range

### Daily Aggregation
Data stored per day for trend analysis.

### Export
Download analytics as CSV for external analysis.

---

## 📥 Data Export

### Export Formats
All exports in CSV format for Excel/Google Sheets compatibility.

### Available Exports
1. **Orders:** All order history
2. **Analytics:** Performance metrics
3. **Reviews:** Customer feedback

### Use Cases
- Accounting
- Tax filing
- Business analysis
- Reporting

---

## 🔐 Verification System

### Admin Workflow
1. Shop submits for verification
2. Admin reviews details
3. Admin approves or rejects
4. Shop receives notification

### Verification Status
- **PENDING:** Awaiting review
- **UNDER_REVIEW:** Being reviewed
- **APPROVED:** Verified shop
- **REJECTED:** Needs correction

### Blue Tick Badge
Verified shops display a blue tick for customer trust.

---

## 🗺️ Geocoding

### Automatic GPS Coordinates
Addresses automatically converted to latitude/longitude using Google Maps API.

### Benefits
- Accurate location search
- Distance calculation
- Map integration ready

### Fallback
Manual GPS input if geocoding fails.

---

## 💾 Caching

### Redis Integration
Optional Redis caching for performance:
- Shop data cached (1 hour TTL)
- Automatic invalidation on updates
- Faster response times

### Cache Strategy
- Cache on first read
- Invalidate on write
- Pattern-based deletion

---

## 🔒 Security Features

### Rate Limiting
- 100 requests per 15 minutes
- Per IP address
- Prevents abuse

### Helmet Security
Industry-standard HTTP headers:
- XSS protection
- Content Security Policy
- HSTS
- Frame options

### Audit Logging
Track all system changes:
- User actions
- Entity modifications
- IP addresses
- Timestamps

---

## 📱 Future Features

### Planned
- Multi-language support (i18n)
- Push notifications
- Dark mode
- Webhooks
- Staff management

---

## Next Steps

- [API Reference](../api/README.md)
- [Deployment Guide](../deployment/README.md)
