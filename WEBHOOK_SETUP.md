# Stripe Webhook Setup for Yellowsky

This document explains how to set up payment notifications for the yellowsky art print shop.

## Current Architecture

### Customer Receipts (Built-in Stripe)

**Status:** ❌ Not yet enabled

Stripe can automatically send email receipts to customers after successful payment. No code needed.

**Setup:**
1. Go to [Stripe Email Settings](https://dashboard.stripe.com/settings/emails)
2. Toggle **"Successful payments"** to ON
3. Customize branding at [Stripe Branding](https://dashboard.stripe.com/settings/branding):
   - Upload your logo (square, 128x128px minimum, max 512KB)
   - Set brand colors
   - Add public contact info

### Merchant Notifications (Webhook)

**Status:** ✅ Implemented - Discord webhook to #monitoring

A webhook handler at `/api/webhooks/stripe` receives `checkout.session.completed` events and sends Discord notifications.

**What it captures:**
- Customer email & name
- Line items (artwork name, quantity, price)
- Total amount & currency
- Shipping address
- Stripe session ID

**Notification destination:** Discord #monitoring channel

## Setup Steps

### 1. Add Stripe Keys to `.env.local`

```bash
# Stripe API Keys (from https://dashboard.stripe.com/apikeys)
STRIPE_SECRET_KEY=sk_live_...  # or sk_test_... for testing
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...  # or pk_test_...

# Webhook secret (different for local vs production)
STRIPE_WEBHOOK_SECRET=whsec_...
```

### 2. Local Testing with Stripe CLI

```bash
# Install Stripe CLI (macOS)
brew install stripe/stripe-cli/stripe

# Login to Stripe
stripe login

# Forward webhooks to local dev server
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# This prints a webhook signing secret (whsec_...)
# Copy it to STRIPE_WEBHOOK_SECRET in .env.local
```

In another terminal:
```bash
# Trigger test event
stripe trigger checkout.session.completed
```

### 3. Production Webhook Setup

1. Deploy your app to production
2. Go to [Stripe Webhooks](https://dashboard.stripe.com/webhooks)
3. Click **Add endpoint**
4. URL: `https://yellowsky.andrasdenes.com/api/webhooks/stripe`
5. Events to send: Select only `checkout.session.completed`
6. Copy the **Signing secret** to production environment as `STRIPE_WEBHOOK_SECRET`

### 4. Implement Notification Method

✅ Already implemented - Discord webhook sends to #monitoring channel

The webhook handler sends rich embed notifications with:
- Customer name and email
- Ordered items with quantities
- Total amount
- Shipping address
- Stripe session ID for reference
```

## Environment Variables

| Variable | Required | Description | Source |
|----------|----------|-------------|--------|
| `STRIPE_SECRET_KEY` | ✅ | Stripe secret API key | [Dashboard](https://dashboard.stripe.com/apikeys) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | ✅ | Stripe publishable key | [Dashboard](https://dashboard.stripe.com/apikeys) |
| `STRIPE_WEBHOOK_SECRET` | ✅ | Webhook signing secret | CLI or Dashboard |
| `NEXT_PUBLIC_SITE_URL` | ✅ | Site URL for redirects | Your domain |
| `DISCORD_WEBHOOK_URL` | ✅ | Discord webhook for #monitoring | See TOOLS.md |

## Testing Checklist

- [ ] Stripe keys added to `.env.local`
- [ ] `DISCORD_WEBHOOK_URL` added (from TOOLS.md - #monitoring webhook)
- [ ] Webhook secret added to `.env.local`
- [ ] Local webhook handler receives test events (`stripe trigger checkout.session.completed`)
- [ ] Check #monitoring channel for test notification
- [ ] Customer receipts enabled in Stripe Dashboard
- [ ] Production webhook endpoint registered in Stripe Dashboard
- [ ] Production environment variables configured on Vercel

## Related Files

- `/app/api/checkout/route.ts` - Creates checkout sessions
- `/app/api/webhooks/stripe/route.ts` - Handles payment confirmations
- `/lib/stripe-config.ts` - Stripe configuration loader
- `/lib/stripe-products.ts` - Product fetching utilities

## Notes

- The webhook handler is **idempotent-safe** - it only logs, doesn't modify state
- For production, consider adding event ID tracking to prevent duplicate processing
- Stripe retries webhooks on 5xx errors, so always return 200 even if logging fails
- The `checkout.session.completed` event includes all line items and customer details