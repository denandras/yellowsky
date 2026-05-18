export type SiteLanguage = "hu" | "en";

export const SITE_LANGUAGE_COOKIE = "site-lang";
export const DEFAULT_SITE_LANGUAGE: SiteLanguage = "hu";

export function normalizeSiteLanguage(value: string | null | undefined): SiteLanguage {
  if (value === "en" || value === "hu") return value;
  return DEFAULT_SITE_LANGUAGE;
}
