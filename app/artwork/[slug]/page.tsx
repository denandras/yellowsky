import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getArtworkBySlug } from "@/lib/artwork-data";
import { cookies } from "next/headers";
import ArtworkPageClient from "@/components/artwork-page-client";
import { normalizeSiteLanguage, SITE_LANGUAGE_COOKIE } from "@/lib/site-language";

type Props = {
  params: Promise<{ slug: string }>;
};

// ISR: regenerate every 60 seconds
export const revalidate = 60;

// Dynamic rendering - don't pre-render all pages (avoids Stripe rate limits during build)
// Pages will be generated on-demand and cached
export const dynamic = "force-dynamic";

// Disable static params generation - ISR will handle this
// export async function generateStaticParams() {
//   const artworks = await getArtworks();
//   return artworks.map((artwork) => ({
//     slug: artwork.slug,
//   }));
// }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const artwork = await getArtworkBySlug(slug);

  if (!artwork) {
    return { title: "Artwork not found" };
  }

  return {
    title: artwork.title,
    description: artwork.alt,
    openGraph: {
      title: `${artwork.title} | Yellowsky`,
      description: artwork.alt,
      images: [artwork.heroUrl ?? artwork.viewUrl],
    },
  };
}

export default async function ArtworkPage({ params }: Props) {
  const { slug } = await params;
  const artwork = await getArtworkBySlug(slug);

  if (!artwork) {
    notFound();
  }

  const cookieStore = await cookies();
  const initialLanguage = normalizeSiteLanguage(
    cookieStore.get(SITE_LANGUAGE_COOKIE)?.value,
  );

  return <ArtworkPageClient artwork={artwork} initialLanguage={initialLanguage} />;
}