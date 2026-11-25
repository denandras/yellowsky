import { NextRequest, NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";
import { getPrices, setPrices } from "@/lib/price-config";
import { ensureArtworkPrices } from "@/lib/sync-artworks";

export const dynamic = "force-dynamic";

/**
 * Owner-only price manager. Password comes from PRICE_ADMIN_PASSWORD; a valid
 * login sets an httpOnly cookie (12h) signed with the same secret, so the page
 * does not re-ask on every visit.
 *
 * GET    -> { a4, a3, updatedAt }            (requires cookie)
 * POST   -> { password }  sets the cookie    (login)
 * PUT    -> { a4, a3 }    saves + backfills  (requires cookie)
 * DELETE -> clears the cookie                (logout)
 */

const COOKIE = "ysp";
const MAX_AGE = 60 * 60 * 12;

function secret(): string | null {
  return process.env.PRICE_ADMIN_PASSWORD || null;
}

function sign(expiry: number, key: string): string {
  return createHmac("sha256", key).update(String(expiry)).digest("hex");
}

function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return timingSafeEqual(ab, bb);
}

function isAuthed(request: NextRequest): boolean {
  const key = secret();
  if (!key) return false;
  const raw = request.cookies.get(COOKIE)?.value;
  if (!raw) return false;
  const [expiryStr, sig] = raw.split(".");
  const expiry = Number(expiryStr);
  if (!Number.isFinite(expiry) || expiry < Math.floor(Date.now() / 1000)) return false;
  return safeEqual(sig ?? "", sign(expiry, key));
}

export async function GET(request: NextRequest) {
  if (!secret()) {
    return NextResponse.json({ error: "PRICE_ADMIN_PASSWORD not configured" }, { status: 500 });
  }
  if (!isAuthed(request)) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
  return NextResponse.json({ authenticated: true, ...(await getPrices()) });
}

export async function POST(request: NextRequest) {
  const key = secret();
  if (!key) {
    return NextResponse.json({ error: "PRICE_ADMIN_PASSWORD not configured" }, { status: 500 });
  }
  const body = await request.json().catch(() => ({}));
  const password = typeof body.password === "string" ? body.password : "";
  if (!password || !safeEqual(password, key)) {
    return NextResponse.json({ error: "Wrong password" }, { status: 401 });
  }
  const expiry = Math.floor(Date.now() / 1000) + MAX_AGE;
  const res = NextResponse.json({ authenticated: true, ...(await getPrices()) });
  res.cookies.set(COOKIE, `${expiry}.${sign(expiry, key)}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: true,
    path: "/",
    maxAge: MAX_AGE,
  });
  return res;
}

export async function PUT(request: NextRequest) {
  if (!isAuthed(request)) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  const body = await request.json().catch(() => ({}));
  const a4 = Number(body.a4);
  const a3 = Number(body.a3);
  if (!Number.isInteger(a4) || !Number.isInteger(a3) || a4 <= 0 || a3 <= 0) {
    return NextResponse.json({ error: "a4 and a3 must be positive integer fillér amounts" }, { status: 400 });
  }

  try {
    const saved = await setPrices(a4, a3);
    // Push the new amounts onto every existing artwork product (Stripe prices are
    // immutable: create new, repoint default_price, deactivate the old one).
    const backfill = await ensureArtworkPrices(saved.a4, saved.a3, false);
    return NextResponse.json({ saved, backfill });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE() {
  const res = NextResponse.json({ authenticated: false });
  res.cookies.set(COOKIE, "", { httpOnly: true, sameSite: "lax", secure: true, path: "/", maxAge: 0 });
  return res;
}
