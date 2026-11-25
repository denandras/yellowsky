import { NextRequest, NextResponse } from "next/server";
import { validateAdminAuth } from "@/lib/auth-utils";
import { sendTestEmail } from "@/lib/email";

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
  const result = await sendTestEmail(to);
  return NextResponse.json({ to, ...result }, { status: result.ok ? 200 : 502 });
}
