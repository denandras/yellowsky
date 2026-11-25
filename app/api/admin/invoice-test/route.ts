import { NextRequest, NextResponse } from "next/server";
import { validateAdminAuth } from "@/lib/auth-utils";
import { createOrderInvoice, sampleOrderInvoiceInput } from "@/lib/tacito";

export const dynamic = "force-dynamic";

/**
 * POST /api/admin/invoice-test?key=$ADMIN_API_KEY
 *
 * Runs the real invoice code path against TACITo with a sample order, always in
 * DRAFT mode: no invoice number is consumed and nothing reaches NAV. Use it to
 * prove credentials, series and payload shape without issuing anything.
 *
 * `{ "issue": true }` is deliberately NOT supported here — issuing is a manual,
 * owner-approved action performed by a real order.
 */
export async function POST(request: NextRequest) {
  const auth = validateAdminAuth(request);
  if (!auth.valid) {
    return NextResponse.json({ error: auth.error }, { status: 401 });
  }

  const sample = sampleOrderInvoiceInput();
  const result = await createOrderInvoice({ ...sample, mode: "draft" });

  return NextResponse.json(
    {
      mode: "draft",
      seriesId: process.env.TACITO_ART_SERIES_ID ?? null,
      keyConfigured: Boolean(process.env.TACITO_API_KEY),
      result,
    },
    { status: result.ok ? 200 : 502 },
  );
}
