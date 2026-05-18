import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getStripeSecretKey } from "@/lib/stripe-config";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const secretKey = getStripeSecretKey();
  if (!secretKey) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 500 });
  }

  const stripe = new Stripe(secretKey, {
    apiVersion: "2026-04-22.dahlia",
  });

  try {
    const body = await request.json();
    const { priceId, items } = body as { priceId?: string; items?: Array<{ priceId: string; quantity?: number }> };

    // Support both single priceId (backward compat) and items array
    let lineItems: Array<{ price: string; quantity: number }>;

    if (items && items.length > 0) {
      lineItems = items.map(item => ({
        price: item.priceId,
        quantity: item.quantity ?? 1,
      }));
    } else if (priceId) {
      lineItems = [{ price: priceId, quantity: 1 }];
    } else {
      return NextResponse.json({ error: "Missing priceId or items" }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: lineItems,
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL || "https://yellowsky.andrasdenes.com"}/webshop?success=1`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL || "https://yellowsky.andrasdenes.com"}/webshop?canceled=1`,
      shipping_address_collection: {
        allowed_countries: ["HU", "AT", "BE", "BG", "CY", "CZ", "DK", "EE", "FI", "FR", "DE", "GR", "IE", "IT", "LV", "LT", "LU", "MT", "NL", "PL", "PT", "RO", "SK", "SI", "ES", "SE", "GB", "US", "CA"],
      },
      allow_promotion_codes: true,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Stripe checkout error:", err);
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 });
  }
}