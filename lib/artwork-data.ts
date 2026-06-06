import { ListObjectsV2Command, S3Client } from "@aws-sdk/client-s3";
import { getS4Config, getS4ArtPrefix, getMediaTokenSecret } from "./s4-config";
import { createMediaAccessToken } from "./media-access-token";
import { fetchStripeProducts, mapArtworksToProducts } from "./stripe-products";
import { normalizeAccents } from "./slug";

export type Artwork = {
  slug: string;
  title: string;
  filename: string;
  viewUrl: string;
  heroUrl?: string; // JPG preview if exists
  alt: string;
  productId?: string;
  productName?: string;
  prices?: Array<{ id: string; nickname?: string; unitAmount?: number; currency: string }>;
  hasProduct: boolean;
};

// Webshop images: PNG/WebP/GIF/AVIF only (no JPG)
const ARTWORK_EXTENSIONS = ["png", "webp", "gif", "avif"];

// Image dimensions for aspect ratio detection
export type ImageDimensions = {
  width: number;
  height: number;
  orientation: "portrait" | "landscape" | "square";
};

/**
 * Generate alt text from filename.
 * Pattern: "2020.105 Amsterdam.png" → "Architectural sketch of Amsterdam, 2020 — giclée print on hemp paper"
 */
function generateAltText(filename: string): string {
  const title = filename.replace(/\.[^.]+$/, "");
  const yearMatch = title.match(/^(\d{4})/);
  const year = yearMatch ? yearMatch[1] : "";
  const subjectMatch = title.match(/^\d{4}\.\d+\s+(.+)$/);
  const subject = subjectMatch ? subjectMatch[1] : title;
  const yearPart = year ? `, ${year}` : "";
  return `Architectural sketch of ${subject}${yearPart} — giclée print on hemp paper`;
}

/**
 * Generate title from filename.
 * "2020.01 Venice.png" → "2020.01 Venice"
 */
function generateTitle(filename: string): string {
  return filename.replace(/\.[^.]+$/, "");
}

/**
 * Generate slug from filename.
 * "2020.01 Venice.png" → "2020-01-Venice"
 * "2020.68 Deák Square.png" → "2020-68-Deak-Square"
 */
function generateSlug(filename: string): string {
  const base = filename.replace(/\.[^.]+$/, "");
  const normalized = normalizeAccents(base);
  return normalized.replace(/[.\s]+/g, "-").replace(/-+/g, "-");
}

/**
 * Get all artworks from S3.
 * Returns sorted list (newest first by year.number).
 */
export async function getArtworks(): Promise<Artwork[]> {
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

  // Parallelize: fetch S3 list and Stripe products
  const [s3Result, stripeProducts] = await Promise.all([
    (async () => {
      // List all files
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
          keys.push(obj.Key);
        }

        token = list.IsTruncated ? list.NextContinuationToken : undefined;
      } while (token);

      return keys;
    })(),
    fetchStripeProducts(),
  ]);

  const keys = s3Result;

  // Build map of basenames → files
  const basenameMap = new Map<string, { artwork?: string; jpg?: string }>();

  // First pass: artwork files (PNG/WebP/GIF/AVIF)
  for (const key of keys) {
    const filename = key.split("/").pop() ?? "";
    const ext = filename.split(".").pop()?.toLowerCase() ?? "";
    const basename = filename.replace(/\.[^.]+$/, "");

    if (ARTWORK_EXTENSIONS.includes(ext)) {
      const existing = basenameMap.get(basename) ?? {};
      existing.artwork = key;
      basenameMap.set(basename, existing);
    }
  }

  // Second pass: JPG files (previews)
  for (const key of keys) {
    const filename = key.split("/").pop() ?? "";
    const ext = filename.split(".").pop()?.toLowerCase() ?? "";
    const basename = filename.replace(/\.[^.]+$/, "");

    if (ext === "jpg" || ext === "jpeg") {
      const existing = basenameMap.get(basename) ?? {};
      existing.jpg = key;
      basenameMap.set(basename, existing);
    }
  }

  // Sort by basename descending (a4, a3, a2, a1 - reverse ABC)
  const sortedBasenames = [...basenameMap.keys()].sort((a, b) => b.localeCompare(a));

  // Map artworks to Stripe products
  const filenames = sortedBasenames.map(basename => {
    const files = basenameMap.get(basename);
    return files?.artwork ? files.artwork.split("/").pop() ?? "" : "";
  }).filter(f => f);
  const artworkToProduct = mapArtworksToProducts(filenames, stripeProducts);

  // Build artworks (only those with artwork files)
  const artworks: Artwork[] = [];

  for (const basename of sortedBasenames) {
    const files = basenameMap.get(basename);
    if (!files?.artwork) continue;

    const filename = files.artwork.split("/").pop() ?? "";
    const slug = generateSlug(filename);
    const title = generateTitle(filename);
    const alt = generateAltText(filename);
    const product = artworkToProduct.get(filename);
    const hasProduct = !!product;

    const accessToken = createMediaAccessToken(
      { key: files.artwork, name: filename, exp: Date.now() + 1000 * 60 * 60 * 24 },
      tokenSecret,
    );

    let heroUrl: string | undefined;
    if (files.jpg) {
      const heroToken = createMediaAccessToken(
        { key: files.jpg, name: files.jpg.split("/").pop() ?? "", exp: Date.now() + 1000 * 60 * 60 * 24 },
        tokenSecret,
      );
      heroUrl = `/api/media/file?token=${encodeURIComponent(heroToken)}`;
    }

    artworks.push({
      slug,
      title,
      filename,
      viewUrl: `/api/media/file?token=${encodeURIComponent(accessToken)}`,
      heroUrl,
      alt,
      hasProduct,
      ...(hasProduct && product ? {
        productId: product.id,
        productName: product.name,
        prices: [...product.prices].sort((a, b) => {
          const sizeOrder: Record<string, number> = { 'A4': 1, 'A3': 2, 'A2': 3, 'A1': 4 };
          const sizeA = a.nickname ?? '';
          const sizeB = b.nickname ?? '';
          return (sizeOrder[sizeA] || 99) - (sizeOrder[sizeB] || 99);
        }).map(p => ({
          id: p.id,
          nickname: p.nickname ?? undefined,
          unitAmount: p.unitAmount ?? undefined,
          currency: p.currency,
        })),
      } : {}),
    });
  }

  return artworks;
}

/**
 * Get a single artwork by slug.
 */
export async function getArtworkBySlug(slug: string): Promise<Artwork | null> {
  const artworks = await getArtworks();
  return artworks.find((a) => a.slug === slug) ?? null;
}