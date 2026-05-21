import Stripe from "stripe";
import { getStripeSecretKey } from "./stripe-config";

export type StripeProduct = {
  id: string;
  name: string;
  description: string | null;
  images: string[];
  active: boolean;
  metadata: Record<string, string>;
  prices: StripePrice[];
};

export type StripePrice = {
  id: string;
  productId: string;
  nickname: string | null;
  unitAmount: number | null;
  currency: string;
  active: boolean;
};

let stripeInstance: Stripe | null = null;

function getStripe(): Stripe | null {
  const key = getStripeSecretKey();
  if (!key) return null;
  if (stripeInstance) return stripeInstance;
  stripeInstance = new Stripe(key, {
    apiVersion: "2026-04-22.dahlia",
  });
  return stripeInstance;
}

export async function fetchStripeProducts(): Promise<StripeProduct[]> {
  const stripe = getStripe();
  if (!stripe) return [];

  // First, fetch all products
  const rawProducts: Stripe.Product[] = [];
  let hasMore = true;
  let startingAfter: string | undefined;

  while (hasMore) {
    const response = await stripe.products.list({
      active: true,
      limit: 100,
      expand: ["data.default_price"],
      ...(startingAfter ? { starting_after: startingAfter } : {}),
    });

    rawProducts.push(...response.data);

    hasMore = response.has_more;
    if (response.data.length > 0) {
      startingAfter = response.data[response.data.length - 1].id;
    }
  }

  // Then, fetch all prices in parallel (avoid N+1) with concurrency limit
  const concurrencyLimit = 5;
  const results: StripeProduct[] = [];
  
  for (let i = 0; i < rawProducts.length; i += concurrencyLimit) {
    const batch = rawProducts.slice(i, i + concurrencyLimit);
    const batchResults = await Promise.all(
      batch.map(async (product) => {
        const prices = await stripe!.prices.list({
          product: product.id,
          active: true,
          limit: 100,
        });
        return {
          id: product.id,
          name: product.name,
          description: product.description,
          images: product.images,
          active: product.active,
          metadata: product.metadata,
          prices: prices.data.map((price) => ({
            id: price.id,
            productId: product.id,
            nickname: price.nickname,
            unitAmount: price.unit_amount,
            currency: price.currency,
            active: price.active,
          })),
        };
      })
    );
    results.push(...batchResults);
  }

  return results;
}

/**
 * Matches a product name to an artwork filename.
 * Product names like "2020.01 Venice" should match files like "2020.01 Venice.png"
 */
export function matchProductToArtwork(
  productName: string,
  artworkFilenames: string[]
): string | null {
  // Try exact match first (without extension)
  const baseName = productName.trim();
  const match = artworkFilenames.find((filename) => {
    const fileBase = filename.replace(/\.[^.]+$/, "");
    return fileBase === baseName;
  });
  if (match) return match;

  // Try case-insensitive match
  const lowerBase = baseName.toLowerCase();
  const matchLower = artworkFilenames.find((filename) => {
    const fileBase = filename.replace(/\.[^.]+$/, "").toLowerCase();
    return fileBase === lowerBase;
  });
  if (matchLower) return matchLower;

  // Try partial match (product name contains or is contained by filename)
  const partialMatch = artworkFilenames.find((filename) => {
    const fileBase = filename.replace(/\.[^.]+$/, "");
    return fileBase.includes(baseName) || baseName.includes(fileBase);
  });

  return partialMatch || null;
}

/**
 * Creates a mapping of artwork filenames to Stripe products.
 * Only includes artworks that have matching active Stripe products.
 * Prefers active products when duplicates exist.
 */
export function mapArtworksToProducts(
  artworkFilenames: string[],
  products: StripeProduct[]
): Map<string, StripeProduct> {
  const map = new Map<string, StripeProduct>();
  const usedFiles = new Set<string>();

  // First pass: add all active products
  for (const product of products) {
    if (!product.active) continue;

    const matchedFile = matchProductToArtwork(product.name, artworkFilenames);
    if (matchedFile && !usedFiles.has(matchedFile)) {
      map.set(matchedFile, product);
      usedFiles.add(matchedFile);
    }
  }

  return map;
}