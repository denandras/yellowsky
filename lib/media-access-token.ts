import { createHmac, timingSafeEqual } from "node:crypto";

export type MediaAccessPayload = {
  key: string;
  name: string;
  exp: number;
};

/**
 * Token expiry snapped to a 30-day grid: always 30-60 days out, changing at
 * most once per 30 days. Combined with a stable `name`, the same (key, name)
 * produces the identical token for the whole window, so image URLs — and
 * therefore Vercel edge / image-optimizer cache keys — stay stable across
 * ISR regenerations instead of churning on every render (which forced every
 * store-page image through the cold S3 proxy path every 30 minutes).
 */
const TOKEN_EXPIRY_GRID_MS = 30 * 24 * 60 * 60 * 1000;

export function nextMediaTokenExpiry(now: number = Date.now()): number {
  return (Math.floor(now / TOKEN_EXPIRY_GRID_MS) + 2) * TOKEN_EXPIRY_GRID_MS;
}

function signPayload(payloadBase64: string, secret: string) {
  return createHmac("sha256", secret).update(payloadBase64).digest("base64url");
}

function isValidPayload(input: unknown): input is MediaAccessPayload {
  if (!input || typeof input !== "object") return false;

  const payload = input as Partial<MediaAccessPayload>;
  return (
    typeof payload.key === "string" &&
    payload.key.length > 0 &&
    typeof payload.name === "string" &&
    payload.name.length > 0 &&
    typeof payload.exp === "number" &&
    Number.isFinite(payload.exp)
  );
}

export function createMediaAccessToken(payload: MediaAccessPayload, secret: string) {
  const payloadBase64 = Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
  const signature = signPayload(payloadBase64, secret);
  return `${payloadBase64}.${signature}`;
}

export function verifyMediaAccessToken(token: string, secret: string): MediaAccessPayload | null {
  const [payloadBase64, providedSignature, ...rest] = token.split(".");
  if (!payloadBase64 || !providedSignature || rest.length > 0) return null;

  const expectedSignature = signPayload(payloadBase64, secret);
  const providedBuffer = Buffer.from(providedSignature, "utf8");
  const expectedBuffer = Buffer.from(expectedSignature, "utf8");

  if (providedBuffer.length !== expectedBuffer.length) return null;
  if (!timingSafeEqual(providedBuffer, expectedBuffer)) return null;

  try {
    const payloadRaw = Buffer.from(payloadBase64, "base64url").toString("utf8");
    const payload = JSON.parse(payloadRaw);

    if (!isValidPayload(payload)) return null;
    if (payload.exp < Date.now()) return null;

    return payload;
  } catch {
    return null;
  }
}