import type { Metadata } from "next";
import { cookies } from "next/headers";
import { ListObjectsV2Command, GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getMediaTokenSecret, getS4ArtPrefix, getS4Config } from "@/lib/s4-config";
import { createMediaAccessToken } from "@/lib/media-access-token";
import { normalizeSiteLanguage, SITE_LANGUAGE_COOKIE } from "@/lib/site-language";
import { fetchStripeProducts, mapArtworksToProducts, type StripeProduct } from "@/lib/stripe-products";
import { syncArtworksToStripe } from "@/lib/sync-artworks";
import probe from "probe-image-size";
import WebshopPageClient from "@/components/webshop-page-client";

type MediaItem = {
  id: string;
  title: string;
  viewUrl: string;
  downloadUrl: string;
  product?: StripeProduct;
  width?: number;
  height?: number;
};

export const metadata: Metadata = {
  title: "Webshop | Yellowsky",
  description: "Purchase yellow sketches and prints by András Dénes.",
};

export const dynamic = "force-dynamic";

const IMAGE_EXTENSIONS = new Set(["jpg", "jpeg", "png", "webp", "gif", "avif"]);

function isImageKey(key: string) {
  const ext = key.split(".").pop()?.toLowerCase();
  return !!ext && IMAGE_EXTENSIONS.has(ext);
}

function fileExtension(key: string) {
  return key.split(".").pop()?.toLowerCase() ?? "jpg";
}

function extractTitle(key: string): string {
  const filename = key.split("/").pop() ?? key;
  const name = filename.replace(/\.[^.]+$/, "");
  return name.replace(/[_-]/g, " ");
}

function extractFilename(key: string): string {
  return key.split("/").pop() ?? key;
}

async function getArtItems(): Promise<MediaItem[]> {
  const cfg = getS4Config();
  const tokenSecret = getMediaTokenSecret();
  const artPrefix = getS4ArtPrefix();
  if (!cfg || !tokenSecret || !artPrefix) return [];

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

  // Get filenames for matching
  const filenames = keys.map(extractFilename);

  // Fetch Stripe products and match to artworks
  let stripeProducts = await fetchStripeProducts();
  let artworkToProduct = mapArtworksToProducts(filenames, stripeProducts);

  // If some artworks are missing products, trigger sync
  const hasArtworks = filenames.length > 0;
  const missingProducts = filenames.filter(f => !artworkToProduct.has(f));
  
  if (hasArtworks && missingProducts.length > 0) {
    // Auto-sync: create products for missing artworks
    console.log(`[Webshop] ${missingProducts.length} artworks missing products, triggering sync...`);
    const syncResult = await syncArtworksToStripe();
    console.log("[Webshop] Sync result:", syncResult);
    
    // Re-fetch products after sync
    if (syncResult.created > 0) {
      stripeProducts = await fetchStripeProducts();
      artworkToProduct = mapArtworksToProducts(filenames, stripeProducts);
    }
  }

  const sortedKeys = [...keys].sort((a, b) => b.localeCompare(a));

  // Filter to only show artworks that have matching Stripe products
  const availableItems: MediaItem[] = [];

  for (const key of sortedKeys) {
    const filename = extractFilename(key);
    const product = artworkToProduct.get(filename);

    if (!product) continue; // Skip artworks without Stripe products

    const ext = fileExtension(key);
    const ordinal = String(availableItems.length + 1).padStart(3, "0");
    const safeName = `yellowsky-${ordinal}.${ext}`;
    const accessToken = createMediaAccessToken(
      {
        key,
        name: safeName,
        exp: Date.now() + 1000 * 60 * 60 * 24,
      },
      tokenSecret,
    );
    const encodedToken = encodeURIComponent(accessToken);

    // Fetch image dimensions from S3
    let width: number | undefined;
    let height: number | undefined;

    try {
      const imageResponse = await client.send(
        new GetObjectCommand({
          Bucket: cfg.bucket,
          Key: key,
        }),
      );

      const stream = imageResponse.Body as NodeJS.ReadableStream;
      if (stream) {
        const probed = await probe(stream);
        width = probed.width;
        height = probed.height;
      }
    } catch (err) {
      console.error(`Failed to probe image dimensions for ${key}:`, err);
    }

    availableItems.push({
      id: product.id,
      title: product.name,
      viewUrl: `/api/media/file?token=${encodedToken}`,
      downloadUrl: `/api/media/file?token=${encodedToken}&download=1`,
      product,
      width,
      height,
    });
  }

  return availableItems;
}

export default async function WebshopPage() {
  const cookieStore = await cookies();
  const initialLanguage = normalizeSiteLanguage(
    cookieStore.get(SITE_LANGUAGE_COOKIE)?.value,
  );

  const artItems = await getArtItems();
  const hasConfig = !!getS4Config() && !!getS4ArtPrefix();
  const hasStripe = artItems.some(item => item.product);

  return <WebshopPageClient items={artItems} hasConfig={hasConfig && hasStripe} initialLanguage={initialLanguage} />;
}