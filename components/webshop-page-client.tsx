"use client";

import BottomNav from "@/components/bottom-nav";
import BrandMark from "@/components/brand-mark";
import LanguageSwitcher, { useSiteLanguage } from "@/components/language-switcher";
import { IconShoppingBag, IconX } from "@/components/icons";
import type { SiteLanguage } from "@/lib/site-language";
import type { StripeProduct, StripePrice } from "@/lib/stripe-products";
import { useEffect, useState, useRef } from "react";

type MediaItem = {
  id: string;
  title: string;
  viewUrl: string;
  downloadUrl: string;
  product?: StripeProduct;
  width?: number;
  height?: number;
};

type WebshopPageClientProps = {
  items: MediaItem[];
  hasConfig: boolean;
  initialLanguage: SiteLanguage;
};

function formatPrice(price: StripePrice): string {
  if (!price.unitAmount) return "";
  const amount = price.unitAmount / 100;
  const currency = price.currency.toUpperCase();
  const formatter = new Intl.NumberFormat("hu-HU", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
  return formatter.format(amount);
}

export default function WebshopPageClient({ items, hasConfig, initialLanguage }: WebshopPageClientProps) {
  const { language } = useSiteLanguage(initialLanguage);
  const [selectedPrice, setSelectedPrice] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [activeItem, setActiveItem] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setActiveItem(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Reveal animation
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

  const handleCheckout = async (item: MediaItem) => {
    const priceId = selectedPrice[item.id];
    if (!priceId) return;

    setLoading(prev => ({ ...prev, [item.id]: true }));

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId }),
      });

      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      console.error("Checkout error:", err);
    } finally {
      setLoading(prev => ({ ...prev, [item.id]: false }));
    }
  };

  const labels = language === "hu"
    ? {
        title: "Webshop",
        subtitle: "Nyomatok és műalkotások",
        description: hasConfig && items.length > 0
          ? "Vásárolj nyomatokat — ingyenes szállítás világszerte."
          : hasConfig
            ? "Hamarosan műalkotások."
            : "A galéria konfigurációja nem elérhető.",
        selectSize: "Méret",
        buyPrint: "Nyomat",
        loading: "Betöltés...",
        freeShipping: "Ingyenes szállítás",
        addToCart: "Kosárba",
      }
    : {
        title: "Webshop",
        subtitle: "Prints & Artworks",
        description: hasConfig && items.length > 0
          ? "Browse and purchase prints — free worldwide shipping."
          : hasConfig
            ? "Artwork coming soon."
            : "Gallery configuration not available.",
        selectSize: "Size",
        buyPrint: "Buy",
        loading: "Loading...",
        freeShipping: "Free shipping",
        addToCart: "Add to Cart",
      };

  return (
    <div className="flex min-h-screen flex-col bg-background-light text-text-dark">
      <header className="sticky top-0 z-50 border-b border-neutral-border bg-white/80 backdrop-blur-md">
        <div className="flex h-16 w-full items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <BrandMark />
            <h1 className="font-display text-lg font-bold tracking-tight uppercase">{labels.title}</h1>
          </div>
          <LanguageSwitcher initialLanguage={initialLanguage} />
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-6 py-8 pb-24">
        <section className="pt-6 pb-10">
          <div data-reveal>
            <h2 className="font-display mb-2 text-2xl font-bold tracking-tight">
              {labels.subtitle}
            </h2>
            <p className="text-sm text-text-muted">
              {labels.description}
            </p>
          </div>
        </section>

        {hasConfig && items.length > 0 && (
          <section className="pb-10">
            {/* Masonry-style grid using columns */}
            <div className="columns-1 gap-4 space-y-4 md:columns-2 lg:columns-3">
              {items.map((item, i) => {
                const isActive = activeItem === item.id;
                const hasSelectedSize = !!selectedPrice[item.id];
                const selectedPriceObj = item.product?.prices?.find(p => p.id === selectedPrice[item.id]);

                return (
                  <div
                    key={item.id}
                    className="break-inside-avoid overflow-hidden rounded-xl border border-neutral-border bg-white"
                    data-reveal
                    style={{ "--reveal-delay": `${100 + i * 40}ms` } as React.CSSProperties}
                  >
                    {/* Image container */}
                    <div className="relative">
                      {/* Image */}
                      <img
                        src={item.viewUrl}
                        alt={item.title}
                        className="w-full object-cover transition-transform duration-500 ease-out hover:scale-[1.02]"
                        loading="lazy"
                      />

                      {/* Cart button - bottom right corner */}
                      {item.product?.prices && item.product.prices.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setActiveItem(isActive ? null : item.id)}
                          className="absolute bottom-3 right-3 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 shadow-md backdrop-blur-sm transition-all hover:bg-white hover:shadow-lg"
                          aria-label={labels.buyPrint}
                        >
                          {isActive ? (
                            <IconX className="size-5 text-text-dark" />
                          ) : (
                            <IconShoppingBag className="size-5 text-text-dark" />
                          )}
                        </button>
                      )}

                      {/* Menu overlay */}
                      {isActive && item.product?.prices && (
                        <div
                          ref={menuRef}
                          className="absolute inset-x-0 bottom-0 bg-white/95 backdrop-blur-md p-4 shadow-lg"
                        >
                          <h3 className="font-display text-sm font-semibold mb-3">{item.title}</h3>
                          
                          {/* Size buttons */}
                          <div className="flex flex-wrap gap-2 mb-3">
                            {item.product.prices
                              .sort((a, b) => (a.unitAmount ?? 0) - (b.unitAmount ?? 0))
                              .map((price) => (
                                <button
                                  key={price.id}
                                  type="button"
                                  onClick={() => setSelectedPrice(prev => ({ ...prev, [item.id]: price.id }))}
                                  className={`rounded-lg border px-3 py-1.5 text-sm transition-all ${
                                    selectedPrice[item.id] === price.id
                                      ? "border-primary bg-primary/10 font-medium text-primary"
                                      : "border-neutral-border hover:border-primary/50"
                                  }`}
                                >
                                  {price.nickname || `${(price.unitAmount ?? 0) / 100} ${price.currency.toUpperCase()}`}
                                </button>
                              ))}
                          </div>

                          {/* Price (only after size selection) */}
                          {hasSelectedSize && selectedPriceObj && (
                            <p className="text-lg font-semibold text-primary mb-3">
                              {formatPrice(selectedPriceObj)}
                            </p>
                          )}

                          {/* Add to cart */}
                          <button
                            type="button"
                            onClick={() => handleCheckout(item)}
                            disabled={loading[item.id] || !hasSelectedSize}
                            className="w-full rounded-xl bg-primary py-2.5 text-center font-display font-semibold text-white transition-colors hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {loading[item.id] ? labels.loading : labels.addToCart}
                          </button>

                          <p className="mt-2 text-center text-xs text-text-muted">
                            {labels.freeShipping}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Title (always visible) */}
                    <div className="p-3">
                      <h3 className="font-display text-sm font-medium text-text-dark">
                        {item.title}
                      </h3>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {!hasConfig && (
          <section className="pb-10">
            <div className="rounded-xl border border-neutral-border bg-white p-6">
              <p className="text-text-muted">
                {labels.description}
              </p>
            </div>
          </section>
        )}
      </main>

      <BottomNav active="webshop" />
    </div>
  );
}