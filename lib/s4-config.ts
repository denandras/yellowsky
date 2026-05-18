import { readFileSync } from "node:fs";
import { join } from "node:path";

type S4Config = {
  endpoint: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucket: string;
  region: string;
  prefix: string;
};

let cachedEnv: Record<string, string> | null = null;

function parseDotEnv(): Record<string, string> {
  if (cachedEnv) return cachedEnv;

  const envPath = join(process.cwd(), ".env.local");
  const out: Record<string, string> = {};

  try {
    const raw = readFileSync(envPath, "utf8");
    for (const line of raw.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq < 0) continue;

      const key = trimmed.slice(0, eq).trim();
      let value = trimmed.slice(eq + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      out[key] = value;
    }
  } catch {
    // If .env.local is missing/unreadable, fallback to process.env only.
  }

  cachedEnv = out;
  return out;
}

function fromRepoEnv(name: string): string | undefined {
  const runtimeValue = process.env[name]?.trim();
  if (runtimeValue) return runtimeValue;

  const envFile = parseDotEnv();
  const fileValue = envFile[name]?.trim();
  return fileValue || undefined;
}

export function getS4Config(): S4Config | null {
  const endpoint = fromRepoEnv("S4_ENDPOINT");
  const accessKeyId = fromRepoEnv("S4_ACCESS_KEY_ID");
  const secretAccessKey = fromRepoEnv("S4_SECRET_ACCESS_KEY");
  const region = fromRepoEnv("S4_REGION") ?? "us-east-1";
  const bucket = fromRepoEnv("S4_BUCKET") ?? "tb1";
  const prefix = fromRepoEnv("S4_PREFIX");

  if (!endpoint || !accessKeyId || !secretAccessKey || !prefix) {
    return null;
  }

  return {
    endpoint,
    accessKeyId,
    secretAccessKey,
    region,
    prefix,
    bucket,
  };
}

export function getS4CvPrefix(): string | null {
  const prefix = fromRepoEnv("S4_CV_PREFIX")?.trim();
  return prefix || null;
}

export function getS4UpcomingPrefix(): string | null {
  const prefix = fromRepoEnv("S4_UPCOMING_PREFIX")?.trim();
  return prefix || null;
}

export function getS4ArtPrefix(): string | null {
  const prefix = fromRepoEnv("S4_ART_PREFIX")?.trim();
  return prefix || null;
}

export function getMediaTokenSecret(): string | null {
  const dedicated = fromRepoEnv("MEDIA_TOKEN_SECRET")?.trim();
  if (dedicated) return dedicated;

  // Backward-compatible fallback; prefer MEDIA_TOKEN_SECRET in production.
  const fallback = fromRepoEnv("S4_SECRET_ACCESS_KEY")?.trim();
  return fallback || null;
}
