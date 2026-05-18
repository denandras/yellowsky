"use client";

import BottomNav from "@/components/bottom-nav";
import LanguageSwitcher, { useSiteLanguage } from "@/components/language-switcher";
import CartButton from "@/components/cart-button";
import CartDrawer from "@/components/cart-drawer";
import { useCart } from "@/lib/cart-context";
import { IconShoppingBag, IconX } from "@/components/icons";
import Link from "next/link";
import type { SiteLanguage } from "@/lib/site-language";
import { useEffect, useState, useRef } from "react";

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
  selectedPrice,
  setSelectedPrice,
  loading,
  handleAddToCart,
  menuRef,
}: {
  item: MediaItem;
  index: number;
  labels: {
    buyPrint: string;
    loading: string;
    freeShipping: string;
    addToCart: string;
  };
  isActive: boolean;
  setActiveItem: (id: string | null) => void;
  selectedPrice: Record<string, string>;
  setSelectedPrice: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  loading: Record<string, boolean>;
  handleAddToCart: (item: MediaItem) => void;
  menuRef: React.RefObject<HTMLDivElement | null>;
}) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const hasSelectedSize = !!selectedPrice[item.id];
  const selectedPriceObj = item.prices?.find(p => p.id === selectedPrice[item.id]);

  // First 6 images load eagerly, rest lazy
  const shouldLoadEagerly = index < 6;

  const handleImageError = () => {
    console.error(`Failed to load image: ${item.viewUrl}`);
    setImageError(true);
    setImageLoaded(true); // Show the card anyway
  };

  return (
    <div
      className="break-inside-avoid overflow-hidden rounded-xl border border-neutral-border bg-white"
      style={{ opacity: imageLoaded ? 1 : 0, transition: "opacity 300ms ease-out" }}
    >
      {/* Image container */}
      <div className="relative">
        {/* Skeleton while loading */}
        {!imageLoaded && !imageError && (
          <div className="w-full aspect-[4/3] animate-pulse bg-neutral-200" />
        )}

        {/* Error state */}
        {imageError && (
          <div className="w-full aspect-[4/3] bg-neutral-100 flex items-center justify-center">
            <p className="text-sm text-text-muted">Image unavailable</p>
          </div>
        )}

        {/* Image - natural aspect ratio */}
        <img
          src={item.viewUrl}
          alt={item.title}
          className={`w-full object-cover transition-transform duration-500 ease-out hover:scale-[1.02] ${imageLoaded && !imageError ? "block" : "hidden"}`}
          loading={shouldLoadEagerly ? "eager" : "lazy"}
          fetchPriority={shouldLoadEagerly ? "high" : "low"}
          decoding={shouldLoadEagerly ? "sync" : "async"}
          onLoad={() => setImageLoaded(true)}
          onError={handleImageError}
        />

        {/* Cart button - bottom right corner (only for items with products) */}
        {imageLoaded && item.hasProduct && item.prices && item.prices.length > 0 && (
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
        {isActive && item.hasProduct && item.prices && (
          <div
            ref={menuRef}
            className="absolute inset-x-0 bottom-0 bg-white/95 backdrop-blur-md p-4 shadow-lg"
          >
            <h3 className="font-display text-sm font-semibold mb-3">{item.title}</h3>

            {/* Size buttons */}
            <div className="flex flex-wrap gap-2 mb-3">
              {item.prices
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

      {/* Title - only show when image loaded */}
      {imageLoaded && (
        <div className="p-3">
          <h3 className="font-display text-sm font-medium text-text-dark">
            {item.title}
          </h3>
          {!item.hasProduct && (
            <p className="text-xs text-text-muted mt-1">
              Coming soon
            </p>
          )}
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

    setActiveItem(null);
  };

  const handleCheckout = async () => {
    if (cartItems.length === 0) return;

    setCheckoutLoading(true);
    try {
      // For now, checkout the first item
      // TODO: Multi-item checkout via Stripe
      const firstItem = cartItems[0];
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId: firstItem.priceId }),
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
            <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <IconShoppingBag className="size-5 text-primary" />
              <h1 className="font-display text-lg font-bold tracking-tight uppercase">{labels.title}</h1>
            </Link>
            <div className="flex items-center gap-3">
              <CartButton onClick={() => setCartOpen(true)} labels={{ ariaLabel: labels.cart.ariaLabel }} />
              <LanguageSwitcher initialLanguage={initialLanguage} />
            </div>
          </div>
        </header>

        <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-6 py-8 pb-24">
          <section className="pt-6 pb-10">
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
              <div className="columns-1 gap-4 space-y-4 md:columns-2 lg:columns-3">
                {items.map((item, i) => (
                  <ImageCard
                    key={item.id}
                    item={item}
                    index={i}
                    labels={labels}
                    isActive={activeItem === item.id}
                    setActiveItem={setActiveItem}
                    selectedPrice={selectedPrice}
                    setSelectedPrice={setSelectedPrice}
                    loading={loading}
                    handleAddToCart={handleAddToCart}
                    menuRef={menuRef}
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