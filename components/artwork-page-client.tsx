"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import CartDrawer from "@/components/cart-drawer";
import { useSiteLanguage } from "@/components/language-switcher";
import { useCart } from "@/lib/cart-context";
import type { Artwork } from "@/lib/artwork-data";
import type { SiteLanguage } from "@/lib/site-language";
import ImageZoomModal from "@/components/image-zoom-modal";
import { IconShoppingBag } from "@/components/icons";
import Link from "next/link";

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
  const { language, setLanguage } = useSiteLanguage(initialLanguage);
  const { items, addItem, getTotal, getItemCount } = useCart();
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [showAddedMessage, setShowAddedMessage] = useState(false);
  const [showPostAddOptions, setShowPostAddOptions] = useState(false);

  const [heroLoaded, setHeroLoaded] = useState(false);
  const [heroError, setHeroError] = useState(false);
  const [showTitle, setShowTitle] = useState(false);
  const [heroZoomOpen, setHeroZoomOpen] = useState(false);
  const [isExitingBlur, setIsExitingBlur] = useState(false);
  const [contentVisible, setContentVisible] = useState(false); // Start hidden until hydration check

  // Check for transition state after hydration
  useEffect(() => {
    const transitioning = sessionStorage.getItem('yellowsky-transitioning');
    if (transitioning) {
      // Coming from webshop - keep hidden, start blur exit animation
      setIsExitingBlur(true);
      sessionStorage.removeItem('yellowsky-transitioning');
      // Content fades in after blur starts clearing
      setTimeout(() => setContentVisible(true), 300);
      setTimeout(() => setIsExitingBlur(false), 600);
    } else {
      // Direct access - small delay to ensure fade transition works
      setTimeout(() => setContentVisible(true), 50);
    }
  }, []);

  // Handle blur exit animation
  useEffect(() => {
    // Blur exit is handled in the first useEffect now
  }, [isExitingBlur]);

  // Auto-shrink title to fit
  const titleRef = useRef<HTMLHeadingElement>(null);
  const [titleFontSize, setTitleFontSize] = useState(36);

  useEffect(() => {
    if (!titleRef.current || !showTitle) return;
    
    requestAnimationFrame(() => {
      const el = titleRef.current;
      if (!el) return;
      
      // Calculate available width: viewport minus stripe margins
      // Stripe has left-1 right-1 (8px total) on mobile, left-2 right-2 (16px total) on desktop
      // Plus text padding px-2 (16px total) on mobile, px-4 (32px total) on desktop
      const stripeInset = window.innerWidth < 768 ? 8 : 16;
      const textPadding = window.innerWidth < 768 ? 16 : 32;
      const availableWidth = window.innerWidth - stripeInset - textPadding - 32; // 32px safety margin
      
      // Start from max size
      const maxSize = window.innerWidth < 768 ? 42 : window.innerWidth < 1024 ? 48 : 60;
      const minSize = window.innerWidth < 768 ? 28 : 24;
      
      el.style.fontSize = `${maxSize}px`;
      let fontSize = maxSize;
      
      // Force reflow to get accurate scrollWidth
      void el.offsetWidth;
      
      // Shrink until text fits
      while (el.scrollWidth > availableWidth && fontSize > minSize) {
        fontSize -= 1;
        el.style.fontSize = `${fontSize}px`;
      }
      
      setTitleFontSize(fontSize);
    });
  }, [artwork.title, showTitle]);

  // Recalculate on resize
  useEffect(() => {
    if (!showTitle) return;
    
    const handleResize = () => {
      if (!titleRef.current) return;
      
      const el = titleRef.current;
      
      const leftPadding = window.innerWidth < 768 ? 24 : 8;
      const rightMargin = window.innerWidth < 768 ? 24 : 16;
      const availableWidth = window.innerWidth - leftPadding - rightMargin;
      
      const maxSize = window.innerWidth < 768 ? 42 : window.innerWidth < 1024 ? 48 : 60;
      const minSize = window.innerWidth < 768 ? 28 : 24;
      
      el.style.fontSize = `${maxSize}px`;
      let fontSize = maxSize;
      
      // Force reflow to get accurate scrollWidth
      void el.offsetWidth;
      
      while (el.scrollWidth > availableWidth && fontSize > minSize) {
        fontSize -= 1;
        el.style.fontSize = `${fontSize}px`;
      }
      
      setTitleFontSize(fontSize);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [showTitle]);

  const currentYear = new Date().getFullYear();

  // Track if we came from webshop for back button
  const [cameFromWebshop, setCameFromWebshop] = useState(false);
  useEffect(() => {
    // Check if referrer is webshop
    if (typeof document !== 'undefined') {
      const referrer = document.referrer;
      setCameFromWebshop(referrer.includes('/webshop'));
    }
  }, []);

  const heroUrl = artwork.heroUrl ?? artwork.viewUrl;

  const labels = language === "hu"
    ? {
        webshop: "WEBSHOP",
        back: "Vissza",
        addToCart: "Kosárba",
        addedToCart: "Hozzáadva!",
        proceedToCheckout: "Tovább a pénztárhoz",
        continueShopping: "Vásárlás folytatása",
        selectSize: "Válassz méretet",
        selectSizeFirst: "Előszőr válassz méretet",
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

  const handleAddToCart = () => {
    if (!selectedSize || !artwork.prices) return;

    const selectedPrice = artwork.prices.find(p => p.id === selectedSize);
    if (!selectedPrice) return;

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

  // Show title after hero loads or after 300ms
  useEffect(() => {
    if (heroLoaded) {
      setShowTitle(true);
      return;
    }
    const timer = setTimeout(() => setShowTitle(true), 300);
    return () => clearTimeout(timer);
  }, [heroLoaded]);

  return (
    <>
      {/* Blur overlay that fades out on entrance */}
      {isExitingBlur && (
        <div 
          className="fixed inset-0 z-[200] pointer-events-none"
          style={{
            animation: 'blur-transition-reverse 600ms ease-out forwards',
          }}
        />
      )}

      <ImageZoomModal
        src={heroUrl}
        alt={`${artwork.alt} (preview)`}
        isOpen={heroZoomOpen}
        onClose={() => setHeroZoomOpen(false)}
      />

      <CartDrawer
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        onCheckout={handleCheckout}
        labels={labels.cart}
        loading={checkoutLoading}
      />

      {/* Full-screen hero image - clickable for zoom */}
      <div
        className="fixed inset-0 bg-neutral-900 cursor-zoom-in"
        onClick={() => setHeroZoomOpen(true)}
      >
        {!heroLoaded && !heroError && (
          <div className="absolute inset-0">
            {/* Blurred placeholder background - light base */}
            <div className="absolute inset-0 bg-white/10 backdrop-blur-xl" />
            {/* Subtle shimmer effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-white/10 animate-pulse" />
          </div>
        )}
        {heroError ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-sm text-white/50">Image unavailable</p>
          </div>
        ) : (
          <Image
            src={heroUrl}
            alt={artwork.alt}
            fill
            className={`object-cover object-[center_75%] md:object-[center_60%] transition-all duration-1000 ease-out ${heroLoaded ? 'blur-0 opacity-100' : 'blur-xl opacity-60'}`}
            priority
            sizes="100vw"
            unoptimized
            draggable={false}
            onContextMenu={(e) => e.preventDefault()}
            onLoad={() => setHeroLoaded(true)}
            onError={() => setHeroError(true)}
          />
        )}
        {/* Subtle gradient overlay for depth */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/40 pointer-events-none" />
      </div>

      {/* Main content - pointer-events-none so clicks pass through to hero */}
      <div className="relative z-10 min-h-screen pointer-events-none"
      >
        {/* Header - glass buttons */}
        <header className="fixed top-0 left-0 right-0 z-50 pointer-events-auto">
          <div className="flex items-center justify-between px-6 pt-5">
            {/* Back button - glass circle */}
            <button
              onClick={() => {
                if (cameFromWebshop) {
                  router.back();
                } else {
                  router.push("/webshop");
                }
              }}
              className="glass-circle relative size-10"
              aria-label={labels.back}
            >
              <div className="absolute inset-0 rounded-full bg-black/25 backdrop-blur-xl" />
              <div className="absolute inset-0 rounded-full border border-white/25 shadow-[inset_0_1px_2px_rgba(255,255,255,0.3)]" />
              <div className="relative flex items-center justify-center h-full">
                <svg className="size-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </div>
            </button>

            <div className="flex items-center gap-3">
              {/* Language switcher - glass circle */}
              <button
                onClick={() => {
                  const newLang = language === 'en' ? 'hu' : 'en';
                  setLanguage(newLang);
                }}
                className="glass-circle relative size-10"
                aria-label={language === 'en' ? 'Switch to Hungarian' : 'Switch to English'}
              >
                <div className="absolute inset-0 rounded-full bg-black/25 backdrop-blur-xl" />
                <div className="absolute inset-0 rounded-full border border-white/25 shadow-[inset_0_1px_2px_rgba(255,255,255,0.3)]" />
                <div className="relative flex items-center justify-center h-full">
                  <span className="text-xs font-bold tracking-widest text-white">{language === 'en' ? 'HU' : 'EN'}</span>
                </div>
              </button>
              {/* Cart button - glass circle */}
              <button
                onClick={() => setCartOpen(true)}
                className="glass-circle relative size-10"
                aria-label={labels.cart.ariaLabel}
              >
                <div className="absolute inset-0 rounded-full bg-black/25 backdrop-blur-xl" />
                <div className="absolute inset-0 rounded-full border border-white/25 shadow-[inset_0_1px_2px_rgba(255,255,255,0.3)]" />
                <div className="relative flex items-center justify-center h-full pt-1">
                  <IconShoppingBag className="size-5 text-[var(--color-primary)]" />
                </div>
              </button>
            </div>
          </div>
        </header>

        {/* Title overlay + Purchase panel */}
        {artwork.prices && artwork.prices.length > 0 && (
          <div className="fixed bottom-0 left-0 right-0 z-20 p-4 md:p-6 pointer-events-auto">
            <div className="relative mx-auto max-w-5xl">
              {/* Black stripe - ends where glass panel begins (background hidden) */}
              <div className="absolute bottom-full left-1 right-1 md:left-2 md:right-2 bg-transparent pointer-events-none rounded-t-lg py-1 md:py-0 -mb-1 overflow-hidden">
                <h1
                  ref={titleRef}
                  style={{ fontSize: `${titleFontSize}px`, lineHeight: '1.2' }}
                  className={`px-2 md:px-4 font-display font-bold tracking-tight text-white drop-shadow-lg transition-opacity duration-500 whitespace-nowrap overflow-hidden text-ellipsis ${showTitle ? 'opacity-100' : 'opacity-0'}`}
                >
                  {artwork.title}
                </h1>
              </div>
              {/* Glass panel */}
              <div className="relative rounded-2xl overflow-hidden">
                {/* Glass overlay */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-black/30 via-black/22 to-black/15 backdrop-blur-xl" />
                {/* Specular highlight */}
                <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
                  <div className="absolute inset-0 rounded-2xl border border-white/20" />
                  <div className="absolute inset-0 rounded-2xl shadow-[inset_1px_1px_2px_rgba(255,255,255,0.2),inset_-1px_-1px_1px_rgba(255,255,255,0.08)]" />
                </div>

              {/* Content */}
              <div className={`relative p-4 md:p-6 transition-opacity duration-500 ${contentVisible ? 'opacity-100' : 'opacity-0'}`}>
                {/* Mobile: sizes + basket icon in one row */}
                <div className="sm:hidden flex flex-row items-center gap-3">
                  {/* Size buttons */}
                  <div className="flex-1 flex gap-2">
                    {artwork.prices?.map((price) => (
                      <button
                        key={price.id}
                        onClick={() => setSelectedSize(price.id)}
                        className={`min-w-[100px] px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                          selectedSize === price.id
                            ? 'bg-[var(--color-primary)]/30 backdrop-blur-xl border border-[var(--color-primary)]/50 shadow-[inset_0_1px_2px_rgba(255,203,42,0.3)] text-[var(--color-primary)]'
                            : 'bg-white/10 text-white/80 border border-white/20 hover:bg-white/20'
                        }`}
                      >
                        <span className="sm:hidden">{price.nickname || "Standard"}<br/>{formatPrice(price.unitAmount || 0, price.currency)}</span>
                        <span className="hidden sm:inline">{price.nickname || "Standard"} — {formatPrice(price.unitAmount || 0, price.currency)}</span>
                      </button>
                    ))}
                  </div>

                  {/* Basket icon - mobile only - adds to cart */}
                  <button
                    onClick={handleAddToCart}
                    disabled={!selectedSize}
                    className={`flex-shrink-0 sm:hidden relative py-4 px-3 rounded-lg overflow-hidden transition-colors duration-300 ${
                      selectedSize
                        ? 'cursor-pointer'
                        : 'bg-white/5 backdrop-blur-xl border border-white/10 cursor-not-allowed'
                    }`}
                  >
                    {selectedSize && (
                      <>
                        <div className={`absolute inset-0 rounded-lg backdrop-blur-xl transition-colors duration-300 ${
                          showAddedMessage ? 'bg-green-500/30' : 'bg-[var(--color-primary)]/30'
                        }`} />
                        <div className={`absolute inset-0 rounded-lg transition-colors duration-300 ${
                          showAddedMessage
                            ? 'border border-green-400/50 shadow-[inset_0_1px_2px_rgba(74,222,128,0.3)]'
                            : 'border border-[var(--color-primary)]/50 shadow-[inset_0_1px_2px_rgba(255,203,42,0.3)]'
                        }`} />
                      </>
                    )}
                    {showAddedMessage ? (
                      <svg className="relative z-10 w-6 h-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className={`relative z-10 w-6 h-6 transition-colors duration-300 ${selectedSize ? 'text-[var(--color-primary)]' : 'text-white/50'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    )}
                  </button>
                </div>

                {/* Desktop: sizes + Kosárba in same row */}
                <div className="hidden sm:flex flex-row items-center gap-4">
                  {/* Size buttons */}
                  <div className="flex-1 flex gap-2">
                    {artwork.prices?.map((price) => (
                      <button
                        key={price.id}
                        onClick={() => setSelectedSize(price.id)}
                        className={`min-w-[100px] px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                          selectedSize === price.id
                            ? 'bg-[var(--color-primary)]/30 backdrop-blur-xl border border-[var(--color-primary)]/50 shadow-[inset_0_1px_2px_rgba(255,203,42,0.3)] text-[var(--color-primary)]'
                            : 'bg-white/10 text-white/80 border border-white/20 hover:bg-white/20'
                        }`}
                      >
                        {price.nickname || "Standard"} — {formatPrice(price.unitAmount || 0, price.currency)}
                      </button>
                    ))}
                  </div>

                  {/* Add to cart + Checkout buttons */}
                  <div className="flex gap-3">
                    {/* Checkout button - appears when added to cart */}
                    {showPostAddOptions && (
                      <button
                        onClick={() => setCartOpen(true)}
                        className="relative py-2 px-6 rounded-lg font-medium text-sm overflow-hidden transition-all duration-300"
                      >
                        <div className="absolute inset-0 rounded-lg bg-white/10 backdrop-blur-xl" />
                        <div className="absolute inset-0 rounded-lg border border-white/20 shadow-[inset_0_1px_2px_rgba(255,255,255,0.2)]" />
                        <span className="relative text-white font-semibold">{language === "hu" ? "Pénztár" : "Checkout"}{getItemCount() > 0 ? ` (${getItemCount()})` : ''}</span>
                      </button>
                    )}
                    <button
                      onClick={handleAddToCart}
                      disabled={!selectedSize}
                      className={`relative min-w-[140px] py-2 px-6 rounded-lg font-medium text-sm overflow-hidden ${
                        selectedSize
                          ? 'cursor-pointer'
                          : 'bg-white/5 backdrop-blur-xl border border-white/10 cursor-not-allowed'
                      }`}
                    >
                      {selectedSize && (
                        <>
                          <div className={`absolute inset-0 rounded-lg backdrop-blur-xl transition-colors duration-300 ${
                            showAddedMessage ? 'bg-green-500/30' : 'bg-[var(--color-primary)]/30'
                          }`} />
                          <div className={`absolute inset-0 rounded-lg transition-colors duration-300 ${
                            showAddedMessage
                              ? 'border border-green-400/50 shadow-[inset_0_1px_2px_rgba(74,222,128,0.3)]'
                              : 'border border-[var(--color-primary)]/50 shadow-[inset_0_1px_2px_rgba(255,203,42,0.3)]'
                          }`} />
                        </>
                      )}
                      <span className={`relative z-10 font-semibold transition-colors duration-300 ${
                        showAddedMessage ? 'text-green-300' : selectedSize ? 'text-[var(--color-primary)]' : 'text-white/50'
                      }`}>
                        {selectedSize ? (showAddedMessage ? labels.addedToCart : labels.addToCart) : labels.selectSize}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Trust signals */}
                <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-[10px] sm:text-xs text-white">
                  <div className="flex gap-x-3">
                    <span className="flex items-center gap-1">
                      <svg className="size-3 sm:size-4 text-[var(--color-primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      <span>{language === "hu" ? "Ingyenes szállítás" : "Free shipping"}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <svg className="size-3 sm:size-4 text-[var(--color-primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>{language === "hu" ? "7-14 nap" : "7-14 calendar days"}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <svg className="size-3 sm:size-4 text-[var(--color-primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      <span>{language === "hu" ? "Biztonságos fizetés" : "Secure checkout"}</span>
                    </span>
                  </div>
                  <span className="flex items-center gap-1">
                    <svg className="size-3 sm:size-4 text-[var(--color-primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                    </svg>
                    <span>{language === "hu" ? "Giclée minőség: 80 évig garantáltan nem fakul" : "Giclée quality: guaranteed not to fade for 80 years"}</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        )}

        {/* Footer - hidden on artwork page (full-screen hero experience) */}
      </div>

      <style jsx global>{`
        /* Lock body scroll on artwork page - iOS Safari fix */
        html, body {
          overflow: hidden;
          position: fixed;
          width: 100%;
          height: 100%;
          overscroll-behavior: none;
          -webkit-overflow-scrolling: auto;
        }

        .glass-circle {
          overflow: hidden;
          cursor: pointer;
          transition: transform 0.2s ease;
        }

        .glass-circle:hover {
          transform: scale(1.05);
        }
      `}</style>
    </>
  );
}