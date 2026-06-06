"use client";

import Image from "next/image";
import { useSiteLanguage } from "@/components/language-switcher";
import CartDrawer from "@/components/cart-drawer";
import ImageGallery from "@/components/image-gallery";
import { IconShoppingBag } from "@/components/icons";
import { useCart } from "@/lib/cart-context";
import type { SiteLanguage } from "@/lib/site-language";
import { useState, useLayoutEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type MediaItem = {
  id: string;
  title: string;
  alt: string;
  viewUrl: string;
  productId?: string;
  productName?: string;
  prices?: Array<{ id: string; nickname?: string; unitAmount?: number; currency: string }>;
  hasProduct: boolean;
};

type WebshopPageClientProps = {
  items: MediaItem[];
  hasConfig: boolean;
  initialLanguage?: SiteLanguage;
};

export default function WebshopPageClient({ items, hasConfig, initialLanguage }: WebshopPageClientProps) {
  const { items: cartItems, addItem } = useCart();
  const router = useRouter();
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const { language, setLanguage } = useSiteLanguage(initialLanguage);

  // Disable automatic scroll restoration
  useLayoutEffect(() => {
    if (typeof window !== 'undefined' && 'scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }
  }, []);

  const handleAddToCart = async (productId: string, priceId: string, quantity: number = 1) => {
    setLoading((prev) => ({ ...prev, [priceId]: true }));
    try {
      // Find the product and add to cart
      const product = artworks.find(a => a.prices?.some(p => p.id === priceId));
      const price = product?.prices?.find(p => p.id === priceId);
      if (product && price) {
        addItem({
          id: priceId,
          priceId,
          productId,
          productName: product.slug,
          productTitle: product.title,
          nickname: price.nickname || "Standard",
          unitAmount: price.unitAmount || 0,
          currency: price.currency || "EUR",
          quantity,
        });
      }
    } finally {
      setLoading((prev) => ({ ...prev, [priceId]: false }));
    }
  };

  const handleCheckout = async () => {
    setCheckoutLoading(true);
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cartItems }),
      });
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } finally {
      setCheckoutLoading(false);
    }
  };

  const currentYear = new Date().getFullYear();

  const labels = language === "hu"
    ? {
        title: "Webshop",
        subtitle: "Műalkotások nyomatai",
        description: hasConfig && items.length > 0
          ? "Vásárolj giclée minőségű nyomatokat — ingyenes szállítással világszerte."
          : hasConfig
            ? "Hamarosan műalkotások."
            : "A galéria konfigurációja nem elérhető.",
        selectSize: "Méret",
        buyPrint: "Nyomat",
        loading: "Betöltés...",
        freeShipping: "Ingyenes szállítás",
        addToCart: "Kosárba",
        addedToCart: "Hozzáadva!",
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
        footer: {
          copyright: "Dénes András",
          tagline: "Yellowsky",
          privacy: "Adatvédelem",
          terms: "ÁSZF",
        },
      }
    : {
        title: "Webshop",
        subtitle: "Prints of Artworks",
        description: hasConfig && items.length > 0
          ? "Browse and purchase giclée quality prints — free worldwide shipping."
          : hasConfig
            ? "Artwork coming soon."
            : "Gallery configuration not available.",
        selectSize: "Size",
        buyPrint: "Buy",
        loading: "Loading...",
        freeShipping: "Free shipping",
        addToCart: "Add to Cart",
        addedToCart: "Added!",
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
        footer: {
          copyright: "András Dénes",
          tagline: "Yellowsky",
          privacy: "Privacy",
          terms: "Terms",
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

      {/* Fixed background - hero image */}
      <div className="fixed inset-0 z-0 bg-neutral-900">
        <div className="absolute inset-0">
          <Image
            alt="Yellowsky German Street sketch - yellow architectural illustration"
            className="transition-opacity duration-1000 opacity-100"
            style={{ objectFit: 'cover', objectPosition: 'center center' }}
            src="/hero.jpg"
            fill
            priority
            sizes="100vw"
            unoptimized
            draggable={false}
            onContextMenu={(e) => e.preventDefault()}
          />
        </div>
        {/* Subtle gradient overlay for depth */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/40" />
      </div>

      {/* Main content */}
      <div className="relative z-10 min-h-screen">
        {/* Header - glass buttons like main page */}
        <header className="fixed top-0 left-0 right-0 z-50">
          <div className="flex items-center justify-end px-6 pt-5">
            <div className="flex items-center gap-3">
              {/* Language switcher - glass circle */}
              <button
                onClick={() => {
                  const newLang = language === 'en' ? 'hu' : 'en';
                  setLanguage(newLang);
                  router.refresh();
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
                  <IconShoppingBag className="size-5 text-yellow-400" />
                </div>
              </button>
            </div>
          </div>
        </header>

        {/* Gallery section - full width on desktop */}
        {hasConfig && items.length > 0 && (
          <section className="relative px-4 pb-24 pt-20 md:px-8 lg:px-12 md:pt-24">
            {/* Glass panel wrapper */}
            <div className="relative mx-auto max-w-5xl rounded-2xl overflow-hidden">
              {/* Glass overlay */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-black/30 via-black/22 to-black/15 backdrop-blur-xl" />
              {/* Specular highlight */}
              <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
                <div className="absolute inset-0 rounded-2xl border border-white/20" />
                <div className="absolute inset-0 rounded-2xl shadow-[inset_1px_1px_2px_rgba(255,255,255,0.2),inset_-1px_-1px_1px_rgba(255,255,255,0.08)]" />
              </div>

              {/* Content */}
              <div className="relative p-4 md:p-6 lg:p-8">
                {/* Header */}
                <div className="mb-6">
                  <h2 className="font-display text-2xl font-bold text-white mb-2">
                    {labels.subtitle}
                  </h2>
                  <p className="text-white/70 text-sm">
                    {labels.description}
                  </p>
                </div>

                <ImageGallery
                  items={items}
                  labels={{
                    buyPrint: labels.buyPrint,
                    loading: labels.loading,
                    freeShipping: labels.freeShipping,
                    addToCart: labels.addToCart,
                    addedToCart: labels.addedToCart,
                    comingSoon: labels.comingSoon,
                    selectSize: labels.selectSize,
                  }}
                  onAddToCart={handleAddToCart}
                  cartLoading={loading}
                />
              </div>
            </div>
          </section>
        )}

        {!hasConfig && (
          <section className="relative px-4 pb-24 pt-20 md:px-8 lg:px-12">
            <div className="relative mx-auto max-w-5xl rounded-2xl overflow-hidden">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-black/30 via-black/22 to-black/15 backdrop-blur-xl" />
              <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
                <div className="absolute inset-0 rounded-2xl border border-white/20" />
                <div className="absolute inset-0 rounded-2xl shadow-[inset_1px_1px_2px_rgba(255,255,255,0.2),inset_-1px_-1px_1px_rgba(255,255,255,0.08)]" />
              </div>
              <div className="relative p-6 md:p-8">
                <p className="text-white/70 text-center">{labels.description}</p>
              </div>
            </div>
          </section>
        )}

        {/* Footer */}
        <footer className="relative px-4 pb-8 pt-4 md:px-8 lg:px-12">
          {/* Glass panel wrapper */}
          <div className="relative mx-auto max-w-5xl rounded-2xl overflow-hidden">
            {/* Glass overlay */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-black/30 via-black/22 to-black/15 backdrop-blur-xl" />
            {/* Specular highlight */}
            <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
              <div className="absolute inset-0 rounded-2xl border border-white/20" />
              <div className="absolute inset-0 rounded-2xl shadow-[inset_1px_1px_2px_rgba(255,255,255,0.2),inset_-1px_-1px_1px_rgba(255,255,255,0.08)]" />
            </div>

            {/* Content */}
            <div className="relative p-6 md:p-8 text-center">
              <p className="mb-1 text-xs font-medium tracking-widest text-white uppercase">
                © {currentYear} {labels.footer.copyright}
              </p>
              <p className="mb-3 text-[10px] text-white/50">
                {labels.footer.tagline}
              </p>
              <div className="flex justify-center gap-4 text-[10px] text-white/50">
                <Link href="/privacy" className="hover:text-white transition-colors">
                  {labels.footer.privacy}
                </Link>
                <span>•</span>
                <Link href="/terms" className="hover:text-white transition-colors">
                  {labels.footer.terms}
                </Link>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}