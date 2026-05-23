/**
 * Normalize accented characters for URL-safe slugs.
 * Exported for use in other modules.
 */
export function normalizeAccents(str: string): string {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove diacritics
    .replace(/ø/g, "o")
    .replace(/Ø/g, "O")
    .replace(/æ/g, "ae")
    .replace(/Æ/g, "AE")
    .replace(/ð/g, "d")
    .replace(/Ð/g, "D")
    .replace(/þ/g, "th")
    .replace(/Þ/g, "Th")
    .replace(/ß/g, "ss");
}

/**
 * Convert filename to URL slug.
 * "2020.01 Venice.png" → "2020-01-Venice"
 * "2020.105 Amsterdam.webp" → "2020-105-Amsterdam"
 * "2020.68 Deák Square.png" → "2020-68-Deak-Square"
 */
export function filenameToSlug(filename: string): string {
  // Remove extension
  const base = filename.replace(/\.[^.]+$/, "");
  // Normalize accents first
  const normalized = normalizeAccents(base);
  // Replace dots and spaces with dashes, collapse multiple dashes
  return normalized.replace(/[.\s]+/g, "-").replace(/-+/g, "-");
}

/**
 * Convert slug back to possible filenames.
 * "2020-01-Venice" → ["2020.01 Venice.png", "2020.01 Venice.webp", ...]
 * Returns array of possible filenames to check against S3.
 */
export function slugToPossibleFilenames(slug: string): string[] {
  // Convert dashes back to dots/spaces pattern
  // "2020-01-Venice" → "2020.01 Venice"
  const parts = slug.split("-");
  if (parts.length >= 3 && /^\d{4}$/.test(parts[0]) && /^\d+$/.test(parts[1])) {
    // Year.Number Title format
    const year = parts[0];
    const number = parts[1];
    const title = parts.slice(2).join(" ");
    const base = `${year}.${number} ${title}`;
    return ["png", "webp", "gif", "avif"].map(ext => `${base}.${ext}`);
  }
  // Fallback: just replace dashes with spaces
  const base = slug.replace(/-/g, " ");
  return ["png", "webp", "gif", "avif"].map(ext => `${base}.${ext}`);
}