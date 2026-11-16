import type { Metadata } from "next";

export const metadata: Metadata = { title: "Webshop" };

/**
 * Instant skeleton shown during client-side navigation while the webshop
 * RSC payload streams in. Matches the real page shell (glass panel + grid)
 * so there is no layout shift when the artworks arrive.
 */
export default function WebshopLoading() {
  return (
    <div className="relative min-h-screen bg-neutral-900 skeleton-delayed">
      <div className="relative min-h-screen">
        <section className="relative px-4 pb-24 pt-20 md:px-8 lg:px-12 md:pt-24">
          <div className="relative mx-auto max-w-5xl rounded-2xl overflow-hidden">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-black/30 via-black/22 to-black/15 backdrop-blur-xl" />
            <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
              <div className="absolute inset-0 rounded-2xl border border-white/20" />
            </div>
            <div className="relative p-4 md:p-6 lg:p-8">
              <div className="mb-6">
                <div className="h-7 w-40 rounded bg-white/10 animate-pulse" />
                <div className="mt-3 h-4 w-72 max-w-full rounded bg-white/10 animate-pulse" />
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="aspect-[0.707] overflow-hidden rounded-xl border border-neutral-border bg-neutral-100 animate-pulse"
                  />
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}