"use client";

import BottomNav from "@/components/bottom-nav";
import LanguageSwitcher, { useSiteLanguage } from "@/components/language-switcher";
import CartButton from "@/components/cart-button";
import CartDrawer from "@/components/cart-drawer";
import ImageGallery from "@/components/image-gallery";
import { useCart } from "@/lib/cart-context";
import Link from "next/link";
import type { SiteLanguage } from "@/lib/site-language";
import { useState } from "react";

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

export default function WebshopPageClient({ items, hasConfig, initialLanguage }: WebshopPageClientProps) {
  const { items: cartItems, addItem } = useCart();
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const { language } = useSiteLanguage(initialLanguage);

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

  const handleAddToCart = (item: MediaItem, priceId: string) => {
    const selectedPriceObj = item.prices?.find(p => p.id === priceId);
    if (!selectedPriceObj) return;

    setLoading(prev => ({ ...prev, [item.id]: true }));

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

    setTimeout(() => {
      setLoading(prev => {
        const { [item.id]: _, ...rest } = prev;
        return rest;
      });
    }, 300);
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
              <ImageGallery
                items={items}
                labels={{
                  buyPrint: labels.buyPrint,
                  loading: labels.loading,
                  freeShipping: labels.freeShipping,
                  addToCart: labels.addToCart,
                  comingSoon: labels.comingSoon,
                  selectSize: labels.selectSize,
                }}
                onAddToCart={handleAddToCart}
                cartLoading={loading}
              />
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

        <footer className="fixed bottom-[calc(4rem+env(safe-area-inset-bottom))] left-0 right-0 z-40 bg-background-light/80 backdrop-blur-md">
          <div className="flex justify-center gap-4 py-2 text-[10px] text-text-muted/60">
            <Link href="/privacy" className="hover:text-primary transition-colors">
              {language === "hu" ? "Adatvédelem" : "Privacy"}
            </Link>
            <span>•</span>
            <Link href="/terms" className="hover:text-primary transition-colors">
              {language === "hu" ? "ÁSZF" : "Terms"}
            </Link>
          </div>
        </footer>
      </div>
    </>
  );
}