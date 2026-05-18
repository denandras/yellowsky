"use client";

import BottomNav from "@/components/bottom-nav";
import BrandMark from "@/components/brand-mark";
import LanguageSwitcher, { useSiteLanguage } from "@/components/language-switcher";
import type { SiteLanguage } from "@/lib/site-language";
import type { StripeProduct, StripePrice } from "@/lib/stripe-products";
import { useEffect, useState } from "react";

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
  const amount = price.unitAmount / 100; // Stripe stores in cents/fillér
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
    const priceId = selectedPrice[item.id] || item.product?.prices[0]?.id;
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
        selectSize: "Válassz méretet",
        addToCart: "Kosárba",
        loading: "Betöltés...",
        freeShipping: "Ingyenes szállítás világszerte",
      }
    : {
        title: "Webshop",
        subtitle: "Prints & Artworks",
        description: hasConfig && items.length > 0
          ? "Browse and purchase prints — free worldwide shipping."
          : hasConfig
            ? "Artwork coming soon."
            : "Gallery configuration not available.",
        selectSize: "Select size",
        addToCart: "Add to Cart",
        loading: "Loading...",
        freeShipping: "Free worldwide shipping",
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
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {items.map((item, i) => {
                // Calculate aspect ratio from actual image dimensions
                const aspectRatio = item.width && item.height ? item.width / item.height : 1;
                const paddingBottom = item.width && item.height ? `${(item.height / item.width) * 100}%` : "100%";

                return (
                  <div
                    key={item.id}
                    className="flex flex-col overflow-hidden rounded-xl border border-neutral-border bg-white"
                    data-reveal
                    style={{ "--reveal-delay": `${100 + i * 40}ms` } as React.CSSProperties}
                  >
                    {/* Image with blur placeholder */}
                    <div
                      className="relative w-full overflow-hidden bg-white"
                      style={{ paddingBottom }}
                    >
                      {/* Blur placeholder */}
                      <img
                        src="/blur-placeholder.jpg"
                        alt=""
                        className="absolute inset-0 h-full w-full object-cover"
                        aria-hidden="true"
                      />
                      {/* Actual image */}
                      <img
                        src={item.viewUrl}
                        alt={item.title}
                        className="absolute inset-0 h-full w-full object-cover transition-opacity duration-300 hover:scale-105"
                        loading="lazy"
                        onLoad={(e) => {
                          // Fade in when loaded
                          (e.target as HTMLImageElement).style.opacity = "1";
                        }}
                        style={{ opacity: 0 }}
                      />
                    </div>

                  {/* Details */}
                  <div className="flex flex-1 flex-col p-4">
                    <h3 className="font-display text-lg font-semibold">{item.title}</h3>

                    {/* Size selector */}
                    {item.product?.prices && item.product.prices.length > 0 && (
                      <div className="mt-3">
                        <label className="mb-1.5 block text-xs font-medium text-text-muted">
                          {labels.selectSize}
                        </label>
                        <div className="flex flex-wrap gap-2">
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
                      </div>
                    )}

                    {/* Price */}
                    {item.product?.prices && item.product.prices.length > 0 && (
                      <p className="mt-2 text-lg font-semibold text-primary">
                        {formatPrice(item.product.prices.find(p => p.id === (selectedPrice[item.id] || item.product?.prices[0]?.id)) || item.product.prices[0])}
                      </p>
                    )}

                    {/* Add to cart */}
                    {item.product?.prices && item.product.prices.length > 0 && (
                      <button
                        type="button"
                        onClick={() => handleCheckout(item)}
                        disabled={loading[item.id]}
                        className="mt-auto rounded-xl bg-primary py-3 text-center font-display font-semibold text-white transition-colors hover:bg-primary/90 disabled:opacity-50"
                      >
                        {loading[item.id] ? labels.loading : labels.addToCart}
                      </button>
                    )}

                    {/* Free shipping note */}
                    <p className="mt-2 text-center text-xs text-text-muted">
                      {labels.freeShipping}
                    </p>
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