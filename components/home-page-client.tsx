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
import { useEffect, useState, useRef } from "react";
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
  const [heroLoaded, setHeroLoaded] = useState(false);
  const [showTitle, setShowTitle] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  useEffect(() => setMounted(true), []);

  // Show title after hero loads or after 300ms
  useEffect(() => {
    if (heroLoaded) {
      setShowTitle(true);
      return;
    }
    const timer = setTimeout(() => setShowTitle(true), 300);
    return () => clearTimeout(timer);
  }, [heroLoaded]);

  const [heroBottomDebug, setHeroBottomDebug] = useState(0);
  const [headerBottomDebug, setHeaderBottomDebug] = useState(0);
  const [contentUnfixed, setContentUnfixed] = useState(false);
  const contentUnfixedRef = useRef(false);
  const [unfixedMarginTop, setUnfixedMarginTop] = useState(0);

  // Reveal animation observer - based on hero scroll position
  useEffect(() => {
    const nodes = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
    if (!nodes.length) return;

    const checkVisibility = () => {
      // Target the image container, not the entire hero section
      const heroImage = document.querySelector('section[class*="z-20"] > div[class*="absolute"]');
      if (!heroImage) return;

      const heroRect = heroImage.getBoundingClientRect();
      const heroBottom = heroRect.bottom;
      
      // Get header bottom for debug
      const header = document.querySelector('header');
      const headerBottom = header ? header.getBoundingClientRect().bottom : 0;
      
      // Debug: update line positions
      setHeroBottomDebug(heroBottom);
      setHeaderBottomDebug(headerBottom);

      // When hero bottom reaches header bottom, unfixed content
      // Add 1px buffer to prevent jitter at boundary
      if (heroBottom <= headerBottom - 1 && !contentUnfixedRef.current) {
        contentUnfixedRef.current = true;
        setContentUnfixed(true);
        // Calculate margin to keep content in same visual position
        const scrollY = window.scrollY;
        setUnfixedMarginTop(scrollY - 64);
      } else if (heroBottom > headerBottom + 1 && contentUnfixedRef.current) {
        contentUnfixedRef.current = false;
        setContentUnfixed(false);
        setUnfixedMarginTop(0);
      }

      nodes.forEach((node) => {
        const rect = node.getBoundingClientRect();
        
        // Fade in when hero has scrolled away enough that paragraph is fully exposed
        // Fade out when scrolling back and hero covers the paragraph again
        if (heroBottom < rect.top) {
          // Hero bottom is above paragraph top → paragraph exposed → fade in
          if (!node.classList.contains("is-visible")) {
            node.classList.add("is-visible");
          }
        } else {
          // Hero bottom is below paragraph top → paragraph covered → fade out
          if (node.classList.contains("is-visible")) {
            node.classList.remove("is-visible");
          }
        }
      });
    };

    // Check on scroll and resize, slight delay for initial load
    const timer = setTimeout(checkVisibility, 100);
    window.addEventListener("scroll", checkVisibility, { passive: true });
    window.addEventListener("resize", checkVisibility, { passive: true });

    return () => {
      clearTimeout(timer);
      window.removeEventListener("scroll", checkVisibility);
      window.removeEventListener("resize", checkVisibility);
    };
  }, []);

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
        footerTagline: "Yellowsky • Építészeti grafikák",
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
        footerTagline: "Yellowsky • Architectural graphics",
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

      <div className="bg-background-light text-text-dark">
        {/* Purple vertical line for testing */}
        <div className="fixed left-1/2 top-16 bottom-0 w-px bg-purple-500 z-10 pointer-events-none" style={{ transform: 'translateX(-50%)' }} />

        {/* Header */}
        <header className="sticky top-0 z-50 border-b border-neutral-border bg-white/80 backdrop-blur-md">
          <div className="flex h-16 w-full items-center justify-between px-6">
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="font-display text-lg font-bold tracking-tight uppercase hover:opacity-80 transition-opacity cursor-pointer"
            >
              Yellowsky
            </button>
            <div className="flex items-center gap-3">
              <LanguageSwitcher initialLanguage={initialLanguage} />
              <CartButton onClick={() => setCartOpen(true)} labels={{ ariaLabel: labels.cart.ariaLabel }} hrefWhenEmpty="/webshop" />
            </div>
          </div>
        </header>

        {/* Hero section - scrolls up and away, in front of purple line */}
        <section className="relative w-full z-20 h-[calc(60vh-13px+40px-13.25rem)] sm:h-[calc(60vh-13px+40px-13.25rem)] md:h-[calc(78vh-14px+42px-13.75rem)] lg:h-[calc(78vh-7px+42px-14.5rem)]">
          {/* Image - full width, positioned at top */}
          <div className="absolute top-0 left-0 right-0 h-[calc(60vh-7px)] md:h-[calc(78vh-7px)] overflow-hidden bg-neutral-100">
            {mounted && (
                <Image
                  alt="Yellowsky German Street sketch - yellow architectural illustration"
                  className={`object-cover transition-opacity duration-500 ${heroLoaded ? 'opacity-100' : 'opacity-0'}`}
                  style={{ objectPosition: 'center 36%' }}
                  src="/hero.jpg"
                  fill
                  priority
                  sizes="100vw"
                  unoptimized
                  draggable={false}
                  onContextMenu={(e) => e.preventDefault()}
                  onLoad={() => setHeroLoaded(true)}
                />
              )}
            </div>
          </section>

        {/* Sticky title - stays at top while hero scrolls away */}
        <div className="sticky top-[calc(64px+1.25rem+3px)] md:top-[calc(64px+1.25rem-1px)] z-20 pointer-events-none">
          <div className="flex flex-col items-start px-6">
            <div className="relative -mt-[1px] md:mt-0">
              {/* Yellow offset text behind */}
              <h1
                className="font-display font-bold leading-none tracking-tighter absolute top-0 left-0"
                style={{
                  fontSize: 'clamp(4.5rem, 4rem + 3vw, 5.75rem)',
                  transform: 'translateX(4px) translateY(clamp(3.5px, 1.5px + 0.25vw, 5.5px))',
                  color: '#ffcb2a'
                }}
              >
                {labels.title}
              </h1>
              {/* Dark text on top */}
              <h1
                className="font-display font-bold leading-none tracking-tighter relative"
                style={{
                  fontSize: 'clamp(4.5rem, 4rem + 3vw, 5.75rem)',
                  transform: 'translateY(clamp(3.5px, 1.5px + 0.25vw, 5.5px))',
                  color: '#1a1a1a'
                }}
              >
                {labels.title}
              </h1>
            </div>
            <div className={`mt-2 ml-[24px] flex items-center gap-3 transition-all duration-700 delay-150 ${showTitle ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              <div className="h-px w-12 bg-text-dark" />
              <a
                href="https://andrasdenes.com"
                className="font-display text-[1.0625rem] font-bold tracking-[0.1em] text-text-dark underline decoration-primary underline-offset-2 transition-colors hover:text-text-muted uppercase pointer-events-auto"
              >
                {labels.subtitle}
              </a>
            </div>
          </div>
        </div>

        {/* Scroll spacer - creates scroll height for hero reveal */}
        <div className="h-[100vh]" />

        {/* Debug: Hero bottom indicator */}
        {heroBottomDebug > 0 && (
          <>
            {/* Header bottom line */}
            <div 
              className="fixed left-0 right-0 h-0.5 bg-green-500 z-50 pointer-events-none"
              style={{ top: `${headerBottomDebug}px` }}
            />
            {/* Hero bottom line */}
            <div 
              className="fixed left-0 right-0 h-0.5 bg-purple-500 z-50 pointer-events-none"
              style={{ top: `${heroBottomDebug}px` }}
            />
            {/* Gap display */}
            <div 
              className="fixed left-4 z-50 pointer-events-none bg-black/70 text-white px-2 py-1 rounded text-xs font-mono"
              style={{ top: `${(headerBottomDebug + heroBottomDebug) / 2}px` }}
            >
              Gap: {Math.round(heroBottomDebug - headerBottomDebug)}px
            </div>
          </>
        )}

        {/* Content - fixed until hero sticks, then unfixed */}
        <div 
          className={`${contentUnfixed ? 'relative' : 'fixed inset-x-0 top-16 bottom-0'} z-0`}
        >
          {!contentUnfixed && <div className="h-[calc(9vh+65px)] md:h-[calc(11vh+65px)] lg:h-[calc(12vh+65px)]" />}
          {/* CTA - Gallery button */}
          <section className="px-3 pt-8 pb-3">
            <div className="mx-auto max-w-2xl opacity-0 transition-opacity duration-700" data-reveal>
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

          {/* Story - behind purple line */}
          <section className="relative bg-background-light pt-4">
            <div className="relative px-3 pb-6">
              <div className="mx-auto max-w-2xl space-y-6">
                {labels.storyParagraphs.map((paragraph, idx) => (
                  <p
                    key={`story-${idx}`}
                    className="text-base leading-relaxed text-text-muted text-justify opacity-0 transition-opacity duration-700"
                    data-reveal
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>
          </section>

          {/* Community Gallery - only show if posts exist */}
          {communityPosts.length > 0 && (
            <CommunityGallery posts={communityPosts} language={language} />
          )}

          <footer className="bg-background-light py-12 pb-32 text-center">
          {/* Trust signals */}
          <div className="mb-8 flex flex-wrap justify-center gap-x-6 gap-y-2 px-4 text-xs text-text-muted">
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
          <div className="mb-9 flex justify-center">
            <BrandMark size={32} />
          </div>
          <p className="mb-1.5 text-xs font-medium tracking-widest text-text-muted uppercase">
            © {currentYear} {language === "hu" ? "Dénes András" : "András Dénes"}
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

        <BottomNav active="home" />
      </div>
    </>
  );
}