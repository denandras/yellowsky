export type SiteLanguage = "hu" | "en";

export const SITE_LANGUAGE_COOKIE = "site-lang";
export const DEFAULT_SITE_LANGUAGE: SiteLanguage = "en";

export function normalizeSiteLanguage(value: string | null | undefined): SiteLanguage {
  if (value === "en" || value === "hu") return value;
  return DEFAULT_SITE_LANGUAGE;
}

export function detectSiteLanguageFromAcceptLanguage(header: string | null | undefined): SiteLanguage {
  if (!header) return DEFAULT_SITE_LANGUAGE;
  const first = header.split(",")[0]?.trim().toLowerCase();
  if (!first) return DEFAULT_SITE_LANGUAGE;
  if (first.startsWith("hu")) return "hu";
  if (first.startsWith("en")) return "en";
  return DEFAULT_SITE_LANGUAGE;
}

export async function resolveSiteLanguage(cookieValue: string | null | undefined): Promise<SiteLanguage> {
  // stored preference wins
  const normalized = normalizeSiteLanguage(cookieValue);
  if (cookieValue === "en" || cookieValue === "hu") return normalized;
  // no stored preference -> detect from browser
  const { headers } = await import("next/headers");
  const accept = (await headers()).get("accept-language");
  return detectSiteLanguageFromAcceptLanguage(accept);
}
