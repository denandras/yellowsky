import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getStripeSecretKey } from "@/lib/stripe-config";
import { getS4Config, getS4ArtPrefix } from "@/lib/s4-config";
import { validateAdminAuth } from "@/lib/auth-utils";
import { syncArtworksToStripe } from "@/lib/sync-artworks";
import { ListObjectsV2Command, S3Client } from "@aws-sdk/client-s3";

export const dynamic = "force-dynamic";

// Webshop images: PNG/WebP/AVIF only (no JPG/JPEG)
// JPG files are reserved for product page previews
const IMAGE_EXTENSIONS = new Set(["png", "webp", "gif", "avif"]);

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

  // Separate into yellowsky products (by metadata or name match) and others
  const yellowskyByMetadata = allProducts.filter(
    (p) => p.metadata.source === "yellowsky"
  );
  const yellowskyByName = allProducts.filter(
    (p) => artworkNames.has(p.name) && p.metadata.source !== "yellowsky"
  );
  const yellowskyProducts = [...yellowskyByMetadata, ...yellowskyByName];

  // Find orphaned products (have yellowsky metadata but no matching artwork)
  const orphanedByMetadata = yellowskyByMetadata.filter(
    (p) => !artworkNames.has(p.name)
  );
  // Find products that match artwork names but might have duplicates
  const allYellowskyProducts = [...yellowskyByMetadata, ...yellowskyByName];
  const nameMatchCounts = new Map<string, Stripe.Product[]>();
  for (const p of allYellowskyProducts) {
    const existing = nameMatchCounts.get(p.name) || [];
    nameMatchCounts.set(p.name, [...existing, p]);
  }
  const duplicateProducts: Stripe.Product[] = [];
  for (const [, products] of nameMatchCounts) {
    if (products.length > 1) {
      // All but the first are duplicates
      duplicateProducts.push(...products.slice(1));
    }
  }

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
      yellowskyByMetadata: yellowskyByMetadata.length,
      yellowskyByName: yellowskyByName.length,
      active: yellowskyProducts.filter((p) => p.active).length,
      inactive: yellowskyProducts.filter((p) => !p.active).length,
    },
    sync: {
      inSync: items.filter((i) => i.hasProduct && i.active).length,
      missingProducts: missingProducts.length,
      orphanedProducts: orphanedByMetadata.length,
      duplicateProducts: duplicateProducts.length,
    },
    items,
    missingProducts: missingProducts.map((name) => ({ name })),
    orphanedProducts: orphanedByMetadata.map((p) => ({
      id: p.id,
      name: p.name,
      active: p.active,
      created: p.created,
      hasMetadata: true,
    })),
    duplicateProducts: duplicateProducts.map((p) => ({
      id: p.id,
      name: p.name,
      active: p.active,
    })),
  });
}

/**
 * POST /api/admin/sync-products
 * Runs full sync: creates missing products, reactivates archived, archives orphans/duplicates
 *
 * Body (optional):
 * - dryRun: boolean - If true, only reports what would happen (default: false)
 * - limit: number - Max products to create (default: 50)
 */
export async function POST(request: NextRequest) {
  // Auth check
  const auth = validateAdminAuth(request);
  if (!auth.valid) {
    return NextResponse.json({ error: auth.error }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const dryRun = body.dryRun === true; // Default to false (actually sync)
  const limit = body.limit ?? 50;

  if (dryRun) {
    // Run sync but report what would happen (no changes)
    const result = await syncArtworksToStripe(1600000, 2400000, 0); // limit 0 = dry run
    return NextResponse.json({
      message: "Dry run - no changes made",
      dryRun: true,
      ...result,
    });
  }

  // Run full sync
  const result = await syncArtworksToStripe(1600000, 2400000, limit);

  return NextResponse.json({
    message: `Sync complete`,
    created: result.created,
    archived: result.archived,
    reactivated: result.reactivated,
    errors: result.errors,
  });
}

/**
 * DELETE /api/admin/sync-products
 * Archives Stripe products that no longer have corresponding artworks in S3
 * OR archives duplicate products (keeps first, archives rest)
 *
 * Body (optional):
 * - dryRun: boolean - If true, only reports what would be archived (default: true)
 * - action: 'orphaned' | 'duplicates' | 'all' - What to archive (default: 'orphaned')
 * - productIds: string[] - Specific product IDs to archive (optional)
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

  // Separate yellowsky products by metadata vs name match
  const yellowskyByMetadata = allProducts.filter(
    (p) => p.metadata.source === "yellowsky"
  );
  const yellowskyByName = allProducts.filter(
    (p) => artworkNames.has(p.name) && p.metadata.source !== "yellowsky"
  );

  // Find orphaned products (have yellowsky metadata but no matching artwork)
  const orphanedProducts = yellowskyByMetadata.filter(
    (p) => !artworkNames.has(p.name)
  );

  // Find duplicate products (same name, keep first one)
  const allYellowskyProducts = [...yellowskyByMetadata, ...yellowskyByName];
  const nameMatchCounts = new Map<string, Stripe.Product[]>();
  for (const p of allYellowskyProducts) {
    const existing = nameMatchCounts.get(p.name) || [];
    nameMatchCounts.set(p.name, [...existing, p]);
  }
  const duplicateProducts: Stripe.Product[] = [];
  for (const [, products] of nameMatchCounts) {
    if (products.length > 1) {
      // Sort by creation date descending (newest first), keep newest, archive rest
      products.sort((a, b) => b.created - a.created);
      duplicateProducts.push(...products.slice(1));
    }
  }

  // Determine what to archive based on action parameter
  const action = (body.action as 'orphaned' | 'duplicates' | 'all') || 'orphaned';
  let toArchive: Stripe.Product[] = [];

  if (specificProductIds) {
    // If specific IDs provided, use those
    const allTargetProducts = [...orphanedProducts, ...duplicateProducts];
    toArchive = allTargetProducts.filter((p) => specificProductIds.includes(p.id));
  } else if (action === 'orphaned') {
    toArchive = orphanedProducts;
  } else if (action === 'duplicates') {
    toArchive = duplicateProducts;
  } else if (action === 'all') {
    toArchive = [...orphanedProducts, ...duplicateProducts];
  }

  if (dryRun) {
    return NextResponse.json({
      message: "Dry run - no products archived",
      dryRun: true,
      action,
      wouldArchive: toArchive.length,
      orphanedProducts: orphanedProducts.map((p) => ({
        id: p.id,
        name: p.name,
        active: p.active,
        created: p.created,
        hasMetadata: true,
      })),
      duplicateProducts: duplicateProducts.map((p) => ({
        id: p.id,
        name: p.name,
        active: p.active,
        created: p.created,
      })),
      toArchive: toArchive.map((p) => ({
        id: p.id,
        name: p.name,
        reason: orphanedProducts.includes(p) ? 'orphaned' : 'duplicate',
      })),
      hint: "Set dryRun: false to actually archive products",
    });
  }

  // Archive (set active: false) each product
  const archived: Array<{ id: string; name: string; reason: string; wasActive: boolean }> = [];

  for (const product of toArchive) {
    const wasActive = product.active;
    const reason = orphanedProducts.includes(product) ? 'orphaned' : 'duplicate';
    await stripe.products.update(product.id, { active: false });
    archived.push({
      id: product.id,
      name: product.name,
      reason,
      wasActive,
    });
  }

  return NextResponse.json({
    message: `Archived ${archived.length} products`,
    action,
    archived,
    remaining: {
      orphaned: orphanedProducts.length - archived.filter(a => a.reason === 'orphaned').length,
      duplicates: duplicateProducts.length - archived.filter(a => a.reason === 'duplicate').length,
    },
  });
}

/**
 * PATCH /api/admin/sync-products
 * Reactivates archived products that have matching artworks in S3
 *
 * Body (optional):
 * - dryRun: boolean - If true, only reports what would be reactivated (default: true)
 * - productIds: string[] - Specific product IDs to reactivate (optional)
 */
export async function PATCH(request: NextRequest) {
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

  // Find inactive products that have matching artworks
  const yellowskyProducts = allProducts.filter(
    (p) => p.metadata.source === "yellowsky" || artworkNames.has(p.name)
  );
  const toReactivate = yellowskyProducts.filter(
    (p) => !p.active && artworkNames.has(p.name)
  );

  // Filter by specific IDs if provided
  const targetProducts = specificProductIds
    ? toReactivate.filter((p) => specificProductIds.includes(p.id))
    : toReactivate;

  if (dryRun) {
    return NextResponse.json({
      message: "Dry run - no products reactivated",
      dryRun: true,
      wouldReactivate: targetProducts.length,
      products: targetProducts.map((p) => ({
        id: p.id,
        name: p.name,
        active: p.active,
        created: p.created,
      })),
      hint: "Set dryRun: false to actually reactivate products",
    });
  }

  // Reactivate products
  const reactivated: Array<{ id: string; name: string }> = [];

  for (const product of targetProducts) {
    await stripe.products.update(product.id, { active: true });
    reactivated.push({ id: product.id, name: product.name });
  }

  return NextResponse.json({
    message: `Reactivated ${reactivated.length} products`,
    reactivated,
  });
}