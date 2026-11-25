import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getS4Config } from "./s4-config";

/**
 * The A4/A3 print prices live in the bucket so the owner can change them from
 * /admin/prices without a deploy. Amounts are in fillér (1 Ft = 100 fillér),
 * exactly like Stripe expects.
 *
 * Stored at _yellowsky/_config/prices.json. Missing/invalid file = defaults,
 * so the shop keeps working if the object is ever deleted.
 */
export type PriceSettings = {
  a4: number;
  a3: number;
  updatedAt: string | null;
};

const KEY = "_yellowsky/_config/prices.json";
const DEFAULTS: PriceSettings = { a4: 1600000, a3: 2400000, updatedAt: null };
const TTL_MS = 60_000;

let cache: { at: number; value: PriceSettings } | null = null;

function isAmount(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value > 0 && value <= 100_000_000;
}

function s3Client(): { s3: S3Client; bucket: string } {
  const cfg = getS4Config();
  if (!cfg) throw new Error("S3 not configured");
  return {
    bucket: cfg.bucket,
    s3: new S3Client({
      endpoint: cfg.endpoint,
      region: cfg.region,
      forcePathStyle: true,
      credentials: { accessKeyId: cfg.accessKeyId, secretAccessKey: cfg.secretAccessKey },
    }),
  };
}

export async function getPrices(): Promise<PriceSettings> {
  if (cache && Date.now() - cache.at < TTL_MS) return cache.value;

  let value: PriceSettings = DEFAULTS;
  try {
    const { s3, bucket } = s3Client();
    const res = await s3.send(new GetObjectCommand({ Bucket: bucket, Key: KEY }));
    const text = await res.Body?.transformToString();
    const parsed = text ? JSON.parse(text) : null;
    if (parsed && isAmount(parsed.a4) && isAmount(parsed.a3)) {
      value = {
        a4: parsed.a4,
        a3: parsed.a3,
        updatedAt: typeof parsed.updatedAt === "string" ? parsed.updatedAt : null,
      };
    }
  } catch {
    // NoPricesFile / NoSuchKey / network: fall back to defaults, never break checkout.
    value = DEFAULTS;
  }

  cache = { at: Date.now(), value };
  return value;
}

export async function setPrices(a4: number, a3: number): Promise<PriceSettings> {
  if (!isAmount(a4) || !isAmount(a3)) {
    throw new Error("prices must be positive integer fillér amounts");
  }
  const value: PriceSettings = { a4, a3, updatedAt: new Date().toISOString() };
  const { s3, bucket } = s3Client();
  await s3.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: KEY,
      Body: JSON.stringify(value, null, 2),
      ContentType: "application/json",
    }),
  );
  cache = { at: Date.now(), value };
  return value;
}

/** Test helper: drop the in-process cache. */
export function clearPriceCache() {
  cache = null;
}
