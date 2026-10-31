import { cookies } from "next/headers";
import HomePageClient from "@/components/home-page-client";
import { resolveSiteLanguage, SITE_LANGUAGE_COOKIE } from "@/lib/site-language";

export default async function Home() {
  const cookieStore = await cookies();
  const initialLanguage = await resolveSiteLanguage(
    cookieStore.get(SITE_LANGUAGE_COOKIE)?.value,
  );

  return <HomePageClient initialLanguage={initialLanguage} />;
}