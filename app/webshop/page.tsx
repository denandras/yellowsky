import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { getS4ArtPrefix, getS4Config } from '@/lib/s4-config';
import { SITE_LANGUAGE_COOKIE, resolveSiteLanguage } from '@/lib/site-language';
import { getArtworks } from '@/lib/artwork-data';
import { SITE_URL } from '@/lib/config';
import WebshopPageClient from '@/components/webshop-page-client';
import JsonLd from '@/components/json-ld';

type MediaItem = {
  id: string;
  title: string;
  alt: string;
  viewUrl: string;
  productId?: string;
  productName?: string;
  prices?: Array<{ id: string; nickname?: string; unitAmount?: number; currency: string }>;
  hasProduct: boolean;
};

export const metadata: Metadata = {
  title: 'Webshop – Buy Fine Art Prints & Art Posters',
  description: 'Browse and purchase fine art prints on hemp paper — architectural sketches by András Dénes. Free worldwide shipping. A4 and A3 sizes available.',
  openGraph: {
    title: 'Webshop – Buy Fine Art Prints | Yellowsky',
    description: 'Browse and purchase fine art prints on hemp paper — architectural sketches by András Dénes. Free worldwide shipping. A4 and A3 sizes available.',
    url: `${SITE_URL}/webshop`,
    type: 'website',
  },
};

export default async function WebshopPage() {
  const cookieStore = await cookies();
  const initialLanguage = await resolveSiteLanguage(
    cookieStore.get(SITE_LANGUAGE_COOKIE)?.value,
  );

  // Shared catalog cache (unstable_cache, 5 min) — previously this page did
  // its own S3 list + Stripe fetch on every render, which made the
  // landing -> webshop navigation wait on MinIO + Stripe round trips.
  const artworks = await getArtworks();

  // Sort by year first, then by artwork number (numeric).
  // Filenames like "2020.105 Amsterdam.png" need numeric sort, not alphabetic.
  const sorted = [...artworks].sort((a, b) => {
    const matchA = a.filename.match(/^(\d{4})\.(\d+)/);
    const matchB = b.filename.match(/^(\d{4})\.(\d+)/);
    if (!matchA || !matchB) return b.filename.localeCompare(a.filename);
    const yearA = parseInt(matchA[1], 10);
    const yearB = parseInt(matchB[1], 10);
    if (yearA !== yearB) return yearB - yearA;
    return parseInt(matchB[2], 10) - parseInt(matchA[2], 10);
  });

  const artItems: MediaItem[] = sorted.map((art, index) => ({
    id: art.productId ?? `art-${index}`,
    title: art.productName ?? art.title,
    alt: art.alt,
    viewUrl: art.viewUrl,
    hasProduct: art.hasProduct,
    ...(art.hasProduct && art.productId && art.prices
      ? {
          productId: art.productId,
          productName: art.productName,
          prices: art.prices,
        }
      : {}),
  }));

  const hasConfig = !!getS4Config() && !!getS4ArtPrefix();
  const hasStripe = artItems.length > 0;

  // Get first artwork with product for structured data
  const firstProduct = artItems.find(item => item.hasProduct && item.prices && item.prices.length > 0);

  return (
    <>
      <JsonLd type="breadcrumb" />
      {firstProduct && (
        <JsonLd
          type="product"
          productData={{
            name: firstProduct.productName || firstProduct.title,
            description: `Fine art print on hemp paper — "${firstProduct.productName || firstProduct.title}" by András Dénes. Museum-quality art print available in A4 and A3 sizes.`,
            image: `${SITE_URL}${firstProduct.viewUrl}`,
            priceA4: firstProduct.prices?.find(p => p.nickname === "A4")?.unitAmount,
            priceA3: firstProduct.prices?.find(p => p.nickname === "A3")?.unitAmount,
            currency: firstProduct.prices?.[0]?.currency,
          }}
        />
      )}
      <WebshopPageClient items={artItems} hasConfig={hasConfig && hasStripe} initialLanguage={initialLanguage} />
    </>
  );
}