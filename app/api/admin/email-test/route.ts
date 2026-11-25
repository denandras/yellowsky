import { NextRequest, NextResponse } from "next/server";
import { validateAdminAuth } from "@/lib/auth-utils";
import { sendTestEmail } from "@/lib/email";
import { sendOrderConfirmation } from "@/lib/email";
import { artworkImageUrl } from "@/lib/artwork-image-url";
import { buildOrderConfirmationHtml, buildOrderConfirmationText, type OrderEmailData } from "@/lib/email-templates/order-confirmation";

export const dynamic = "force-dynamic";

/**
 * POST /api/admin/email-test  { "to": "someone@example.com" }
 * Proves the SMTP configuration works without touching a real order.
 * Same admin auth as the other admin routes.
 */
export async function POST(request: NextRequest) {
  const auth = validateAdminAuth(request);
  if (!auth.valid) {
    return NextResponse.json({ error: auth.error }, { status: 401 });
  }
  const body = await request.json().catch(() => ({}));
  const to = typeof body.to === "string" && body.to.includes("@") ? body.to : process.env.ORDER_CC;
  if (!to) {
    return NextResponse.json({ error: "No recipient" }, { status: 400 });
  }
  if (body.template === "order") {
    const sample: OrderEmailData = {
      orderId: "cs_test_sample_0001",
      customerName: "András Dénes",
      customerEmail: to,
      items: [
        { name: "2020.01 Venice", size: "A3", quantity: 1, amount: 24000, currency: "HUF", imageUrl: artworkImageUrl("2020.01 Venice.png") },
        { name: "2020.101 Church", size: "A4", quantity: 2, amount: 16000, currency: "HUF", imageUrl: artworkImageUrl("2020.101 Church.png") },
      ],
      totalAmount: 56000,
      currency: "HUF",
      shippingAddress: { line1: "Garam utca 23.", city: "Budapest", postal_code: "1133", country: "HU" },
      billingAddress: { line1: "Garam utca 23.", city: "Budapest", postal_code: "1133", country: "HU" },
    };
    if (body.single === true) {
      sample.items = [sample.items[0]];
      sample.totalAmount = sample.items[0].amount * sample.items[0].quantity;
    }
    if (body.dryRun === true) {
      return NextResponse.json({ html: buildOrderConfirmationHtml(sample), text: buildOrderConfirmationText(sample) });
    }
    const result = await sendOrderConfirmation(sample);
    return NextResponse.json({ to, template: "order", ...result }, { status: result.ok ? 200 : 502 });
  }
  const result = await sendTestEmail(to);
  return NextResponse.json({ to, ...result }, { status: result.ok ? 200 : 502 });
}
