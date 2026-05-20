import type { Metadata } from "next";
import { cookies } from "next/headers";
import { normalizeSiteLanguage, SITE_LANGUAGE_COOKIE } from "@/lib/site-language";
import TermsPageClient from "@/components/terms-page-client";

export const metadata: Metadata = {
  title: "Terms of Service | Yellowsky",
  description: "Terms and conditions for purchasing prints from Yellowsky by András Dénes.",
};

export default async function TermsPage() {
  const cookieStore = await cookies();
  const initialLanguage = normalizeSiteLanguage(
    cookieStore.get(SITE_LANGUAGE_COOKIE)?.value,
  );

  return <TermsPageClient initialLanguage={initialLanguage} />;
}