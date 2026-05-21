import type { Metadata } from "next";
import { cookies } from "next/headers";
import { ListObjectsV2Command, S3Client } from "@aws-sdk/client-s3";
import { getMediaTokenSecret, getS4ArtPrefix, getS4Config } from "@/lib/s4-config";
import { createMediaAccessToken } from "@/lib/media-access-token";
import { normalizeSiteLanguage, SITE_LANGUAGE_COOKIE } from "@/lib/site-language";
import { fetchStripeProducts, mapArtworksToProducts } from "@/lib/stripe-products";
import WebshopPageClient from "@/components/webshop-page-client";
import JsonLd from "@/components/json-ld";

type MediaItem = {
  id: string;
  title: string;
  alt: string;
  viewUrl: string;
  downloadUrl: string;
  productId?: string;
  productName?: string;
  prices?: Array<{ id: string; nickname?: string; unitAmount?: number; currency: string }>;
  hasProduct: boolean;
};

export const metadata: Metadata = {
  title: "Webshop – Buy Giclée Prints & Art Posters",
  description: "Browse and purchase museum-quality giclée prints and art posters of András Dénes' yellow sketches. Free worldwide shipping. A4 and A3 sizes available.",
  openGraph: {
    title: "Webshop – Buy Giclée Prints | Yellowsky",
    description: "Browse and purchase museum-quality giclée prints of yellow sketches. Free worldwide shipping. A4 and A3 sizes available.",
    url: "https://yellowsky.andrasdenes.com/webshop",
    type: "website",
  },
};

// Revalidate every 2 minutes - ISR caching (faster refresh for product availability)
export const revalidate = 120;

const IMAGE_EXTENSIONS = new Set(["jpg", "jpeg", "png", "webp", "gif", "avif"]);

function isImageKey(key: string) {
  const ext = key.split(".").pop()?.toLowerCase();
  return !!ext && IMAGE_EXTENSIONS.has(ext);
}

function extractFilename(key: string): string {
  return key.split("/").pop() ?? key;
}

/**
 * Generate alt text from filename.
 * Pattern: "2020.105 Amsterdam.png" → "Architectural sketch of Amsterdam, 2020 — giclée print on hemp paper"
 */
function generateAltText(filename: string): string {
  // Remove extension
  const title = filename.replace(/\.[^.]+$/, "");
  
  // Extract year (first 4 digits)
  const yearMatch = title.match(/^(\d{4})/);
  const year = yearMatch ? yearMatch[1] : "";
  
  // Extract subject (everything after "YEAR.NUMBER ")
  const subjectMatch = title.match(/^\d{4}\.\d+\s+(.+)$/);
  const subject = subjectMatch ? subjectMatch[1] : title;
  
  // Build alt text
  const yearPart = year ? `, ${year}` : "";
  return `Architectural sketch of ${subject}${yearPart} — giclée print on hemp paper`;
}

async function getArtItems(): Promise<MediaItem[]> {
  const cfg = getS4Config();
  const tokenSecret = getMediaTokenSecret();
  const artPrefix = getS4ArtPrefix();
  if (!cfg || !tokenSecret || !artPrefix) return [];

  // Parallelize: fetch S3 list and Stripe products at the same time
  const [s3Result, stripeProducts] = await Promise.all([
    (async () => {
      const client = new S3Client({
        endpoint: cfg.endpoint,
        region: cfg.region,
        forcePathStyle: true,
        credentials: {
          accessKeyId: cfg.accessKeyId,
          secretAccessKey: cfg.secretAccessKey,
        },
      });

      const keys: string[] = [];
      let token: string | undefined;

      do {
        const list = await client.send(
          new ListObjectsV2Command({
            Bucket: cfg.bucket,
            Prefix: artPrefix,
            ContinuationToken: token,
            MaxKeys: 500,
          }),
        );

        for (const obj of list.Contents ?? []) {
          if (!obj.Key) continue;
          if (!isImageKey(obj.Key)) continue;
          keys.push(obj.Key);
        }

        token = list.IsTruncated ? list.NextContinuationToken : undefined;
      } while (token);

      return { keys, client };
    })(),
    fetchStripeProducts(),
  ]);

  const { keys, client } = s3Result;
  const filenames = keys.map(extractFilename);
  const artworkToProduct = mapArtworksToProducts(filenames, stripeProducts);

  // Sync is handled by systemd timer (yellowsky-sync.timer) every 10 minutes
  // No need to run on every page load

  // Sort by year first, then by artwork number (numeric)
  // Filenames like "2020.105 Amsterdam.png" need numeric sort, not alphabetic
  const sortedKeys = [...keys].sort((a, b) => {
    const filenameA = extractFilename(a);
    const filenameB = extractFilename(b);
    
    const matchA = filenameA.match(/^(\d{4})\.(\d+)/);
    const matchB = filenameB.match(/^(\d{4})\.(\d+)/);
    
    if (!matchA || !matchB) {
      // Fallback to alphabetic sort for non-standard filenames
      return b.localeCompare(a);
    }
    
    const yearA = parseInt(matchA[1], 10);
    const yearB = parseInt(matchB[1], 10);
    
    if (yearA !== yearB) {
      return yearB - yearA; // Newer year first
    }
    
    const numA = parseInt(matchA[2], 10);
    const numB = parseInt(matchB[2], 10);
    
    return numB - numA; // Higher number = newer artwork
  });

  // Show all artworks, with prices when products exist
  const allItems: MediaItem[] = [];

  for (const key of sortedKeys) {
    const filename = extractFilename(key);
    const product = artworkToProduct.get(filename);
    const hasProduct = !!product;

    const ext = key.split(".").pop()?.toLowerCase() ?? "jpg";
    const ordinal = String(allItems.length + 1).padStart(3, "0");
    const safeName = `yellowsky-${ordinal}.${ext}`;
    const accessToken = createMediaAccessToken(
      {
        key,
        name: safeName,
        exp: Date.now() + 1000 * 60 * 60 * 24,
      },
      tokenSecret,
    );

    // Extract title from filename (remove extension)
    const title = filename.replace(/\.[^.]+$/, "");
    const alt = generateAltText(filename);

    allItems.push({
      id: hasProduct ? product.id : `art-${allItems.length}`,
      title: hasProduct ? product.name : title,
      alt,
      viewUrl: `/api/media/file?token=${encodeURIComponent(accessToken)}`,
      downloadUrl: `/api/media/file?token=${encodeURIComponent(accessToken)}&download=1`,
      hasProduct,
      ...(hasProduct && product ? {
        productId: product.id,
        productName: product.name,
        prices: product.prices.map(p => ({
          id: p.id,
          nickname: p.nickname ?? undefined,
          unitAmount: p.unitAmount ?? undefined,
          currency: p.currency,
        })),
      } : {}),
    });
  }

  return allItems;
}

export default async function WebshopPage() {
  const cookieStore = await cookies();
  const initialLanguage = normalizeSiteLanguage(
    cookieStore.get(SITE_LANGUAGE_COOKIE)?.value,
  );

  const artItems = await getArtItems();
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
            description: `Giclée print on hemp paper — "${firstProduct.productName || firstProduct.title}" by András Dénes. Museum-quality art print available in A4 and A3 sizes.`,
            image: `https://yellowsky.andrasdenes.com${firstProduct.viewUrl}`,
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