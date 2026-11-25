import { createMediaAccessToken, nextMediaTokenExpiry } from "./media-access-token";
import { getS4ArtPrefix } from "./s4-config";
import { SITE_URL } from "./config";

/**
 * Builds a signed media URL for an artwork, for use outside the shop pages
 * (order confirmation e-mail). Uses the .jpg preview when the artwork came in
 * as .png: same basename, roughly a tenth of the bytes, which is what an e-mail
 * client should download.
 *
 * Returns null when anything is missing - a missing thumbnail must never break
 * the e-mail.
 */
export function artworkImageUrl(filename: string | null | undefined): string | null {
  const prefix = getS4ArtPrefix();
  const secret = process.env.MEDIA_TOKEN_SECRET ?? process.env.S4_SECRET_ACCESS_KEY;
  if (!prefix || !secret || !filename) return null;

  const base = filename.replace(/\.[^.]+$/, "");
  const name = `${base}.jpg`;
  const token = createMediaAccessToken(
    { key: `${prefix}${name}`, name, exp: nextMediaTokenExpiry() },
    secret,
  );
  return `${SITE_URL}/api/media/file?token=${encodeURIComponent(token)}`;
}
