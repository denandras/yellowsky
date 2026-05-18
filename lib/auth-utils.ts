import { NextRequest, NextResponse } from "next/server";
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
    // File missing/unreadable
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

export function getAdminApiKey(): string | null {
  return fromEnv("ADMIN_API_KEY")?.trim() || null;
}

/**
 * Validates admin API key from:
 * 1. Authorization: Bearer <key>
 * 2. X-Admin-Key header
 * 3. ?key=<key> query param
 */
export function validateAdminAuth(request: NextRequest): { valid: boolean; error?: string } {
  const configuredKey = getAdminApiKey();

  // If no key configured, allow access (development mode)
  if (!configuredKey) {
    console.warn("ADMIN_API_KEY not configured - admin endpoints are unprotected");
    return { valid: true };
  }

  // Check Authorization header
  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const key = authHeader.slice(7).trim();
    if (key === configuredKey) {
      return { valid: true };
    }
  }

  // Check X-Admin-Key header
  const headerKey = request.headers.get("x-admin-key");
  if (headerKey?.trim() === configuredKey) {
    return { valid: true };
  }

  // Check query param
  const queryKey = request.nextUrl.searchParams.get("key");
  if (queryKey?.trim() === configuredKey) {
    return { valid: true };
  }

  return { valid: false, error: "Unauthorized - invalid or missing API key" };
}