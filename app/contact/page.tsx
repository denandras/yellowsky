import { cookies } from "next/headers";
import ContactPageClient from "@/components/contact-page-client";
import { normalizeSiteLanguage, SITE_LANGUAGE_COOKIE } from "@/lib/site-language";

export default async function ContactPage() {
  const cookieStore = await cookies();
  const initialLanguage = normalizeSiteLanguage(
    cookieStore.get(SITE_LANGUAGE_COOKIE)?.value,
  );

  return <ContactPageClient initialLanguage={initialLanguage} />;
}