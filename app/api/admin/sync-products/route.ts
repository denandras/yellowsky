import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getStripeSecretKey } from "@/lib/stripe-config";
import { getS4Config, getS4ArtPrefix } from "@/lib/s4-config";
import { validateAdminAuth } from "@/lib/auth-utils";
import { ListObjectsV2Command, S3Client } from "@aws-sdk/client-s3";

export const dynamic = "force-dynamic";

const IMAGE_EXTENSIONS = new Set(["jpg", "jpeg", "png", "webp", "gif", "avif"]);

function isImageKey(key: string) {
  const ext = key.split(".").pop()?.toLowerCase();
  return !!ext && IMAGE_EXTENSIONS.has(ext);
}

function extractFilename(key: string): string {
  return key.split("/").pop() ?? key;
}

function extractProductName(filename: string): string {
  // "2020.01 Venice.png" → "2020.01 Venice"
  return filename.replace(/\.[^.]+$/, "");
}

/**
 * GET /api/admin/sync-products
 * Lists artworks and their Stripe product status
 * Also reports orphaned products (in Stripe but not in S3)
 */
export async function GET(request: NextRequest) {
  // Auth check
  const auth = validateAdminAuth(request);
  if (!auth.valid) {
    return NextResponse.json({ error: auth.error }, { status: 401 });
  }

  const secretKey = getStripeSecretKey();
  if (!secretKey) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 500 });
  }

  const cfg = getS4Config();
  const artPrefix = getS4ArtPrefix();
  if (!cfg || !artPrefix) {
    return NextResponse.json({ error: "S3 not configured" }, { status: 500 });
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

  const artworkNames = new Set(
    artworkKeys
      .sort((a, b) => b.localeCompare(a))
      .map((key) => extractProductName(extractFilename(key)))
  );

  // List ALL Stripe products (both active and inactive)
  const allProducts: Stripe.Product[] = [];
  let hasMore = true;
  let startingAfter: string | undefined;

  while (hasMore) {
    const products = await stripe.products.list({ 
      limit: 100,
      starting_after: startingAfter,
    });
    allProducts.push(...products.data);
    hasMore = products.has_more;
    startingAfter = products.data[products.data.length - 1]?.id;
  }

  // Separate into yellowsky products and others
  const yellowskyProducts = allProducts.filter(
    (p) => p.metadata.source === "yellowsky" || artworkNames.has(p.name)
  );

  // Find orphaned products (in Stripe but not in S3)
  const orphanedProducts = yellowskyProducts.filter(
    (p) => !artworkNames.has(p.name)
  );

  // Find products in S3 but not in Stripe
  const productsByName = new Map<string, Stripe.Product>();
  for (const product of yellowskyProducts) {
    productsByName.set(product.name, product);
  }

  const missingProducts = [...artworkNames].filter(
    (name) => !productsByName.has(name)
  );

  // Map artworks to products
  const artworkKeysSorted = artworkKeys.sort((a, b) => b.localeCompare(a));
  const items = artworkKeysSorted.map((key) => {
    const name = extractProductName(extractFilename(key));
    const product = productsByName.get(name);
    return {
      key,
      filename: extractFilename(key),
      name,
      hasProduct: !!product,
      productId: product?.id || null,
      active: product?.active ?? null,
    };
  });

  return NextResponse.json({
    s3: {
      total: artworkNames.size,
    },
    stripe: {
      totalProducts: allProducts.length,
      yellowskyProducts: yellowskyProducts.length,
      active: yellowskyProducts.filter((p) => p.active).length,
      inactive: yellowskyProducts.filter((p) => !p.active).length,
    },
    sync: {
      inSync: items.filter((i) => i.hasProduct && i.active).length,
      missingProducts: missingProducts.length,
      orphanedProducts: orphanedProducts.length,
    },
    items,
    missingProducts: missingProducts.map((name) => ({ name })),
    orphanedProducts: orphanedProducts.map((p) => ({
      id: p.id,
      name: p.name,
      active: p.active,
      created: p.created,
    })),
  });
}

/**
 * POST /api/admin/sync-products
 * Creates Stripe products for artworks without products
 *
 * Body (optional):
 * - dryRun: boolean - If true, only reports what would be created (default: true)
 * - priceA4: number - Price for A4 size in HUF fillér (default: 1600000 = 16,000 HUF)
 * - priceA3: number - Price for A3 size in HUF fillér (default: 2400000 = 24,000 HUF)
 * - limit: number - Max products to create (default: 10)
 */
export async function POST(request: NextRequest) {
  // Auth check
  const auth = validateAdminAuth(request);
  if (!auth.valid) {
    return NextResponse.json({ error: auth.error }, { status: 401 });
  }

  const secretKey = getStripeSecretKey();
  if (!secretKey) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 500 });
  }

  const cfg = getS4Config();
  const artPrefix = getS4ArtPrefix();
  if (!cfg || !artPrefix) {
    return NextResponse.json({ error: "S3 not configured" }, { status: 500 });
  }

  const body = await request.json().catch(() => ({}));
  const dryRun = body.dryRun !== false; // Default to true for safety
  const priceA4 = body.priceA4 ?? 1600000; // 16,000 HUF in fillér
  const priceA3 = body.priceA3 ?? 2400000; // 24,000 HUF in fillér
  const limit = body.limit ?? 10;

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

  if (dryRun) {
    return NextResponse.json({
      message: "Dry run - no products created",
      dryRun: true,
      wouldCreate: toCreate.length,
      artworks: toCreate.map((a) => ({
        name: a.name,
        filename: a.filename,
        prices: [
          { nickname: "A4", amount: priceA4 / 100, currency: "HUF" },
          { nickname: "A3", amount: priceA3 / 100, currency: "HUF" },
        ],
      })),
      hint: "Set dryRun: false to actually create products",
    });
  }

  // Create products
  const created: Array<{
    name: string;
    productId: string;
    prices: Array<{ id: string; nickname: string; amount: number }>;
  }> = [];

  for (const artwork of toCreate) {
    // Create product
    const product = await stripe.products.create({
      name: artwork.name,
      description: `Yellow sketch by András Dénes — ${artwork.name}`,
      type: "good",
      shippable: true,
      images: [], // Would need to upload or provide URLs
      metadata: {
        source: "yellowsky",
        filename: artwork.filename,
      },
    });

    // Create A4 price
    const a4Price = await stripe.prices.create({
      product: product.id,
      unit_amount: priceA4,
      currency: "huf",
      nickname: "A4",
    });

    // Create A3 price
    const a3Price = await stripe.prices.create({
      product: product.id,
      unit_amount: priceA3,
      currency: "huf",
      nickname: "A3",
    });

    created.push({
      name: artwork.name,
      productId: product.id,
      prices: [
        { id: a4Price.id, nickname: "A4", amount: priceA4 / 100 },
        { id: a3Price.id, nickname: "A3", amount: priceA3 / 100 },
      ],
    });
  }

  return NextResponse.json({
    message: `Created ${created.length} products`,
    created,
    remaining: artworks.length - existingNames.size - created.length,
  });
}

/**
 * DELETE /api/admin/sync-products
 * Archives Stripe products that no longer have corresponding artworks in S3
 *
 * Body (optional):
 * - dryRun: boolean - If true, only reports what would be archived (default: true)
 * - productIds: string[] - Specific product IDs to archive (optional, if not set archives all orphaned)
 */
export async function DELETE(request: NextRequest) {
  // Auth check
  const auth = validateAdminAuth(request);
  if (!auth.valid) {
    return NextResponse.json({ error: auth.error }, { status: 401 });
  }

  const secretKey = getStripeSecretKey();
  if (!secretKey) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 500 });
  }

  const cfg = getS4Config();
  const artPrefix = getS4ArtPrefix();
  if (!cfg || !artPrefix) {
    return NextResponse.json({ error: "S3 not configured" }, { status: 500 });
  }

  const body = await request.json().catch(() => ({}));
  const dryRun = body.dryRun !== false; // Default to true for safety
  const specificProductIds = body.productIds as string[] | undefined;

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

  const artworkNames = new Set(
    artworkKeys.map((key) => extractProductName(extractFilename(key)))
  );

  // List ALL Stripe products
  const allProducts: Stripe.Product[] = [];
  let hasMore = true;
  let startingAfter: string | undefined;

  while (hasMore) {
    const products = await stripe.products.list({ 
      limit: 100,
      starting_after: startingAfter,
    });
    allProducts.push(...products.data);
    hasMore = products.has_more;
    startingAfter = products.data[products.data.length - 1]?.id;
  }

  // Find yellowsky products that are orphaned
  const yellowskyProducts = allProducts.filter(
    (p) => p.metadata.source === "yellowsky" || artworkNames.has(p.name)
  );

  const orphanedProducts = yellowskyProducts.filter(
    (p) => !artworkNames.has(p.name)
  );

  // If specific IDs provided, filter to those only
  const toArchive = specificProductIds
    ? orphanedProducts.filter((p) => specificProductIds.includes(p.id))
    : orphanedProducts;

  if (dryRun) {
    return NextResponse.json({
      message: "Dry run - no products archived",
      dryRun: true,
      wouldArchive: toArchive.length,
      orphanedProducts: toArchive.map((p) => ({
        id: p.id,
        name: p.name,
        active: p.active,
        created: p.created,
      })),
      hint: "Set dryRun: false to actually archive products",
    });
  }

  // Archive (set active: false) each orphaned product
  const archived: Array<{ id: string; name: string; wasActive: boolean }> = [];

  for (const product of toArchive) {
    const wasActive = product.active;
    await stripe.products.update(product.id, { active: false });
    archived.push({
      id: product.id,
      name: product.name,
      wasActive,
    });
  }

  return NextResponse.json({
    message: `Archived ${archived.length} products`,
    archived,
    remaining: orphanedProducts.length - archived.length,
  });
}