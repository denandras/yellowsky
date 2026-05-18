"use client";

import BottomNav from "@/components/bottom-nav";
import BrandMark from "@/components/brand-mark";
import { useEffect } from "react";

type MediaItem = {
  id: string;
  title: string;
  viewUrl: string;
  downloadUrl: string;
};

type WebshopPageClientProps = {
  items: MediaItem[];
  hasConfig: boolean;
};

export default function WebshopPageClient({ items, hasConfig }: WebshopPageClientProps) {
  useEffect(() => {
    const nodes = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
    if (!nodes.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.08, rootMargin: "0px 0px -6% 0px" },
    );

    const raf = window.requestAnimationFrame(() => {
      nodes.forEach((node) => observer.observe(node));
    });

    return () => {
      window.cancelAnimationFrame(raf);
      observer.disconnect();
    };
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-background-light text-text-dark">
      <header className="sticky top-0 z-50 border-b border-neutral-border bg-white/80 backdrop-blur-md">
        <div className="flex h-16 w-full items-center justify-center px-6">
          <div className="flex items-center gap-2">
            <BrandMark />
            <h1 className="font-display text-lg font-bold tracking-tight uppercase">Webshop</h1>
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-6 py-8 pb-24">
        <section className="pt-6 pb-10">
          <div data-reveal>
            <h2 className="font-display mb-2 text-2xl font-bold tracking-tight">
              Prints & Artworks
            </h2>
            <p className="text-sm text-text-muted">
              {hasConfig && items.length > 0
                ? "Browse and purchase prints — free worldwide shipping."
                : hasConfig
                  ? "Artwork coming soon."
                  : "Gallery configuration not available."}
            </p>
          </div>
        </section>

        {hasConfig && items.length > 0 && (
          <section className="pb-10">
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
              {items.map((item, i) => (
                <div
                  key={item.id}
                  className="group aspect-square overflow-hidden rounded-xl border border-neutral-border bg-neutral-100"
                  data-reveal
                  style={{ "--reveal-delay": `${100 + i * 40}ms` } as React.CSSProperties}
                >
                  <img
                    src={item.viewUrl}
                    alt={item.title}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        {!hasConfig && (
          <section className="pb-10">
            <div className="rounded-xl border border-neutral-border bg-white p-6">
              <p className="text-text-muted">
                Gallery is not configured. Add S3 environment variables to display artwork.
              </p>
            </div>
          </section>
        )}
      </main>

      <BottomNav active="webshop" />
    </div>
  );
}