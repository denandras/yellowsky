/**
 * TACITo invoicing client for the shop.
 *
 * Stripe takes the money; TACITo issues the Hungarian számla and reports it to
 * NAV. This module only creates invoices for orders that are already paid —
 * it never touches payment state.
 *
 * Env:
 *   TACITO_API_KEY          integration API key (writes are allowed)
 *   TACITO_ART_SERIES_ID    number series for print invoices (2026-Y-)
 *   TACITO_INVOICE_MODE     "issue" (default) or "draft" — what a real order does
 *
 * Rules baked in here:
 *  - the line description is the fixed service name, never the artwork title;
 *  - art sales are alanyi adómentes, i.e. vat_rate "AAM" on every line;
 *  - no product catalogue, no shipping line: the description is sent inline;
 *  - the series is always explicit, never the account default.
 */

const BASE = "https://tacito.hu";

export type TacitoLine = {
  description: string;
  quantity: number;
  unit: string;
  unitPriceGross: number;
  vatRate: string;
};

export type TacitoBuyer = {
  name: string;
  email?: string | null;
  countryCode?: string | null;
  postalCode?: string | null;
  city?: string | null;
  address?: string | null;
  taxNumber?: string | null;
  euVatNumber?: string | null;
};

export type TacitoInvoiceResult =
  | {
      ok: true;
      id: string;
      number: string | null;
      state: string;
      navOutcome: string | null;
      emailed: boolean;
      mode: "draft" | "issue";
    }
  | { ok: false; skipped?: boolean; error: string };

export const ART_LINE_DESCRIPTION = "Képzőművészeti tevékenység";

function apiKey(): string | null {
  return process.env.TACITO_API_KEY?.trim() || null;
}

/** YYYY-MM-DD in Europe/Budapest — the invoice date must not be a day off. */
function todayBudapest(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Budapest" }).format(new Date());
}

function mode(): "draft" | "issue" {
  const raw = (process.env.TACITO_INVOICE_MODE || "issue").trim().toLowerCase();
  return raw === "draft" ? "draft" : "issue";
}

async function call(
  path: string,
  init: { method: string; body?: unknown; idempotencyKey?: string },
): Promise<{ status: number; body: any }> {
  const key = apiKey();
  if (!key) throw new Error("TACITO_API_KEY not configured");
  const headers: Record<string, string> = {
    Authorization: `Bearer ${key}`,
    Accept: "application/json",
  };
  if (init.body !== undefined) headers["Content-Type"] = "application/json";
  if (init.idempotencyKey) headers["Idempotency-Key"] = init.idempotencyKey;

  const res = await fetch(`${BASE}${path}`, {
    method: init.method,
    headers,
    body: init.body === undefined ? undefined : JSON.stringify(init.body),
    cache: "no-store",
  });
  const text = await res.text();
  let body: any = {};
  try {
    body = text ? JSON.parse(text) : {};
  } catch {
    body = { raw: text.slice(0, 400) };
  }
  return { status: res.status, body };
}

/**
 * Creates the invoice for a paid order and, unless TACITO_INVOICE_MODE=draft,
 * issues it (burning a number and reporting to NAV) and asks TACITo to e-mail
 * it to the buyer.
 */
export async function createOrderInvoice(input: {
  orderId: string;
  buyer: TacitoBuyer;
  lines: TacitoLine[];
  note: string;
  seriesId?: string;
  mode?: "draft" | "issue";
}): Promise<TacitoInvoiceResult> {
  if (!apiKey()) return { ok: false, skipped: true, error: "TACITO_API_KEY not configured" };

  const seriesId = input.seriesId || process.env.TACITO_ART_SERIES_ID?.trim();
  if (!seriesId) return { ok: false, skipped: true, error: "TACITO_ART_SERIES_ID not configured" };
  if (!input.lines.length) return { ok: false, error: "No invoice lines" };

  const effectiveMode = input.mode ?? mode();
  const day = todayBudapest();

  const payload = {
    document_type: "NORMAL",
    series_id: seriesId,
    issue_date: day,
    performance_date: day,
    due_date: day, // paid on the spot: no payment deadline on the invoice
    currency: "HUF",
    language: "hu",
    payment_method: "CARD",
    payment_provider: "stripe",
    payment_reference: input.orderId,
    buyer: {
      name: input.buyer.name,
      country_code: (input.buyer.countryCode || "HU").toUpperCase(),
      postal_code: input.buyer.postalCode || undefined,
      city: input.buyer.city || undefined,
      address: input.buyer.address || undefined,
      email: input.buyer.email || undefined,
      tax_number: input.buyer.taxNumber || undefined,
      eu_vat_number: input.buyer.euVatNumber || undefined,
      is_taxable_person: Boolean(input.buyer.taxNumber || input.buyer.euVatNumber),
    },
    lines: input.lines.map((line) => ({
      description: line.description,
      quantity: line.quantity,
      unit: line.unit,
      unit_price_gross: line.unitPriceGross,
      vat_rate: line.vatRate,
    })),
    invoice_note: input.note,
  };

  const created = await call("/api/v1/invoices", {
    method: "POST",
    body: payload,
    idempotencyKey: `${input.orderId}:invoice`,
  });
  if (created.status !== 200 && created.status !== 201) {
    return { ok: false, error: `create ${created.status}: ${JSON.stringify(created.body).slice(0, 300)}` };
  }

  const invoice = created.body?.invoice ?? created.body;
  const id: string | undefined = invoice?.id;
  if (!id) return { ok: false, error: "create: no invoice id in response" };

  let number: string | null = invoice?.invoice_number ?? null;
  let state: string = invoice?.state ?? "DRAFT";
  let navOutcome: string | null = invoice?.nav_outcome ?? null;

  if (effectiveMode === "draft") {
    return { ok: true, id, number, state, navOutcome, emailed: false, mode: "draft" };
  }

  const issued = await call(`/api/v1/invoices/${id}/issue`, {
    method: "POST",
    idempotencyKey: `${input.orderId}:issue`,
  });
  if (issued.status !== 200 && issued.status !== 201) {
    return {
      ok: false,
      error: `issue ${issued.status}: ${JSON.stringify(issued.body).slice(0, 300)} (invoice ${id} left in draft)`,
    };
  }
  const issuedInvoice = issued.body?.invoice ?? issued.body;
  number = issuedInvoice?.invoice_number ?? number;
  state = issuedInvoice?.state ?? "ISSUED";
  navOutcome = issuedInvoice?.nav_outcome ?? navOutcome;

  // Tenant-level auto-send cannot be switched by an API key (403 on
  // /settings/issuer), so the e-mail is requested explicitly — and we can give it
  // context the standard TACITo template does not have. Best effort: a failed send
  // must not fail the invoice, which already exists and is at NAV.
  const subject = number ? `YellowSky — számla ${number}` : "YellowSky — számla";
  const message = `Thank you for your order. The invoice (számla) for order ${input.orderId} is attached.`;
  let emailed = false;
  const sent = await call(`/api/v1/invoices/${id}/send`, {
    method: "POST",
    body: { custom_subject: subject, custom_message: message },
    idempotencyKey: `${input.orderId}:send`,
  }).catch(() => ({ status: 0, body: {} as any }));
  emailed = sent.status === 200 || sent.status === 201 || sent.status === 204;

  return { ok: true, id, number, state, navOutcome, emailed, mode: effectiveMode };
}

/** Sample order used by the admin test endpoint. Never creates a real invoice. */
export function sampleOrderInvoiceInput() {
  const day = todayBudapest();
  return {
    orderId: `ys:order-TEST-${day.replace(/-/g, "")}`,
    buyer: {
      name: "Dénes András",
      email: "denandras@gmail.com",
      countryCode: "HU",
      postalCode: "1133",
      city: "Budapest",
      address: "Garam utca 23.",
    },
    lines: [
      {
        description: ART_LINE_DESCRIPTION,
        quantity: 1,
        unit: "DB",
        unitPriceGross: 16000,
        vatRate: "AAM",
      },
    ],
    note: `2020.01 Venice\nRendelés: ys:order-TEST`,
  };
}
