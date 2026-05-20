"use client";

import BottomNav from "@/components/bottom-nav";
import LanguageSwitcher, { useSiteLanguage } from "@/components/language-switcher";
import CartButton from "@/components/cart-button";
import CartDrawer from "@/components/cart-drawer";
import { useCart } from "@/lib/cart-context";
import { IconShoppingBag, IconX } from "@/components/icons";
import Link from "next/link";
import type { SiteLanguage } from "@/lib/site-language";
import { useState, useRef, useEffect, useMemo, useCallback } from "react";

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

/**
 * Custom hook to calculate optimal column count based on viewport width
 * Matches Tailwind breakpoints: sm(640), md(768), lg(1024), xl(1280)
 */
function useColumnCount(containerRef: React.RefObject<HTMLDivElement | null>) {
  const [columnCount, setColumnCount] = useState(1);

  useEffect(() => {
    const updateColumns = () => {
      if (!containerRef.current) return;
      const width = containerRef.current.offsetWidth;
      
      if (width >= 1280) setColumnCount(4);
      else if (width >= 1024) setColumnCount(3);
      else if (width >= 768) setColumnCount(2);
      else setColumnCount(1);
    };

    updateColumns();

    const resizeObserver = new ResizeObserver(updateColumns);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => resizeObserver.disconnect();
  }, [containerRef]);

  return columnCount;
}

/**
 * Distribute items across columns for proper masonry layout
 * Each column gets items distributed to balance heights
 */
function useMasonryColumns(items: MediaItem[], columnCount: number) {
  return useMemo(() => {
    const columns: MediaItem[][] = Array.from({ length: columnCount }, () => []);
    
    // Distribute items evenly across columns
    items.forEach((item, index) => {
      columns[index % columnCount].push(item);
    });
    
    return columns;
  }, [items, columnCount]);
}

/**
 * Progressive image card with lazy loading and fade-in
 */
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
  const [isInView, setIsInView] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    const node = cardRef.current;
    if (!node) return;

    // First items (above the fold) should load immediately
    if (index < 6) {
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "200px", threshold: 0.1 }
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, [index]);

  const handleImageError = useCallback(() => {
    console.error(`Failed to load image: ${item.viewUrl}`);
    setImageError(true);
    setImageLoaded(true);
  }, [item.viewUrl]);

  const hasSelectedSize = !!selectedPrice[item.id];
  const selectedPriceObj = item.prices?.find(p => p.id === selectedPrice[item.id]);

  return (
    <div
      ref={cardRef}
      data-reveal
      style={{ "--reveal-delay": `${Math.min(index * 80, 800)}ms` } as React.CSSProperties}
      className="break-inside-avoid overflow-hidden rounded-xl border border-neutral-border bg-white relative group"
    >
      {/* Image container */}
      <div className="relative min-h-[200px]">
        {/* Skeleton placeholder - shown while loading or before in view */}
        {(!isInView || !imageLoaded) && !imageError && (
          <div className="absolute inset-0 aspect-[4/3] bg-neutral-100 animate-pulse">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent animate-shimmer" />
          </div>
        )}

        {/* Error state */}
        {imageError && (
          <div className="w-full aspect-[4/3] bg-neutral-100 flex items-center justify-center">
            <p className="text-sm text-text-muted">Image unavailable</p>
          </div>
        )}

        {/* Actual image - only load when in view */}
        {isInView && !imageError && (
          <img
            src={item.viewUrl}
            alt={item.title}
            className={`w-full object-cover transition-all duration-500 ease-out ${
              imageLoaded ? "opacity-100 scale-100" : "opacity-0 scale-[1.02]"
            }`}
            loading="lazy"
            decoding="async"
            onLoad={() => setImageLoaded(true)}
            onError={handleImageError}
          />
        )}

        {/* Basket button - only for purchasable items */}
        {item.hasProduct && item.prices && item.prices.length > 0 && !imageError && imageLoaded && (
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

      {/* Overlay - slide up animation */}
      {item.hasProduct && item.prices && item.prices.length > 0 && (
        <div
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
                    setSelectedPrice(prev => {
                      const currentlySelected = prev[item.id];
                      if (currentlySelected === price.id) {
                        const { [item.id]: _, ...rest } = prev;
                        return rest;
                      }
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
  );
}

/**
 * Single column in the masonry grid
 * Items flow vertically without breaking across columns
 */
function MasonryColumn({
  items,
  labels,
  activeItem,
  setActiveItem,
  closeItem,
  selectedPrice,
  setSelectedPrice,
  loading,
  handleAddToCart,
  startIndex,
}: {
  items: MediaItem[];
  labels: {
    buyPrint: string;
    loading: string;
    freeShipping: string;
    addToCart: string;
    comingSoon: string;
  };
  activeItem: string | null;
  setActiveItem: (id: string | null) => void;
  closeItem: () => void;
  selectedPrice: Record<string, string>;
  setSelectedPrice: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  loading: Record<string, boolean>;
  handleAddToCart: (item: MediaItem) => void;
  startIndex: number;
}) {
  return (
    <div className="flex flex-col gap-4">
      {items.map((item, i) => (
        <ImageCard
          key={item.id}
          item={item}
          index={startIndex + i}
          labels={labels}
          isActive={activeItem === item.id}
          setActiveItem={setActiveItem}
          closeItem={closeItem}
          selectedPrice={selectedPrice}
          setSelectedPrice={setSelectedPrice}
          loading={loading}
          handleAddToCart={handleAddToCart}
        />
      ))}
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
  const containerRef = useRef<HTMLDivElement>(null);

  // Calculate column count based on viewport
  const columnCount = useColumnCount(containerRef);

  // Distribute items across columns
  const columns = useMasonryColumns(items, columnCount);

  // Reveal animation on scroll
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
      { threshold: 0.1, rootMargin: "0px" }
    );

    nodes.forEach((node) => observer.observe(node));

    return () => observer.disconnect();
  }, [items, columnCount]); // Re-run when items or columns change

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!activeItem) return;
      const target = e.target as HTMLElement;
      if (!target.closest('[data-cart-toggle]') && !target.closest('[data-overlay]')) {
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

  const closeItem = useCallback(() => {
    if (!activeItem) return;
    setSelectedPrice(prev => {
      const { [activeItem]: _, ...rest } = prev;
      return rest;
    });
    setActiveItem(null);
  }, [activeItem]);

  const handleAddToCart = useCallback((item: MediaItem) => {
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

    setSelectedPrice(prev => {
      const { [item.id]: _, ...rest } = prev;
      return rest;
    });
    setActiveItem(null);
  }, [selectedPrice, addItem]);

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

  // Calculate start index for each column for staggered animation
  let globalIndex = 0;
  const columnsWithStartIndex = columns.map((colItems) => {
    const start = globalIndex;
    globalIndex += colItems.length;
    return { items: colItems, startIndex: start };
  });

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

        <main ref={containerRef} className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-6 py-8 pb-24">
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
              {/* True masonry grid with responsive columns */}
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {columnsWithStartIndex.map(({ items: colItems, startIndex }, colIndex) => (
                  <MasonryColumn
                    key={colIndex}
                    items={colItems}
                    labels={labels}
                    activeItem={activeItem}
                    setActiveItem={setActiveItem}
                    closeItem={closeItem}
                    selectedPrice={selectedPrice}
                    setSelectedPrice={setSelectedPrice}
                    loading={loading}
                    handleAddToCart={handleAddToCart}
                    startIndex={startIndex}
                  />
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