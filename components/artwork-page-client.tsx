"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import BottomNav from "@/components/bottom-nav";
import BrandMark from "@/components/brand-mark";
import CartButton from "@/components/cart-button";
import CartDrawer from "@/components/cart-drawer";
import LanguageSwitcher, { useSiteLanguage } from "@/components/language-switcher";
import { useCart } from "@/lib/cart-context";
import type { Artwork } from "@/lib/artwork-data";
import type { SiteLanguage } from "@/lib/site-language";
import ImageZoomModal from "@/components/image-zoom-modal";

type ArtworkPageClientProps = {
  artwork: Artwork;
  initialLanguage: SiteLanguage;
};

function formatPrice(amount: number, currency: string): string {
  const formatter = new Intl.NumberFormat("hu-HU", {
    style: "currency",
    currency: currency.toUpperCase(),
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
  return formatter.format(amount / 100);
}

export default function ArtworkPageClient({ artwork, initialLanguage }: ArtworkPageClientProps) {
  const router = useRouter();
  const { language } = useSiteLanguage(initialLanguage);
  const { items, addItem, getTotal } = useCart();
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [addingToCart, setAddingToCart] = useState(false);
  const [showAddedMessage, setShowAddedMessage] = useState(false);
  const [showPostAddOptions, setShowPostAddOptions] = useState(false);

  const [heroLoaded, setHeroLoaded] = useState(false);
  const [heroError, setHeroError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [imageAspect, setImageAspect] = useState<number | null>(null); // width / height
  const [heroZoomOpen, setHeroZoomOpen] = useState(false);
  const [artworkZoomOpen, setArtworkZoomOpen] = useState(false);

  const heroUrl = artwork.heroUrl ?? artwork.viewUrl;
  const hasJpg = !!artwork.heroUrl;

  // Check if we came from webshop (for smart back navigation)
  const cameFromWebshop = typeof window !== "undefined" && 
    document.referrer.includes("/webshop");

  const labels = language === "hu"
    ? {
        webshop: "WEBSHOP",
        back: "Vissza",
        addToCart: "Kosárba",
        addedToCart: "Hozzáadva!",
        proceedToCheckout: "Tovább a pénztárhoz",
        continueShopping: "Vásárlás folytatása",
        selectSize: "Válassz méretet",
        selectSizeFirst: "Először válassz méretet",
        notForSale: "Jelenleg nem megvásárolható",
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
        webshop: "WEBSHOP",
        back: "Back",
        addToCart: "Add to Cart",
        addedToCart: "Added!",
        proceedToCheckout: "Proceed to Checkout",
        continueShopping: "Continue Shopping",
        selectSize: "Select size",
        selectSizeFirst: "Please select a size first",
        notForSale: "Not currently available for purchase",
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

  const handleAddToCart = async () => {
    if (!selectedSize || !artwork.prices) return;

    const selectedPrice = artwork.prices.find(p => p.id === selectedSize);
    if (!selectedPrice) return;

    setAddingToCart(true);

    addItem({
      id: `${artwork.productId}-${selectedSize}`,
      priceId: selectedSize,
      productId: artwork.productId || artwork.slug,
      productName: artwork.productName || artwork.title,
      productTitle: artwork.title,
      size: selectedPrice.nickname || "Standard",
      price: selectedPrice.unitAmount || 0,
      currency: selectedPrice.currency,
      viewUrl: artwork.viewUrl,
    });

    // Brief delay to show feedback
    await new Promise(resolve => setTimeout(resolve, 300));
    setAddingToCart(false);
    setShowAddedMessage(true);
    setShowPostAddOptions(true);
    setTimeout(() => setShowAddedMessage(false), 2000);
  };

  const handleCheckout = async () => {
    if (items.length === 0) return;

    setCheckoutLoading(true);
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map(item => ({ priceId: item.priceId, quantity: item.quantity })),
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        console.error("Checkout failed:", data);
        alert(language === "hu" ? "Hiba történt a fizetésnél. Kérlek próbáld újra." : "Checkout failed. Please try again.");
        return;
      }
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      console.error("Checkout error:", err);
      alert(language === "hu" ? "Hiba történt a fizetésnél. Kérlek próbáld újra." : "Checkout error. Please try again.");
    } finally {
      setCheckoutLoading(false);
    }
  };

  // Determine image orientation from dimensions (we'll detect from aspect ratio)
  const isLandscape = true; // Default, will be refined

  return (
    <>
      <ImageZoomModal
        src={heroUrl}
        alt={`${artwork.alt} (preview)`}
        isOpen={heroZoomOpen}
        onClose={() => setHeroZoomOpen(false)}
      />
      <ImageZoomModal
        src={artwork.viewUrl}
        alt={artwork.alt}
        isOpen={artworkZoomOpen}
        onClose={() => setArtworkZoomOpen(false)}
      />

      <CartDrawer
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        onCheckout={handleCheckout}
        labels={labels.cart}
        loading={checkoutLoading}
      />

      <div className="flex min-h-screen flex-col bg-background-light text-text-dark">
        {/* Header */}
        <header className="sticky top-0 z-50 border-b border-neutral-border bg-white/80 backdrop-blur-md">
          <div className="flex h-16 w-full items-center justify-between px-6">
            <button
              onClick={() => {
                if (cameFromWebshop) {
                  router.back();
                } else {
                  router.push("/webshop");
                }
              }}
              className="font-display text-lg font-bold tracking-tight uppercase hover:opacity-80 transition-opacity"
            >
              {labels.webshop}
            </button>
            <div className="flex items-center gap-3">
              <LanguageSwitcher initialLanguage={initialLanguage} />
              <CartButton onClick={() => setCartOpen(true)} labels={{ ariaLabel: labels.cart.ariaLabel }} />
            </div>
          </div>
        </header>

        {/* Hero Section - Fading JPG */}
        <section className="relative w-full">
          <div 
            className="relative w-full h-[60vh] md:h-[70vh] overflow-hidden bg-neutral-100 cursor-zoom-in"
            onClick={() => setHeroZoomOpen(true)}
          >
            {/* Fade gradient overlay - starts very late */}
            <div className="absolute inset-0 z-10 pointer-events-none" 
                 style={{ 
                   backgroundImage: hasJpg 
                     ? "linear-gradient(to bottom, transparent 88%, rgba(250,249,247,0.95) 96%, rgba(250,249,247,1) 100%)"
                     : "linear-gradient(to bottom, transparent 0%, transparent 100%)"
                 }} 
            />
            
            {/* Title overlay at bottom - bigger text */}
            <div className="absolute bottom-0 left-0 right-0 z-20 px-6 pb-8 pt-20 bg-gradient-to-t from-background-light via-background-light/80 to-transparent">
              <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight">
                {artwork.title}
              </h1>
            </div>

            {/* Hero Image - wide: contain centered, narrow: cover to fill height */}
            {!heroLoaded && !heroError && (
              <div className="absolute inset-0 animate-pulse bg-neutral-100" />
            )}
            {heroError ? (
              <div className="absolute inset-0 flex items-center justify-center bg-neutral-100">
                <p className="text-sm text-text-muted">Image unavailable</p>
              </div>
            ) : (
              <Image
                src={heroUrl}
                alt={artwork.alt}
                fill
                className={`object-cover transition-opacity duration-500 ${heroLoaded ? 'opacity-100' : 'opacity-0'}`}
                style={{ objectPosition: 'center 36%' }}
                priority
                sizes="100vw"
                draggable={false}
                onContextMenu={(e) => e.preventDefault()}
                onLoad={() => setHeroLoaded(true)}
                onError={() => setHeroError(true)}
              />
            )}
          </div>
        </section>

        {/* Content Section - Artwork + Purchase Options */}
        <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 md:gap-12">
            {/* Left: Main artwork image in bracket */}
            <div className="relative">
              <div className="relative bg-white rounded-lg shadow-sm border border-neutral-border p-3 md:p-6">
                {/* Bracket frame - dynamic aspect ratio from image, default to portrait while loading */}
                <div
                  className="relative overflow-hidden cursor-zoom-in"
                  style={{ aspectRatio: imageAspect ?? 0.707 }}
                  onClick={() => setArtworkZoomOpen(true)}
                >
                  {!imageLoaded && !imageError && (
                    <div className="absolute inset-0 animate-pulse bg-neutral-100" />
                  )}
                  {imageError ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-neutral-100">
                      <p className="text-sm text-text-muted">Image unavailable</p>
                    </div>
                  ) : (
                    <Image
                      src={artwork.viewUrl}
                      alt={artwork.alt}
                      fill
                      className={`object-contain transition-opacity duration-500 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                      sizes="(max-width: 768px) 100vw, 50vw"
                      unoptimized
                      draggable={false}
                      onContextMenu={(e) => e.preventDefault()}
                      onLoad={(e) => {
                        console.log('Artwork image loaded:', artwork.viewUrl, e.currentTarget.naturalWidth, e.currentTarget.naturalHeight);
                        const img = e.currentTarget;
                        if (img.naturalWidth && img.naturalHeight) {
                          setImageAspect(img.naturalWidth / img.naturalHeight);
                        }
                        setImageLoaded(true);
                      }}
                      onError={(e) => {
                        console.error('Artwork image error:', artwork.viewUrl, e);
                        setImageError(true);
                      }}
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Right: Purchase options */}
            <div className="flex flex-col">
              {/* Purchase section */}
              {artwork.hasProduct && artwork.prices && artwork.prices.length > 0 ? (
                <div className="bg-white rounded-lg border border-neutral-border p-6">
                  <h3 className="font-display text-lg font-semibold mb-4">
                    {labels.selectSize}
                  </h3>

                  {/* Size options */}
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    {[...artwork.prices].sort((a, b) => {
                      // Smallest first: reverse alphabetical (A5 > A4 > A3)
                      return (b.nickname || '').localeCompare(a.nickname || '');
                    }).map(price => (
                      <button
                        key={price.id}
                        type="button"
                        onClick={() => setSelectedSize(price.id)}
                        className={`rounded-lg border-2 px-4 py-3 text-center transition-all ${
                          selectedSize === price.id
                            ? 'border-primary bg-primary/5 text-primary font-semibold'
                            : 'border-neutral-border hover:border-neutral-300'
                        }`}
                      >
                        <div className="font-display text-sm">{price.nickname || 'Standard'}</div>
                        <div className="text-lg font-bold mt-1">
                          {formatPrice(price.unitAmount || 0, price.currency)}
                        </div>
                      </button>
                    ))}
                  </div>

                  {/* Add to cart button */}
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    disabled={!selectedSize || addingToCart}
                    className={`w-full rounded-lg py-3 font-display font-semibold text-white transition-all ${
                      showAddedMessage
                        ? 'bg-green-600'
                        : selectedSize
                          ? 'bg-primary hover:bg-primary/90'
                          : 'bg-neutral-300 cursor-not-allowed'
                    }`}
                  >
                    {showAddedMessage 
                      ? labels.addedToCart 
                      : addingToCart 
                        ? '...' 
                        : labels.addToCart
                    }
                  </button>

                  {/* Post-add options */}
                  {showPostAddOptions && (
                    <div className="mt-4 flex gap-3 animate-fadeIn">
                      <button
                        type="button"
                        onClick={() => router.push("/webshop")}
                        className="flex-1 rounded-lg border border-neutral-border bg-white px-4 py-3 text-center text-sm font-medium hover:bg-neutral-50 transition-colors"
                      >
                        {labels.continueShopping}
                      </button>
                      <button
                        type="button"
                        onClick={() => setCartOpen(true)}
                        className="flex-1 rounded-lg bg-text-dark px-4 py-3 text-center text-sm font-medium text-white hover:bg-text-dark/90 transition-colors"
                      >
                        {labels.proceedToCheckout}
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-neutral-50 rounded-lg border border-neutral-border p-6 text-center">
                  <p className="text-text-muted">
                    {labels.notForSale}
                  </p>
                </div>
              )}

              {/* Trust signals */}
              <div className="mt-6 flex flex-wrap gap-x-4 gap-y-2 text-xs text-text-muted">
                <span className="flex items-center gap-1.5">
                  <svg className="size-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  {language === "hu" ? "Ingyenes szállítás" : "Free shipping"}
                </span>
                <span className="flex items-center gap-1.5">
                  <svg className="size-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {language === "hu" ? "7-14 nap" : "7-14 calendar days"}
                </span>
                <span className="flex items-center gap-1.5">
                  <svg className="size-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  {language === "hu" ? "Biztonságos fizetés" : "Secure checkout"}
                </span>
                <span className="flex items-center gap-1.5">
                  <svg className="size-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                  </svg>
                  {language === "hu" ? "Keret nélkül" : "Unframed"}
                </span>
                <span className="flex items-center gap-1.5">
                  <svg className="size-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                  {language === "hu" ? "Giclée nyomat kender papírra" : "Giclée art print on hemp paper"}
                </span>
              </div>
            </div>
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

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </>
  );
}