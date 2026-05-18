import { readFileSync } from "node:fs";
import { join } from "node:path";

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

function fromEnv(name: string): string | undefined {
  const runtimeValue = process.env[name]?.trim();
  if (runtimeValue) return runtimeValue;

  const envFile = parseDotEnv();
  const fileValue = envFile[name]?.trim();
  return fileValue || undefined;
}

export function getStripeSecretKey(): string | null {
  return fromEnv("STRIPE_SECRET_KEY")?.trim() || null;
}

export function getStripePublishableKey(): string | null {
  return fromEnv("NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY")?.trim() || null;
}