import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getStripeSecretKey } from "@/lib/stripe-config";
import { validateAdminAuth } from "@/lib/auth-utils";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/coupons
 * Lists all coupons
 */
export async function GET(request: NextRequest) {
  const auth = validateAdminAuth(request);
  if (!auth.valid) {
    return NextResponse.json({ error: auth.error }, { status: 401 });
  }

  const secretKey = getStripeSecretKey();
  if (!secretKey) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 500 });
  }

  const stripe = new Stripe(secretKey, {
    apiVersion: "2026-04-22.dahlia",
  });

  const coupons = await stripe.coupons.list({ limit: 100 });

  return NextResponse.json({
    coupons: coupons.data.map((c) => ({
      id: c.id,
      name: c.name,
      percentOff: c.percent_off,
      amountOff: c.amount_off,
      currency: c.currency,
      duration: c.duration,
      redeemBy: c.redeem_by,
      timesRedeemed: c.times_redeemed,
      maxRedemptions: c.max_redemptions,
      active: c.valid,
    })),
  });
}

/**
 * POST /api/admin/coupons
 * Creates a coupon
 *
 * Body:
 * - code: string - Promotion code (e.g., "EARLYBIRD")
 * - percentOff: number - Percent discount (e.g., 20 for 20%)
 * - maxRedemptions?: number - Optional max redemptions
 * - expiresAt?: number - Optional Unix timestamp for expiration
 */
export async function POST(request: NextRequest) {
  const auth = validateAdminAuth(request);
  if (!auth.valid) {
    return NextResponse.json({ error: auth.error }, { status: 401 });
  }

  const secretKey = getStripeSecretKey();
  if (!secretKey) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 500 });
  }

  const stripe = new Stripe(secretKey, {
    apiVersion: "2026-04-22.dahlia",
  });

  const body = await request.json();
  const { code, percentOff, maxRedemptions, expiresAt } = body;

  if (!code || typeof percentOff !== "number") {
    return NextResponse.json(
      { error: "Missing required fields: code, percentOff" },
      { status: 400 }
    );
  }

  try {
    // Create the coupon
    const coupon = await stripe.coupons.create({
      percent_off: percentOff,
      duration: "once",
      name: code,
      ...(maxRedemptions && { max_redemptions: maxRedemptions }),
      ...(expiresAt && { redeem_by: expiresAt }),
    });

    // Create the promotion code
    const promoCode = await stripe.promotionCodes.create({
      promotion: {
        type: 'coupon',
        coupon: coupon.id,
      },
      code: code.toUpperCase(),
      active: true,
    });

    return NextResponse.json({
      success: true,
      coupon: {
        id: coupon.id,
        name: coupon.name,
        percentOff: coupon.percent_off,
        promoCodeId: promoCode.id,
        code: promoCode.code,
      },
    });
  } catch (err) {
    console.error("Error creating coupon:", err);
    return NextResponse.json(
      { error: "Failed to create coupon", details: String(err) },
      { status: 500 }
    );
  }
}