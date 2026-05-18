# Yellowsky Admin Endpoints

## Sync Products

### GET /api/admin/sync-products
Lists all artworks from the `_web` folder and their Stripe product status.

**Response:**
```json
{
  "total": 21,
  "existing": 1,
  "missing": 20,
  "items": [...],
  "missingItems": [...]
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

## Security Note

This endpoint should be protected in production. Consider adding authentication (e.g., Bearer token, API key header, or IP whitelist).

For development, you can test locally:
```bash
curl http://localhost:3000/api/admin/sync-products
```