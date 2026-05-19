"use client";

import BottomNav from "@/components/bottom-nav";
import LanguageSwitcher, { useSiteLanguage } from "@/components/language-switcher";
import CartButton from "@/components/cart-button";
import CartDrawer from "@/components/cart-drawer";
import { useCart } from "@/lib/cart-context";
import { IconShoppingBag, IconX } from "@/components/icons";
import Link from "next/link";
import type { SiteLanguage } from "@/lib/site-language";
import { useState, useRef, useEffect } from "react";

type MediaItem = {
  id: string;
  title: string;
  viewUrl: string;
  downloadUrl: string;
  productId?: string;
  productName?: string;
  prices?: Array<{ id: string; nickname?: string; unitAmount?: number; currency: string }>;
  hasProduct: boolean;
};

type WebshopPageClientProps = {
  items: MediaItem[];
  hasConfig: boolean;
  initialLanguage: SiteLanguage;
};

function formatPrice(price: { unitAmount?: number; currency: string }): string {
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

function ImageCard({
  item,
  index,
  labels,
  isActive,
  setActiveItem,
  closeItem,
  selectedPrice,
  setSelectedPrice,
  loading,
  handleAddToCart,
}: {
  item: MediaItem;
  index: number;
  labels: {
    buyPrint: string;
    loading: string;
    freeShipping: string;
    addToCart: string;
    comingSoon: string;
  };
  isActive: boolean;
  setActiveItem: (id: string | null) => void;
  closeItem: () => void;
  selectedPrice: Record<string, string>;
  setSelectedPrice: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  loading: Record<string, boolean>;
  handleAddToCart: (item: MediaItem) => void;
}) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const hasSelectedSize = !!selectedPrice[item.id];
  const selectedPriceObj = item.prices?.find(p => p.id === selectedPrice[item.id]);
  const overlayRef = useRef<HTMLDivElement>(null);

  const handleImageError = () => {
    console.error(`Failed to load image: ${item.viewUrl}`);
    setImageError(true);
    setImageLoaded(true);
  };

  return (
    <div className="break-inside-avoid overflow-hidden rounded-xl border border-neutral-border bg-white relative group">
      {/* Image container */}
      <div className="relative">
        {/* Error state */}
        {imageError && (
          <div className="w-full aspect-[4/3] bg-neutral-100 flex items-center justify-center">
            <p className="text-sm text-text-muted">Image unavailable</p>
          </div>
        )}

        {/* Image - natural aspect ratio with placeholder */}
        <div className="relative w-full">
          {/* Placeholder while loading */}
          {!imageLoaded && !imageError && (
            <div className="w-full aspect-[210/297] bg-neutral-50" />
          )}
          <img
            src={item.viewUrl}
            alt={item.title}
            className={`w-full object-cover transition-all duration-500 ease-out hover:scale-[1.02] ${imageLoaded && !imageError ? "opacity-100" : "opacity-0 absolute inset-0"}`}
            loading={index < 4 ? "eager" : "lazy"}
            fetchPriority={index < 4 ? "high" : "low"}
            decoding={index < 4 ? "sync" : "async"}
            onLoad={() => setImageLoaded(true)}
            onError={handleImageError}
          />
        </div>

        {/* Basket button in corner - only for purchasable items */}
        {item.hasProduct && item.prices && item.prices.length > 0 && !imageError && (
          <button
            type="button"
            data-cart-toggle
            onClick={() => setActiveItem(isActive ? null : item.id)}
            className="absolute bottom-3 right-3 flex size-9 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm shadow-md transition-all hover:bg-white hover:scale-105"
            aria-label={labels.buyPrint}
          >
            <IconShoppingBag className="size-4 text-text-dark" />
          </button>
        )}

        {/* Coming soon badge */}
        {!item.hasProduct && imageLoaded && !imageError && (
          <div className="absolute bottom-3 right-3 rounded-full bg-white/90 backdrop-blur-sm shadow-md px-3 py-1.5">
            <p className="text-xs text-text-muted">
              {labels.comingSoon}
            </p>
          </div>
        )}
      </div>

      {/* Overlay from bottom of card - slide up animation */}
      {item.hasProduct && item.prices && item.prices.length > 0 && (
        <div
          ref={overlayRef}
          data-overlay
          className={`absolute inset-x-0 bottom-0 bg-white/95 backdrop-blur-md p-4 shadow-lg transition-all duration-300 ease-out ${
            isActive ? "translate-y-0 opacity-100" : "translate-y-full opacity-0 pointer-events-none"
          }`}
        >
          {/* Title with close button */}
          <div className="flex items-center justify-between gap-2 mb-3">
            <h3 className="font-display text-sm font-medium text-text-dark">
              {item.title}
            </h3>
            <button
              type="button"
              onClick={closeItem}
              className="flex size-6 shrink-0 items-center justify-center rounded-full bg-neutral-100 transition-all hover:bg-neutral-200"
              aria-label="Close"
            >
              <IconX className="size-3.5 text-text-dark" />
            </button>
          </div>
          {/* Size buttons */}
          <div className="flex flex-wrap gap-2 mb-3">
            {item.prices
              .sort((a, b) => (a.unitAmount ?? 0) - (b.unitAmount ?? 0))
              .map((price) => (
                <button
                  key={price.id}
                  type="button"
                  onClick={() => {
                    // Use functional update to get latest state
                    setSelectedPrice(prev => {
                      const currentlySelected = prev[item.id];
                      // Deselect if clicking the currently selected size
                      if (currentlySelected === price.id) {
                        const { [item.id]: _, ...rest } = prev;
                        return rest;
                      }
                      // Otherwise select this size
                      return { ...prev, [item.id]: price.id };
                    });
                  }}
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
            onClick={() => handleAddToCart(item)}
            disabled={loading[item.id] || !hasSelectedSize}
            className="w-full rounded-xl bg-primary py-2.5 text-center font-display font-semibold text-white transition-colors hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed">
            {loading[item.id] ? labels.loading : labels.addToCart}
          </button>

          <p className="mt-2 text-center text-xs text-text-muted">
            {labels.freeShipping}
          </p>
        </div>
      )}
    </div>
  );
}

export default function WebshopPageClient({ items, hasConfig, initialLanguage }: WebshopPageClientProps) {
  const { language } = useSiteLanguage(initialLanguage);
  const { addItem, items: cartItems } = useCart();
  const [selectedPrice, setSelectedPrice] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [activeItem, setActiveItem] = useState<string | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  // Reveal animation on scroll - runs once on mount
  useEffect(() => {
    const nodes = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
    if (!nodes.length) return;

    // Mark elements as ready for reveal animation (triggers CSS to hide them)
    // Elements start visible (CSS default) and only get hidden after JS confirms
    // it can properly observe them - prevents stuck invisible elements
    nodes.forEach((node) => {
      if (!node.classList.contains("is-visible")) {
        node.classList.add("reveal-ready");
      }
    });

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            entry.target.classList.remove("reveal-ready");
            observer.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.08, rootMargin: "0px 0px -6% 0px" },
    );

    nodes.forEach((node) => observer.observe(node));

    return () => observer.disconnect();
  }, []); // Empty deps - only run once on mount



  // Close menu when clicking outside any card
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!activeItem) return;
      const target = e.target as HTMLElement;
      // Close if clicking outside any overlay or toggle button
      if (!target.closest('[data-cart-toggle]') && !target.closest('[data-overlay]')) {
        // Clear selected size for the item being closed
        setSelectedPrice(prev => {
          const { [activeItem]: _, ...rest } = prev;
          return rest;
        });
        setActiveItem(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [activeItem]);

  const closeItem = () => {
    if (!activeItem) return;
    // Clear selected size for the item being closed
    setSelectedPrice(prev => {
      const { [activeItem]: _, ...rest } = prev;
      return rest;
    });
    setActiveItem(null);
  };

  const handleAddToCart = (item: MediaItem) => {
    const priceId = selectedPrice[item.id];
    if (!priceId || !item.prices) return;

    const selectedPriceObj = item.prices.find(p => p.id === priceId);
    if (!selectedPriceObj) return;

    addItem({
      id: `${item.id}-${priceId}`,
      priceId,
      productId: item.productId || item.id,
      productName: item.productName || item.title,
      productTitle: item.title,
      size: selectedPriceObj.nickname || "Standard",
      price: selectedPriceObj.unitAmount || 0,
      currency: selectedPriceObj.currency,
      viewUrl: item.viewUrl,
    });

    // Reset the selected size for this item and close menu
    setSelectedPrice(prev => {
      const { [item.id]: _, ...rest } = prev;
      return rest;
    });
    setActiveItem(null);
  };

  const handleCheckout = async () => {
    if (cartItems.length === 0) return;

    setCheckoutLoading(true);
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cartItems.map(item => ({ priceId: item.priceId, quantity: item.quantity })),
        }),
      });

      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      console.error("Checkout error:", err);
    } finally {
      setCheckoutLoading(false);
    }
  };

  const labels = language === "hu"
    ? {
        title: "Webshop",
        subtitle: "Műalkotások nyomatai",
        description: hasConfig && items.length > 0
          ? "Vásárolj giclèe minőségű nyomatokat — ingyenes szállítás világszerte."
          : hasConfig
            ? "Hamarosan műalkotások."
            : "A galéria konfigurációja nem elérhető.",
        selectSize: "Méret",
        buyPrint: "Nyomat",
        loading: "Betöltés...",
        freeShipping: "Ingyenes szállítás",
        addToCart: "Kosárba",
        continue: "Vásárlás folytatása",
        comingSoon: "Hamarosan",
        cart: {
          title: "Kosár",
          empty: "A kosarad üres",
          remove: "Eltávolítás",
          clearCart: "Kosár ürítése",
          checkout: "Pénztár",
          total: "Összesen",
          loading: "Feldolgozás...",
          ariaLabel: "Kosár megnyitása",
        },
      }
    : {
        title: "Webshop",
        subtitle: "Prints of Artworks",
        description: hasConfig && items.length > 0
          ? "Browse and purchase giclèe quality prints — free worldwide shipping."
          : hasConfig
            ? "Artwork coming soon."
            : "Gallery configuration not available.",
        selectSize: "Size",
        buyPrint: "Buy",
        loading: "Loading...",
        freeShipping: "Free shipping",
        addToCart: "Add to Cart",
        continue: "Continue shopping",
        comingSoon: "Coming soon",
        cart: {
          title: "Cart",
          empty: "Your cart is empty",
          remove: "Remove",
          clearCart: "Clear cart",
          checkout: "Checkout",
          total: "Total",
          loading: "Processing...",
          ariaLabel: "Open cart",
        },
      };

  return (
    <>
      <CartDrawer
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        onCheckout={handleCheckout}
        labels={labels.cart}
        loading={checkoutLoading}
      />
      <div className="flex min-h-screen flex-col bg-background-light text-text-dark">
        <header className="sticky top-0 z-50 border-b border-neutral-border bg-white/80 backdrop-blur-md">
          <div className="flex h-16 w-full items-center justify-between px-6">
            <Link href="/" className="font-display text-lg font-bold tracking-tight uppercase hover:opacity-80 transition-opacity">
              {labels.title}
            </Link>
            <div className="flex items-center gap-3">
              <LanguageSwitcher initialLanguage={initialLanguage} />
              <CartButton onClick={() => setCartOpen(true)} labels={{ ariaLabel: labels.cart.ariaLabel }} />
            </div>
          </div>
        </header>

        <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-6 py-8 pb-24">
          <section className="pt-6 pb-10" data-reveal>
            <div>
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
              <div className="columns-1 gap-4 md:columns-2 lg:columns-3">
                {items.map((item, i) => (
                  <div key={item.id} data-reveal style={{ "--reveal-delay": `${80 + i * 40}ms` } as React.CSSProperties} className="mb-4 break-inside-avoid">
                    <ImageCard
                      item={item}
                      index={i}
                      labels={labels}
                      isActive={activeItem === item.id}
                      setActiveItem={setActiveItem}
                      closeItem={closeItem}
                      selectedPrice={selectedPrice}
                      setSelectedPrice={setSelectedPrice}
                      loading={loading}
                      handleAddToCart={handleAddToCart}
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
                  {labels.description}
                </p>
              </div>
            </section>
          )}
        </main>

        <BottomNav active="webshop" />
      </div>
    </>
  );
}