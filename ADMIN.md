# Yellowsky Admin Endpoints

## Sync Products

### GET /api/admin/sync-products
Lists all artworks from the `_web` folder and their Stripe product status.
Reports orphaned products (products in Stripe but not in S3).

**Response:**
```json
{
  "s3": { "total": 22 },
  "stripe": {
    "totalProducts": 25,
    "yellowskyProducts": 22,
    "active": 22,
    "inactive": 0
  },
  "sync": {
    "inSync": 22,
    "missingProducts": 0,
    "orphanedProducts": 0
  },
  "items": [...],
  "missingProducts": [...],
  "orphanedProducts": [...]
}
```

### POST /api/admin/sync-products
Creates Stripe products for artworks that don't have products yet.

**Body (JSON):**
```json
{
  "dryRun": true,        // Set to false to actually create products
  "priceA4": 1600000,    // 16,000 HUF in fillér (cents)
  "priceA3": 2400000,    // 24,000 HUF in fillér (cents)
  "limit": 10            // Max products to create per call
}
```

**Dry run response:**
```json
{
  "message": "Dry run - no products created",
  "dryRun": true,
  "wouldCreate": 20,
  "artworks": [
    {
      "name": "2020.95 Castle 7",
      "filename": "2020.95 Castle 7.png",
      "prices": [
        { "nickname": "A4", "amount": 16000, "currency": "HUF" },
        { "nickname": "A3", "amount": 24000, "currency": "HUF" }
      ]
    }
  ]
}
```

**Actual creation response:**
```json
{
  "message": "Created 10 products",
  "created": [
    {
      "name": "2020.95 Castle 7",
      "productId": "prod_xxx",
      "prices": [
        { "id": "price_xxx", "nickname": "A4", "amount": 16000 },
        { "id": "price_xxx", "nickname": "A3", "amount": 24000 }
      ]
    }
  ],
  "remaining": 10
}
```

### DELETE /api/admin/sync-products
Archives (sets active: false) Stripe products that are orphaned or duplicate.

**Body (JSON):**
```json
{
  "dryRun": true,          // Set to false to actually archive
  "action": "orphaned",   // 'orphaned' (default), 'duplicates', or 'all'
  "productIds": ["prod_xxx"] // Optional: specific IDs to archive
}
```

**Actions:**
- `orphaned` - Products with `source: yellowsky` metadata but no matching S3 artwork
- `duplicates` - Products with duplicate names (keeps oldest, archives rest)
- `all` - Archive both orphaned and duplicates

**Dry run response:**
```json
{
  "message": "Dry run - no products archived",
  "dryRun": true,
  "action": "duplicates",
  "wouldArchive": 2,
  "orphanedProducts": [],
  "duplicateProducts": [
    { "id": "prod_xxx", "name": "Old Artwork", "active": true, "created": 1234567890 }
  ],
  "toArchive": [
    { "id": "prod_xxx", "name": "Old Artwork", "reason": "duplicate" }
  ],
  "hint": "Set dryRun: false to actually archive products"
}
```

**Actual archive response:**
```json
{
  "message": "Archived 2 products",
  "action": "duplicates",
  "archived": [
    { "id": "prod_xxx", "name": "Old Artwork", "reason": "duplicate", "wasActive": true }
  ],
  "remaining": { "orphaned": 0, "duplicates": 0 }
}
```

## Coupons

### GET /api/admin/coupons
Lists all coupons.

### POST /api/admin/coupons
Creates a coupon with promotion code.

**Body (JSON):**
```json
{
  "code": "EARLYBIRD",
  "percentOff": 20,
  "maxRedemptions": 100,  // optional
  "expiresAt": 1735689600  // optional Unix timestamp
}
```

**Response:**
```json
{
  "success": true,
  "coupon": {
    "id": "coupon_xxx",
    "name": "EARLYBIRD",
    "percentOff": 20,
    "promoCodeId": "promo_xxx",
    "code": "EARLYBIRD"
  }
}
```

## Usage

### Authentication

The admin endpoints require authentication if `ADMIN_API_KEY` is set in `.env.local`.

You can provide the key via:
- `Authorization: Bearer <key>` header
- `X-Admin-Key: <key>` header
- `?key=<key>` query parameter

If `ADMIN_API_KEY` is not set, the endpoints are **unprotected** (development mode).

### 1. Check what's missing:
```bash
curl https://yellowsky.andrasdenes.com/api/admin/sync-products
# Or with auth:
curl -H "Authorization: Bearer YOUR_KEY" https://yellowsky.andrasdenes.com/api/admin/sync-products
```

### 2. Dry run to see what would be created:
```bash
curl -X POST https://yellowsky.andrasdenes.com/api/admin/sync-products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_KEY" \
  -d '{"dryRun": true}'
```

### 3. Create products (start with limit=1 to test):
```bash
curl -X POST https://yellowsky.andrasdenes.com/api/admin/sync-products \
  -H "Content-Type: application/json" \
  -d '{"dryRun": false, "limit": 1}'
```

### 4. Create all remaining products:
```bash
curl -X POST https://yellowsky.andrasdenes.com/api/admin/sync-products \
  -H "Content-Type: application/json" \
  -d '{"dryRun": false, "limit": 100}'
```

### 5. Create coupon codes:
```bash
curl -X POST https://yellowsky.andrasdenes.com/api/admin/coupons \
  -H "Content-Type: application/json" \
  -d '{"code": "EARLYBIRD", "percentOff": 20}'
```

## Security Note

This endpoint should be protected in production. Consider adding authentication (e.g., Bearer token, API key header, or IP whitelist).

For development, you can test locally:
```bash
curl http://localhost:3000/api/admin/sync-products
```

---

## TODO

- [ ] Canvas preview - artwork preview on canvas element before purchase
- [ ] SEO - meta tags, Open Graph, structured data for artwork pages
- [ ] Marketing - social sharing, email notifications, promotional campaigns