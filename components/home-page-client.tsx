"use client";

import Image from "next/image";
import BottomNav from "@/components/bottom-nav";
import BrandMark from "@/components/brand-mark";
import LanguageSwitcher, { useSiteLanguage } from "@/components/language-switcher";
import { IconShoppingBag } from "@/components/icons";
import CommunityGallery from "@/components/community-gallery";
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
  const [mounted, setMounted] = useState(false);
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
    <>Sokan csatlakoztak ehhez az alkotói úthoz, melyről azóta sem tértem le teljesen. Voltak időszakok, amikor az előadóművészetre kellett koncentrálnom, de néha akkor is készítettem építészeti grafikákat.</>,
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
    <>Many people had been following this journey which I haven&apos;t stopped fully since. I had times when I had to concentrate more on playing the trombone, but sometimes I sketched a bit.</>,
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
      }
    : {
        title: "Yellowsky",
        subtitle: "by András Dénes",
        subtitleLink: "https://andrasdenes.com",
        storyParagraphs: storyParagraphsEn,
        ctaLabel: "giclée prints available",
        ctaTitle: "To the Gallery",
        footerTagline: "Yellowsky • Sketches from Budapest",
      };

  useEffect(() => {
    const nodes = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
    if (!nodes.length) return;

    // Reset all reveal elements to initial state (for language switches)
    nodes.forEach((node) => {
      node.classList.remove("is-visible");
    });

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.08, rootMargin: "0px 0px -6% 0px" },
    );

    const raf = window.requestAnimationFrame(() => {
      nodes.forEach((node) => observer.observe(node));
    });

    return () => {
      window.cancelAnimationFrame(raf);
      observer.disconnect();
    };
  }, [language]);

  return (
    <div className="flex min-h-screen flex-col bg-background-light text-text-dark">
      <main className="flex-1 pb-24">
        {/* Hero section */}
        <section className="relative w-full">
          {/* Language switcher - fixed to viewport corner */}
          <div className="fixed top-4 right-4 z-50">
            <LanguageSwitcher initialLanguage={initialLanguage} />
          </div>

          {/* Top gradient: page color to white */}
          <div className="h-8 w-full" style={{ background: 'linear-gradient(to bottom, #fafafa 0%, #ffffff 100%)' }} />

          {/* Image */}
          <div className="relative w-full bg-white" style={{ minHeight: 'clamp(200px, 40vh, 500px)' }}>
            {mounted && (
              <div className="absolute inset-0 flex items-center justify-center px-2.5 py-4">
                <Image
                  alt="Yellowsky German Street sketch - yellow architectural illustration"
                  className="h-full w-full object-contain transition-opacity duration-500"
                  src="/hero.jpg"
                  fill
                  priority
                  sizes="100vw"
                  onLoad={(e) => {
                    (e.target as HTMLImageElement).style.opacity = "1";
                  }}
                  style={{ opacity: 0, objectFit: "contain", objectPosition: "center" }}
                />
              </div>
            )}
          </div>

          {/* Title text */}
          <div className="bg-white pt-2 pb-1">
            <div className="mx-auto max-w-2xl px-2">
              <h1
                key={`title-${language}`}
                className="font-display mb-1.5 md:mb-2 text-7xl font-bold leading-none tracking-tighter"
                data-reveal
                style={{ "--reveal-delay": "120ms" } as React.CSSProperties}
              >
                {labels.title}
              </h1>
              <div
                key={`subtitle-${language}`}
                className="flex items-center gap-3"
                data-reveal
                style={{ "--reveal-delay": "220ms" } as React.CSSProperties}
              >
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
          
          <div className="relative px-2 pt-8 pb-6 md:pt-16">
            <div className="mx-auto max-w-2xl space-y-6" data-reveal>
              {labels.storyParagraphs.map((paragraph, idx) => (
                <p
                  key={`story-${idx}`}
                  className="text-base leading-relaxed text-text-muted"
                  data-reveal
                  style={{ "--reveal-delay": `${100 + idx * 80}ms` } as React.CSSProperties}
                  >
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        </section>

        {/* CTA - Gallery button */}
        <section className="px-2 py-8">
          <div key={`cta-${language}`} className="mx-auto max-w-2xl" data-reveal style={{ "--reveal-delay": "340ms" } as React.CSSProperties}>
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
  );
}