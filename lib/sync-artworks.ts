import Stripe from "stripe";
import { getStripeSecretKey } from "./stripe-config";
import { getS4Config, getS4ArtPrefix } from "./s4-config";
import { ListObjectsV2Command, S3Client } from "@aws-sdk/client-s3";

const IMAGE_EXTENSIONS = new Set(["jpg", "jpeg", "png", "webp", "gif", "avif"]);

function isImageKey(key: string) {
  const ext = key.split(".").pop()?.toLowerCase();
  return !!ext && IMAGE_EXTENSIONS.has(ext);
}

function extractFilename(key: string): string {
  return key.split("/").pop() ?? key;
}

function extractProductName(filename: string): string {
  return filename.replace(/\.[^.]+$/, "");
}

export type SyncResult = {
  created: number;
  skipped: number;
  errors: Array<{ name: string; error: string }>;
};

/**
 * Syncs artworks from S3 to Stripe products.
 * Creates products for artworks that don't have matching Stripe products.
 */
export async function syncArtworksToStripe(
  priceA4: number = 1600000,  // 16,000 HUF in fillér
  priceA3: number = 2400000,  // 24,000 HUF in fillér
  limit: number = 50
): Promise<SyncResult> {
  const secretKey = getStripeSecretKey();
  if (!secretKey) {
    return { created: 0, skipped: 0, errors: [{ name: "config", error: "Stripe not configured" }] };
  }

  const cfg = getS4Config();
  const artPrefix = getS4ArtPrefix();
  if (!cfg || !artPrefix) {
    return { created: 0, skipped: 0, errors: [{ name: "config", error: "S3 not configured" }] };
  }

  const stripe = new Stripe(secretKey, {
    apiVersion: "2026-04-22.dahlia",
  });

  // List artworks from S3
  const s3 = new S3Client({
    endpoint: cfg.endpoint,
    region: cfg.region,
    forcePathStyle: true,
    credentials: {
      accessKeyId: cfg.accessKeyId,
      secretAccessKey: cfg.secretAccessKey,
    },
  });

  const artworkKeys: string[] = [];
  let token: string | undefined;

  do {
    const list = await s3.send(
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
      artworkKeys.push(obj.Key);
    }

    token = list.IsTruncated ? list.NextContinuationToken : undefined;
  } while (token);

  const artworks = artworkKeys
    .sort((a, b) => b.localeCompare(a))
    .map((key) => ({
      key,
      filename: extractFilename(key),
      name: extractProductName(extractFilename(key)),
    }));

  // List existing Stripe products
  const products = await stripe.products.list({ active: true, limit: 100 });
  const existingNames = new Set(products.data.map((p) => p.name));

  // Find artworks without products
  const toCreate = artworks
    .filter((artwork) => !existingNames.has(artwork.name))
    .slice(0, limit);

  const result: SyncResult = {
    created: 0,
    skipped: artworks.length - existingNames.size > limit ? limit : Math.max(0, artworks.length - existingNames.size),
    errors: [],
  };

  // Create products
  for (const artwork of toCreate) {
    try {
      // Create product
      const product = await stripe.products.create({
        name: artwork.name,
        description: `Yellow sketch by András Dénes — ${artwork.name}`,
        type: "good",
        shippable: true,
        images: [],
        metadata: {
          source: "yellowsky",
          filename: artwork.filename,
        },
      });

      // Create A4 price
      await stripe.prices.create({
        product: product.id,
        unit_amount: priceA4,
        currency: "huf",
        nickname: "A4",
      });

      // Create A3 price
      await stripe.prices.create({
        product: product.id,
        unit_amount: priceA3,
        currency: "huf",
        nickname: "A3",
      });

      result.created++;
    } catch (err) {
      const error = err instanceof Error ? err.message : String(err);
      result.errors.push({ name: artwork.name, error });
    }
  }

  return result;
}