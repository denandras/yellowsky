import { createHmac, timingSafeEqual } from "node:crypto";

export type MediaAccessPayload = {
  key: string;
  name: string;
  exp: number;
};

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
