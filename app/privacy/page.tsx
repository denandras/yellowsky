import type { Metadata } from "next";
import { cookies } from "next/headers";
import { resolveSiteLanguage, SITE_LANGUAGE_COOKIE } from "@/lib/site-language";
import PrivacyPageClient from "@/components/privacy-page-client";

export const metadata: Metadata = {
  title: "Privacy Policy | Yellowsky",
  description: "Privacy policy and data protection information for Yellowsky by András Dénes.",
};

export default async function PrivacyPage() {
  const cookieStore = await cookies();
  const initialLanguage = await resolveSiteLanguage(
    cookieStore.get(SITE_LANGUAGE_COOKIE)?.value,
  );

  return <PrivacyPageClient initialLanguage={initialLanguage} />;
}