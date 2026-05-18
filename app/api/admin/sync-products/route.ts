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

  const artworks = artworkKeys
    .sort((a, b) => b.localeCompare(a))
    .map((key) => ({
      key,
      filename: extractFilename(key),
      name: extractProductName(extractFilename(key)),
    }));

  // List Stripe products
  const products = await stripe.products.list({ active: true, limit: 100 });
  const existingProducts = new Map<string, Stripe.Product>();
  for (const product of products.data) {
    existingProducts.set(product.name, product);
  }

  // Map artworks to products
  const items = artworks.map((artwork) => {
    const product = existingProducts.get(artwork.name);
    return {
      ...artwork,
      hasProduct: !!product,
      productId: product?.id || null,
      prices: product
        ? null // Would need separate call to get prices
        : null,
    };
  });

  const missingProducts = items.filter((item) => !item.hasProduct);

  return NextResponse.json({
    total: items.length,
    existing: items.filter((i) => i.hasProduct).length,
    missing: missingProducts.length,
    items,
    missingItems: missingProducts,
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