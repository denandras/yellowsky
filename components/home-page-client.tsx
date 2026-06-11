"use client";

import Image from "next/image";
import BrandMark from "@/components/brand-mark";
import LanguageSwitcher, { useSiteLanguage } from "@/components/language-switcher";
import CartButton from "@/components/cart-button";
import CartDrawer from "@/components/cart-drawer";
import { IconShoppingBag } from "@/components/icons";
import { useCart } from "@/lib/cart-context";
import type { SiteLanguage } from "@/lib/site-language";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type HomePageClientProps = {
  initialLanguage: SiteLanguage;
};

export default function HomePageClient({ initialLanguage }: HomePageClientProps) {
  const router = useRouter();
  const { language, setLanguage } = useSiteLanguage(initialLanguage);
  const { items: cartItems } = useCart();
  const [mounted, setMounted] = useState(false);
  const [heroLoaded, setHeroLoaded] = useState(false);
  const [showTitle, setShowTitle] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [heroOpacity, setHeroOpacity] = useState(1);
  const [isMobile, setIsMobile] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);
  useEffect(() => setMounted(true), []);

  // Detect mobile on client
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const checkMobile = () => setIsMobile(window.matchMedia('(max-width: 768px)').matches);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Scroll tracking for hero fade
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleScroll = () => {
      const scrollY = window.scrollY;
      // Linear fade from 0 to 160px (or 200px on desktop)
      const fadeDistance = isMobile ? 160 : 200;
      const opacity = Math.max(0, 1 - scrollY / fadeDistance);
      setHeroOpacity(opacity);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Call immediately to set initial state
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isMobile]);

  // Show title after hero loads or after 300ms
  useEffect(() => {
    if (heroLoaded) {
      setShowTitle(true);
      return;
    }
    const timer = setTimeout(() => setShowTitle(true), 300);
    return () => clearTimeout(timer);
  }, [heroLoaded]);

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
        className="font-semibold text-yellow-400 underline decoration-yellow-400/30 underline-offset-2 transition-colors hover:text-yellow-300 cursor-pointer"
      >
        #yellowskychallenge
      </button>
      -t.</>,
    <>Sokan csatlakoztak ehhez az alkotói úthoz, melyről azóta sem tértem le teljesen. Voltak időszakok, amikor az{" "}
      <a
        href="https://andrasdenes.com"
        target="_blank"
        rel="noopener noreferrer"
        className="font-semibold text-yellow-400 underline decoration-yellow-400/30 underline-offset-2 transition-colors hover:text-yellow-300"
      >
        előadóművészetre
      </a>{" "}
      kellett koncentrálnom, de néha akkor is készítettem építészeti grafikákat.</>,
    "Most, hogy elvégeztem a mesterképzést a Liszt Ferenc Zeneművészeti Egyetemen, egy kicsit több időm van alkotni, ezért létrehoztam ezt az oldalt, hogy a közeli ismerősökön túlra is eljuthassanak grafikáim, melyek egyenként készülnek kenderpapírra, fine art minőségben.",
  ];

  const storyParagraphsEn = [
    <>In 2020, during the covid lockdown, I began sketching because I had to study at home all day and could not go anywhere. I figured I needed to express myself. At first, I was just experimenting but after a while, I challenged myself and others for a whole journey: I started the{" "}
      <button
        type="button"
        onClick={openInstagram}
        className="font-semibold text-yellow-400 underline decoration-yellow-400/30 underline-offset-2 transition-colors hover:text-yellow-300 cursor-pointer"
      >
        #yellowskychallenge
      </button>
      .</>,
    <>Many people had been following this journey which I haven&apos;t stopped fully since. I had times when I had to concentrate more on{" "}
      <a
        href="https://andrasdenes.com"
        target="_blank"
        rel="noopener noreferrer"
        className="font-semibold text-yellow-400 underline decoration-yellow-400/30 underline-offset-2 transition-colors hover:text-yellow-300"
      >
        playing the trombone
      </a>, but sometimes I sketched a bit.</>,
    "Now that I've completed my master's degree at the Franz Liszt Academy of Budapest, I have more time to create. I created this site so my sketches can reach beyond my close circle — each one is printed on hemp paper, fine art quality.",
  ];

  const labels = isHungarian
    ? {
        title: "Yellowsky",
        subtitle: "Dénes András",
        subtitleLink: "https://andrasdenes.com",
        storyParagraphs: storyParagraphsHu,
        ctaLabel: "minőségi printek vásárlása",
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
        ctaLabel: "fine art prints available",
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

      {/* SVG Filter Definition for Liquid Glass Effect */}
      <svg className="absolute w-0 h-0" aria-hidden="true">
        <defs>
          <filter id="liquid-glass-distortion" x="-20%" y="-20%" width="140%" height="140%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.012 0.012"
              numOctaves="3"
              seed="42"
              result="noise"
            />
            <feGaussianBlur in="noise" stdDeviation="1.5" result="blurred" />
            <feDisplacementMap
              in="SourceGraphic"
              in2="blurred"
              scale="25"
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </defs>
      </svg>

      {/* Fixed background - hero image with title overlay */}
      <div className="fixed inset-0 z-0 bg-neutral-900 h-screen w-screen">
        <div className="relative w-full h-full">
          {mounted && (
            <Image
              alt="Yellowsky German Street sketch - yellow architectural illustration"
              className={`transition-opacity duration-1000 ${heroLoaded ? 'opacity-100' : 'opacity-0'}`}
              style={{ objectFit: 'cover', objectPosition: 'center center' }}
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
        {/* Subtle gradient overlay for depth */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/40" />
        
        {/* Hero text - static position relative to image, scales from center */}
        <div 
          className="absolute top-[62%] left-1/2"
          style={{ opacity: showTitle ? heroOpacity : 0, transition: showTitle ? 'opacity 0ms' : 'opacity 700ms' }}
        >
          <div 
            className="w-max"
            style={{ transform: 'translateX(-50%) translateY(4px)', transformOrigin: 'center center' }}
          >
            {/* Title */}
            <div className="relative">
              {/* Yellow offset text behind */}
              <h1
                className="font-display font-bold leading-none tracking-tighter absolute top-0 left-0 text-yellow-400 drop-shadow-lg"
                style={{
                  fontSize: 'clamp(4rem, 8vw, 7rem)',
                  transform: 'translateX(0.5vw) translateY(0.5vw)',
                }}
              >
                {labels.title}
              </h1>
              {/* White text on top */}
              <h1
                className="font-display font-bold leading-none tracking-tighter relative text-white drop-shadow-lg"
                style={{
                  fontSize: 'clamp(4rem, 8vw, 7rem)',
                  transform: 'translateY(0.5vw)',
                }}
              >
                {labels.title}
              </h1>
            </div>
            {/* Subtitle */}
            <div className="mt-[1.5vw] flex items-center gap-[1vw]">
              <div className="h-px w-[4vw] min-w-[2rem] max-w-[4rem] bg-white/60" />
              <a
                href="https://andrasdenes.com"
                className="font-display text-[clamp(1rem,2vw,1.5rem)] font-bold tracking-[0.1em] text-white/90 underline decoration-yellow-400/60 underline-offset-2 transition-colors hover:text-white"
              >
                {labels.subtitle}
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Content layer - scrolls over fixed background */}
      <div className="relative z-10 min-h-screen">
        {/* Header - minimal, glass buttons only */}
        <header className="fixed top-0 left-0 right-0 z-50">
          <div className="flex items-center justify-end px-6 pt-5">
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
                  <IconShoppingBag className="size-5 text-yellow-400" />
                </div>
              </button>
            </div>
          </div>
        </header>

        {/* Hero spacer - leaves room for the background image */}
        <section ref={heroRef} className="h-screen" />

        {/* Content section */}
        <div className="relative px-4 pb-24">
          <div className="max-w-2xl mx-auto space-y-6">
            {/* Story Glass Card */}
            <section>
              <div className="glass-panel !rounded-2xl">
                {/* Distortion filter layer */}
                <div className="absolute inset-0 rounded-2xl backdrop-filter-[url(#liquid-glass-distortion)]" />
                {/* Glass overlay - darker tone */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-black/20 via-black/15 to-black/10 backdrop-blur-2xl" />
                {/* Specular highlight */}
                <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
                  <div className="absolute inset-0 rounded-2xl border border-white/20" />
                  <div className="absolute inset-0 rounded-2xl shadow-[inset_1px_1px_3px_rgba(255,255,255,0.2),inset_-1px_-1px_1px_rgba(255,255,255,0.08)]" />
                </div>
                {/* Content */}
                <div className="relative p-6 md:p-8 space-y-5">
                  {labels.storyParagraphs.map((paragraph, idx) => (
                    <p
                      key={`story-${idx}`}
                      className="text-base leading-relaxed text-white/85 text-left md:text-justify drop-shadow-sm"
                    >
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>
            </section>

            {/* CTA Glass Card */}
            <section>
              <a
                href="/webshop"
                className="block w-full"
              >
                <div className={`glass-panel !rounded-2xl group ${heroLoaded ? 'opacity-100' : 'opacity-0'}`} style={{ transition: 'opacity 600ms ease-out' }}>
                  {/* Distortion filter layer */}
                  <div className="absolute inset-0 rounded-2xl backdrop-filter-[url(#liquid-glass-distortion)]" />
                  {/* Glass overlay - darker tone */}
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-black/25 via-black/18 to-black/12 backdrop-blur-xl" />
                  {/* Specular highlight */}
                  <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
                    <div className="absolute inset-0 rounded-2xl border border-white/20" />
                    <div className="absolute inset-0 rounded-2xl shadow-[inset_1px_1px_2px_rgba(255,255,255,0.25),inset_-1px_-1px_1px_rgba(255,255,255,0.08)]" />
                  </div>
                  {/* Content */}
                  <div className="relative flex items-center gap-4 p-5 transition-transform duration-500 ease-out group-hover:scale-[1.02]">
                    <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-white text-neutral-900 transition-all duration-500 ease-out group-hover:bg-yellow-400 shadow-lg border border-white/20">
                      <IconShoppingBag className="size-6" />
                    </div>
                    <div>
                      <h3 className="font-display text-xl font-semibold text-white drop-shadow-sm">
                        {labels.ctaTitle}
                      </h3>
                      <p className="mt-1 text-xs font-medium tracking-widest text-white/70">
                        {labels.ctaLabel}
                      </p>
                    </div>
                  </div>
                </div>
              </a>
            </section>

            {/* Footer Glass Card */}
            <footer>
              <div className={`glass-panel !rounded-2xl ${heroLoaded ? 'opacity-100' : 'opacity-0'}`} style={{ transition: 'opacity 600ms ease-out' }}>
                {/* Distortion filter layer */}
                <div className="absolute inset-0 rounded-2xl backdrop-filter-[url(#liquid-glass-distortion)]" />
                {/* Glass overlay - darker tone */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-black/18 via-black/12 to-black/8 backdrop-blur-xl" />
                {/* Specular highlight */}
                <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
                  <div className="absolute inset-0 rounded-2xl border border-white/15" />
                  <div className="absolute inset-0 rounded-2xl shadow-[inset_1px_1px_2px_rgba(255,255,255,0.2)]" />
                </div>
                {/* Content */}
                <div className="relative py-8 px-6 text-center">
                  {/* Trust signals */}
                  <div className="mb-6 flex flex-wrap justify-center gap-x-5 gap-y-2 text-xs text-white">
                    <span className="flex items-center gap-1.5">
                      <svg className="size-4 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      {language === "hu" ? "Ingyenes szállítás" : "Free shipping"}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <svg className="size-4 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {language === "hu" ? "7-14 nap" : "7-14 days"}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <svg className="size-4 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      {language === "hu" ? "Biztonságos fizetés" : "Secure checkout"}
                    </span>
                  </div>
                  <div className="mb-6 flex justify-center">
                    <BrandMark size={28} className="text-white/80" />
                  </div>
                  <p className="mb-1 text-xs font-medium tracking-widest text-white uppercase">
                    © {currentYear} {language === "hu" ? "Dénes András" : "András Dénes"}
                  </p>
                  <p className="mb-3 text-[10px] text-white/50">
                    {labels.footerTagline}
                  </p>
                  <div className="flex justify-center gap-4 text-[10px] text-white/50">
                    <Link href="/privacy" className="hover:text-white transition-colors">
                      {language === "hu" ? "Adatvédelem" : "Privacy"}
                    </Link>
                    <span>•</span>
                    <Link href="/terms" className="hover:text-white transition-colors">
                      {language === "hu" ? "ÁSZF" : "Terms"}
                    </Link>
                  </div>
                </div>
              </div>
            </footer>
          </div>
        </div>
      </div>

      {/* Global styles for glass effect */}
      <style jsx global>{`
        .glass-panel {
          position: relative;
          border-radius: 1.5rem;
          overflow: hidden;
        }
        
        .glass-panel::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: inherit;
          padding: 1px;
          background: linear-gradient(135deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.15) 100%);
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          pointer-events: none;
        }

        /* Glass pill for header elements */
        .glass-pill {
          position: relative;
          border-radius: 9999px;
          overflow: hidden;
        }

        /* Glass circle for buttons */
        .glass-circle {
          position: relative;
          border-radius: 9999px;
          overflow: hidden;
          cursor: pointer;
          transition: transform 0.2s ease;
        }

        .glass-circle:hover {
          transform: scale(1.05);
        }

        /* Smooth glass panel transition */
        .glass-panel {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
      `}</style>
    </>
  );
}