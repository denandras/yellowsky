"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import BottomNav from "@/components/bottom-nav";
import BrandMark from "@/components/brand-mark";
import type { Artwork } from "@/lib/artwork-data";

type ArtworkPageClientProps = {
  artwork: Artwork;
};

export default function ArtworkPageClient({ artwork }: ArtworkPageClientProps) {
  const [heroLoaded, setHeroLoaded] = useState(false);
  const [heroError, setHeroError] = useState(false);

  const imageUrl = artwork.heroUrl ?? artwork.viewUrl;

  return (
    <div className="flex min-h-screen flex-col bg-background-light text-text-dark">
      <header className="sticky top-0 z-50 border-b border-neutral-border bg-white/80 backdrop-blur-md">
        <div className="flex h-16 w-full items-center justify-between px-6">
          <Link
            href="/webshop"
            className="font-display text-sm font-medium tracking-tight uppercase hover:opacity-80 transition-opacity"
          >
            ← WEBSHOP
          </Link>
          <div className="flex items-center gap-3">
            <BrandMark size={28} />
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-6 py-8 pb-24">
        {/* Hero Image */}
        <div className="relative w-full aspect-[4/3] md:aspect-[3/2] lg:aspect-[2/1] overflow-hidden rounded-xl border border-neutral-border bg-white mb-8">
          {!heroLoaded && !heroError && (
            <div className="absolute inset-0 animate-pulse bg-neutral-100" />
          )}
          {heroError ? (
            <div className="absolute inset-0 flex items-center justify-center bg-neutral-100">
              <p className="text-sm text-text-muted">Image unavailable</p>
            </div>
          ) : (
            <Image
              src={imageUrl}
              alt={artwork.alt}
              fill
              className="object-contain"
              priority
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
              onLoad={() => setHeroLoaded(true)}
              onError={() => setHeroError(true)}
            />
          )}
        </div>

        {/* Title */}
        <h1 className="font-display text-3xl font-bold tracking-tight mb-4">
          {artwork.title}
        </h1>

        {/* Description */}
        <p className="text-text-muted mb-8">
          {artwork.alt}
        </p>

        {/* Actions */}
        <div className="flex gap-4">
          <Link
            href="/webshop"
            className="flex-1 rounded-lg border border-neutral-border bg-white px-6 py-3 text-center text-sm font-medium text-text-dark hover:border-primary/50 transition-colors"
          >
            Back to Webshop
          </Link>
          <a
            href={artwork.viewUrl}
            className="flex-1 rounded-lg bg-text-dark px-6 py-3 text-center text-sm font-medium text-white hover:bg-text-dark/90 transition-colors"
          >
            View Full Image
          </a>
        </div>
      </main>

      <footer className="bg-background-light py-8 pb-32 text-center">
        <div className="mb-4 flex justify-center">
          <BrandMark size={32} />
        </div>
        <p className="mb-2 text-xs font-medium tracking-widest text-text-muted uppercase">
          © {new Date().getFullYear()} András Dénes
        </p>
        <p className="text-[10px] text-text-muted/60">
          Yellowsky • Sketches from Budapest
        </p>
      </footer>

      <BottomNav active="webshop" />
    </div>
  );
}