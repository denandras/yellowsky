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
  archived: number;
  skipped: number;
  errors: Array<{ name: string; error: string }>;
};

/**
 * Syncs artworks from S3 to Stripe products.
 * - Creates products for artworks that don't have matching Stripe products
 * - Archives orphaned products (products without matching S3 artwork)
 * - Archives duplicate products (keeps oldest, archives rest)
 */
export async function syncArtworksToStripe(
  priceA4: number = 1600000,  // 16,000 HUF in fillér
  priceA3: number = 2400000,  // 24,000 HUF in fillér
  limit: number = 50
): Promise<SyncResult> {
  const secretKey = getStripeSecretKey();
  if (!secretKey) {
    return { created: 0, archived: 0, skipped: 0, errors: [{ name: "config", error: "Stripe not configured" }] };
  }

  const cfg = getS4Config();
  const artPrefix = getS4ArtPrefix();
  if (!cfg || !artPrefix) {
    return { created: 0, archived: 0, skipped: 0, errors: [{ name: "config", error: "S3 not configured" }] };
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
    archived: 0,
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

  // Archive orphaned and duplicate products
  const artworkNames = new Set(artworks.map((a) => a.name));

  // Get ALL products (not just active) to find orphans and duplicates
  const allProducts: Stripe.Product[] = [];
  let hasMore = true;
  let startingAfter: string | undefined;

  while (hasMore) {
    const batch = await stripe.products.list({
      limit: 100,
      starting_after: startingAfter,
    });
    allProducts.push(...batch.data);
    hasMore = batch.has_more;
    startingAfter = batch.data[batch.data.length - 1]?.id;
  }

  // Find yellowsky products (by metadata or name match)
  const yellowskyByMetadata = allProducts.filter(
    (p) => p.metadata.source === "yellowsky"
  );

  // Find orphaned products (have yellowsky metadata but no matching artwork)
  const orphanedProducts = yellowskyByMetadata.filter(
    (p) => !artworkNames.has(p.name)
  );

  // Find duplicate products (same name, keep oldest)
  const yellowskyByName = allProducts.filter(
    (p) => artworkNames.has(p.name) && p.metadata.source !== "yellowsky"
  );
  const allYellowskyProducts = [...yellowskyByMetadata, ...yellowskyByName];
  const nameMatchCounts = new Map<string, Stripe.Product[]>();
  for (const p of allYellowskyProducts) {
    const existing = nameMatchCounts.get(p.name) || [];
    nameMatchCounts.set(p.name, [...existing, p]);
  }
  const duplicateProducts: Stripe.Product[] = [];
  for (const [, products] of nameMatchCounts) {
    if (products.length > 1) {
      // Sort by creation date, keep first, archive rest
      products.sort((a, b) => a.created - b.created);
      duplicateProducts.push(...products.slice(1));
    }
  }

  // Archive orphaned and duplicate products
  const toArchive = [...orphanedProducts, ...duplicateProducts];
  for (const product of toArchive) {
    try {
      if (product.active) {
        await stripe.products.update(product.id, { active: false });
        result.archived++;
      }
    } catch (err) {
      const error = err instanceof Error ? err.message : String(err);
      result.errors.push({ name: product.name, error });
    }
  }

  return result;
}