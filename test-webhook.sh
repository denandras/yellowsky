#!/bin/bash
# Test Stripe webhook locally without Stripe CLI
# This simulates a checkout.session.completed event

# Generate a test payload
PAYLOAD='{
  "id": "evt_test_webhook",
  "object": "event",
  "api_version": "2026-04-22.dahlia",
  "created": '$(date +%s)',
  "data": {
    "object": {
      "id": "cs_test_"$(openssl rand -hex 16),
      "object": "checkout.session",
      "amount_total": 5000,
      "currency": "eur",
      "customer_email": "test@example.com",
      "customer_details": {
        "email": "test@example.com",
        "name": "Test Customer"
      },
      "shipping_details": {
        "address": {
          "line1": "123 Test Street",
          "city": "Budapest",
          "postal_code": "1234",
          "country": "HU"
        }
      }
    }
  },
  "type": "checkout.session.completed"
}'

# Calculate current timestamp
TIMESTAMP=$(date +%s)

# Send to local webhook endpoint
curl -X POST http://localhost:3000/api/webhooks/stripe \
  -H "Content-Type: application/json" \
  -H "Stripe-Signature: t=$TIMESTAMP,v1=test_signature" \
  -d "$PAYLOAD"

echo ""
echo "Webhook test sent. Check the dev server logs above."