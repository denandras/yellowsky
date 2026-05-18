import type { Metadata } from "next";
import { cookies } from "next/headers";
import Link from "next/link";
import { normalizeSiteLanguage, SITE_LANGUAGE_COOKIE } from "@/lib/site-language";
import LegalPageClient from "@/components/legal-page-client";

export const metadata: Metadata = {
  title: "Legal Notice & Privacy Policy | Yellowsky",
  description: "Privacy policy, GDPR compliance, and legal information for Yellowsky by András Dénes.",
};

export default async function LegalPage() {
  const cookieStore = await cookies();
  const initialLanguage = normalizeSiteLanguage(
    cookieStore.get(SITE_LANGUAGE_COOKIE)?.value,
  );

  return <LegalPageClient initialLanguage={initialLanguage} />;
}