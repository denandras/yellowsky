import type { Metadata } from "next";
import { cookies } from "next/headers";
import { ListObjectsV2Command, S3Client } from "@aws-sdk/client-s3";
import { getMediaTokenSecret, getS4ArtPrefix, getS4Config } from "@/lib/s4-config";
import { createMediaAccessToken } from "@/lib/media-access-token";
import { normalizeSiteLanguage, SITE_LANGUAGE_COOKIE } from "@/lib/site-language";
import { fetchStripeProducts, mapArtworksToProducts } from "@/lib/stripe-products";
import { syncArtworksToStripe } from "@/lib/sync-artworks";
import WebshopPageClient from "@/components/webshop-page-client";

type MediaItem = {
  id: string;
  title: string;
  viewUrl: string;
  downloadUrl: string;
  productId?: string;
  productName?: string;
  prices?: Array<{ id: string; nickname?: string; unitAmount?: number; currency: string }>;
  hasProduct: boolean;
};

export const metadata: Metadata = {
  title: "Webshop | Yellowsky",
  description: "Purchase yellow sketches and prints by András Dénes.",
};

// Revalidate every 5 minutes - ISR caching
export const revalidate = 300;

const IMAGE_EXTENSIONS = new Set(["jpg", "jpeg", "png", "webp", "gif", "avif"]);

function isImageKey(key: string) {
  const ext = key.split(".").pop()?.toLowerCase();
  return !!ext && IMAGE_EXTENSIONS.has(ext);
}

function extractFilename(key: string): string {
  return key.split("/").pop() ?? key;
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

  // Check if sync is needed (some artworks missing products)
  const missingProducts = filenames.filter(f => !artworkToProduct.has(f));
  
  // Run sync in background - don't block page load
  if (missingProducts.length > 0) {
    console.log(`[Webshop] ${missingProducts.length} artworks missing products, triggering background sync...`);
    syncArtworksToStripe().catch(err => {
      console.error("[Webshop] Background sync error:", err);
    });
  }

  const sortedKeys = [...keys].sort((a, b) => b.localeCompare(a));

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

    allItems.push({
      id: hasProduct ? product.id : `art-${allItems.length}`,
      title: hasProduct ? product.name : title,
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

  return <WebshopPageClient items={artItems} hasConfig={hasConfig && hasStripe} initialLanguage={initialLanguage} />;
}