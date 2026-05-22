"use client";

import Image from "next/image";
import BottomNav from "@/components/bottom-nav";
import BrandMark from "@/components/brand-mark";
import LanguageSwitcher, { useSiteLanguage } from "@/components/language-switcher";
import CartButton from "@/components/cart-button";
import CartDrawer from "@/components/cart-drawer";
import { IconShoppingBag } from "@/components/icons";
import CommunityGallery from "@/components/community-gallery";
import { useCart } from "@/lib/cart-context";
import type { SiteLanguage } from "@/lib/site-language";
import { useEffect, useState } from "react";
import Link from "next/link";

type CommunityPost = {
  id: string;
  image: string;
  author: string;
  likes: number;
  caption?: string;
  link?: string;
};

type HomePageClientProps = {
  initialLanguage: SiteLanguage;
  communityPosts?: CommunityPost[];
};

export default function HomePageClient({ initialLanguage, communityPosts = [] }: HomePageClientProps) {
  const { language } = useSiteLanguage(initialLanguage);
  const { items: cartItems } = useCart();
  const [mounted, setMounted] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  useEffect(() => setMounted(true), []);

  const currentYear = new Date().getFullYear();

  const isHungarian = language === "hu";

  const openInstagram = () => {
    const deepLink = 'instagram://user?username=yellowsky.sketches';
    const webLink = 'https://instagram.com/yellowsky.sketches';
    
    // Try Instagram app deep link first, fall back to web
    const start = Date.now();
    window.location.href = deepLink;
    
    setTimeout(() => {
      if (Date.now() - start < 2000) {
        window.open(webLink, '_blank', 'noopener,noreferrer');
      }
    }, 1500);
  };

  const storyParagraphsHu = [
    <>2020-ban, a COVID idején kezdtem el rajzolni, mert a távoktatásban töltött bezártság alatt sehová sem mehettem; úgy éreztem, valahogy teret kell adnom kreativitásomnak. Eleinte csak kísérleteztem, de egy idő után kihívássá vált – mind magamnak, mind másoknak: elindítottam a{" "}
      <button
        type="button"
        onClick={openInstagram}
        className="font-semibold text-primary underline decoration-primary/30 underline-offset-2 transition-colors hover:text-primary/80 cursor-pointer"
      >
        #yellowskychallenge
      </button>
      -t.</>,
    <>Sokan csatlakoztak ehhez az alkotói úthoz, melyről azóta sem tértem le teljesen. Voltak időszakok, amikor az{" "}
      <a
        href="https://andrasdenes.com"
        target="_blank"
        rel="noopener noreferrer"
        className="font-semibold text-primary underline decoration-primary/30 underline-offset-2 transition-colors hover:text-primary/80"
      >
        előadóművészetre
      </a>{" "}
      kellett koncentrálnom, de néha akkor is készítettem építészeti grafikákat.</>,
    "Most, hogy elvégeztem a mesterképzést a Liszt Ferenc Zeneművészeti Egyetemen, egy kicsit több időm van alkotni, ezért létrehoztam ezt az oldalt, hogy a közeli ismerősökön túlra is eljuthassanak grafikáim, melyek egyenként készülnek kenderpapírra, giclée minőségben.",
  ];

  const storyParagraphsEn = [
    <>In 2020, during the covid lockdown, I began sketching because I had to study at home all day and could not go anywhere. I figured I needed to express myself. At first, I was just experimenting but after a while, I challenged myself and others for a whole journey: I started the{" "}
      <button
        type="button"
        onClick={openInstagram}
        className="font-semibold text-primary underline decoration-primary/30 underline-offset-2 transition-colors hover:text-primary/80 cursor-pointer"
      >
        #yellowskychallenge
      </button>
      .</>,
    <>Many people had been following this journey which I haven&apos;t stopped fully since. I had times when I had to concentrate more on{" "}
      <a
        href="https://andrasdenes.com"
        target="_blank"
        rel="noopener noreferrer"
        className="font-semibold text-primary underline decoration-primary/30 underline-offset-2 transition-colors hover:text-primary/80"
      >
        playing the trombone
      </a>, but sometimes I sketched a bit.</>,
    "Now that I've completed my master's degree at the Franz Liszt Academy of Budapest, I have more time to create. I created this site so my sketches can reach beyond my close circle — each one is printed on hemp paper, giclée quality.",
  ];

  const labels = isHungarian
    ? {
        title: "Yellowsky",
        subtitle: "Dénes András",
        subtitleLink: "https://andrasdenes.com",
        storyParagraphs: storyParagraphsHu,
        ctaLabel: "giclée nyomatok elérhetők",
        ctaTitle: "A galériához",
        footerTagline: "Yellowsky • Vázlatok Budapestről",
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
        title: "Yellowsky",
        subtitle: "by András Dénes",
        subtitleLink: "https://andrasdenes.com",
        storyParagraphs: storyParagraphsEn,
        ctaLabel: "giclée prints available",
        ctaTitle: "To the Gallery",
        footerTagline: "Yellowsky • Sketches from Budapest",
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
        <main className="flex-1 pb-24">
          {/* Header - same as other pages */}
          <header className="sticky top-0 z-50 border-b border-neutral-border bg-white/80 backdrop-blur-md">
            <div className="flex h-16 w-full items-center justify-between px-6">
              <Link href="/" className="font-display text-lg font-bold tracking-tight uppercase hover:opacity-80 transition-opacity">
                Yellowsky
              </Link>
              <div className="flex items-center gap-3">
                <LanguageSwitcher initialLanguage={initialLanguage} />
                {cartItems.length > 0 && (
                  <CartButton onClick={() => setCartOpen(true)} labels={{ ariaLabel: labels.cart.ariaLabel }} />
                )}
              </div>
            </div>
          </header>

          {/* Hero section - full width image */}
          <section className="relative w-full">
            {/* Image - full width */}
            <div className="relative w-full bg-white" style={{ minHeight: 'clamp(350px, 60vh, 700px)' }}>
              {mounted && (
                <Image
                  alt="Yellowsky German Street sketch - yellow architectural illustration"
                  className="object-cover"
                  style={{ objectPosition: 'center 33%' }}
                  src="/hero.jpg"
                  fill
                  priority
                  sizes="100vw"
                  draggable={false}
                  onContextMenu={(e) => e.preventDefault()}
                />
              )}
            </div>

            {/* Title text below image */}
            <div className="bg-white pt-4 pb-3">
              <div className="mx-auto max-w-2xl px-3">
                <h1 className="font-display text-7xl font-bold leading-none tracking-tighter">
                  {labels.title}
                </h1>
                <div className="mt-2 flex items-center gap-3">
                  <div className="h-px w-12 bg-primary" />
                  {labels.subtitleLink ? (
                    <a
                      href={labels.subtitleLink}
                      className="font-display text-sm font-bold tracking-[0.2em] text-primary underline decoration-primary/30 underline-offset-2 transition-colors hover:text-primary/80 uppercase"
                    >
                      {labels.subtitle}
                    </a>
                  ) : (
                    <p className="font-display text-sm font-bold tracking-[0.2em] text-primary uppercase">
                      {labels.subtitle}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* Story - all paragraphs with consistent spacing */}
          <section className="relative">
            {/* Gradient background behind first two paragraphs */}
            <div className="absolute inset-x-0 top-0 h-80 w-full pointer-events-none" style={{ background: 'linear-gradient(to bottom, #ffffff, #fafafa)' }} />
            
            <div className="relative px-3 pt-8 pb-6 md:pt-16">
              <div className="mx-auto max-w-2xl space-y-6">
                {labels.storyParagraphs.map((paragraph, idx) => (
                  <p
                    key={`story-${idx}`}
                    className="text-base leading-relaxed text-text-muted"
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>
          </section>

          {/* CTA - Gallery button */}
          <section className="px-3 py-8">
            <div className="mx-auto max-w-2xl">
              <a
                href="/webshop"
                className="block w-full"
              >
                <div className="group flex items-center gap-4 rounded-xl border border-neutral-border bg-white p-5 transition-all hover:border-primary/40 hover:shadow-md">
                  <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-primary/20 text-primary transition-all group-hover:bg-primary group-hover:text-white">
                    <IconShoppingBag className="size-6" />
                  </div>
                  <div>
                    <h3 className="font-display text-xl font-semibold">
                      {labels.ctaTitle}
                    </h3>
                    <p className="mt-1 text-xs font-medium tracking-widest text-text-muted">
                      {labels.ctaLabel}
                    </p>
                  </div>
                </div>
              </a>
            </div>
          </section>

          {/* Community Gallery - only show if posts exist */}
          {communityPosts.length > 0 && (
            <CommunityGallery posts={communityPosts} language={language} />
          )}
        </main>

        <BottomNav active="home" />

        <footer className="bg-background-light py-12 pb-32 text-center">
          {/* Trust signals */}
          <div className="mb-8 flex flex-wrap justify-center gap-x-6 gap-y-2 px-4 text-xs text-text-muted">
            <span className="flex items-center gap-1.5">
              <svg className="size-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              {language === "hu" ? "Ingyenes szállítás világszerte" : "Free worldwide shipping"}
            </span>
            <span className="flex items-center gap-1.5">
              <svg className="size-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              {language === "hu" ? "Biztonságos fizetés Stripe-pal" : "Secure checkout via Stripe"}
            </span>
            <span className="flex items-center gap-1.5">
              <svg className="size-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {language === "hu" ? "7-14 munkanapon belül" : "Ships in 7-14 calendar days"}
            </span>
            <span className="flex items-center gap-1.5">
              <svg className="size-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
              {language === "hu" ? "Giclée nyomat kenderpapíron" : "Giclée on hemp paper"}
            </span>
          </div>
          <div className="mb-9 flex justify-center">
            <BrandMark size={32} />
          </div>
          <p className="mb-1.5 text-xs font-medium tracking-widest text-text-muted uppercase">
            © {currentYear} András Dénes
          </p>
          <p className="mb-4 text-[10px] text-text-muted/60">
            {labels.footerTagline}
          </p>
          <div className="flex justify-center gap-4 text-[10px] text-text-muted/60">
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