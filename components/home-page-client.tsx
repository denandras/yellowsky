"use client";

import Image from "next/image";
import BottomNav from "@/components/bottom-nav";
import BrandMark from "@/components/brand-mark";
import LanguageSwitcher, { useSiteLanguage } from "@/components/language-switcher";
import { IconShoppingBag } from "@/components/icons";
import type { SiteLanguage } from "@/lib/site-language";
import { useEffect, useState } from "react";

type HomePageClientProps = {
  initialLanguage: SiteLanguage;
};

export default function HomePageClient({ initialLanguage }: HomePageClientProps) {
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
    <>A koronavírus alatt kezdtem el rajzolni, mert a távoktatásban töltött bezártság alatt sehová sem mehettem. Úgy éreztem, valahogy teret kell adnom kreativitásomnak. Eleinte csak kísérleteztem, de egy idő után kihívássá vált – mind magamnak, mind másoknak: elindítottam a{" "}
      <button
        type="button"
        onClick={openInstagram}
        className="font-semibold text-primary underline decoration-primary/30 underline-offset-2 transition-colors hover:text-primary/80 cursor-pointer"
      >
        #yellowskychallenge
      </button>
      -t.</>,
    <>Sokan csatlakoztak ehhez az alkotói úthoz, melyről azóta sem tértem le teljesen. Voltak időszakok, amikor a harsonázásra kellett koncentrálnom, de néha akkor is rajzoltam valamit.</>,
    "Most, hogy elvégeztem a mesterképzést a Liszt Ferenc Zeneművészeti Egyetemen, egy kicsit több időm van alkotni.",
  ];

  const storyParagraphsEn = [
    <>I began sketching during covid times because I had to study at home all day and during the lockdown, I could not go anywhere. I figured I needed to express myself. At first, I was just experimenting but after a while, I challenged myself and others for a whole journey: I started the{" "}
      <button
        type="button"
        onClick={openInstagram}
        className="font-semibold text-primary underline decoration-primary/30 underline-offset-2 transition-colors hover:text-primary/80 cursor-pointer"
      >
        #yellowskychallenge
      </button>
      .</>,
    <>Many people had been following this journey which I haven&apos;t stopped fully since. I had times when I had to concentrate more on playing the trombone, but sometimes I sketched a bit.</>,
    "Now that I have done my master's degree on the Franz Liszt Academy of Budapest, I have a bit more free time for creating.",
  ];

  const labels = isHungarian
    ? {
        title: "Yellowsky",
        subtitle: "Dénes András",
        subtitleLink: "https://andrasdenes.com",
        storyParagraphs: storyParagraphsHu,
        ctaLabel: "giclèe nyomatok elérhetők",
        ctaTitle: "A galériához",
        footerTagline: "Yellowsky • Vázlatok Budapestről",
      }
    : {
        title: "Yellowsky",
        subtitle: "by András Dénes",
        subtitleLink: "https://andrasdenes.com",
        storyParagraphs: storyParagraphsEn,
        ctaLabel: "giclèe prints available",
        ctaTitle: "To the Gallery",
        footerTagline: "Yellowsky • Sketches from Budapest",
      };

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
      { threshold: 0.08, rootMargin: "0px 0px -6% 0px" },
    );

    const raf = window.requestAnimationFrame(() => {
      nodes.forEach((node) => observer.observe(node));
    });

    return () => {
      window.cancelAnimationFrame(raf);
      observer.disconnect();
    };
  }, []);

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
              <div className="absolute inset-0 flex items-center justify-center p-4">
                <Image
                  alt="Yellowsky Seoul sketch - yellow architectural illustration"
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
          <div className="bg-white px-6 pt-2 pb-1">
            <h1
              key={`title-${language}`}
              className="font-display mb-1.5 md:mb-2 text-4xl font-bold leading-none tracking-tighter md:text-7xl"
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
                  className="font-display text-sm font-semibold tracking-[0.2em] text-primary underline decoration-primary/30 underline-offset-2 transition-colors hover:text-primary/80 uppercase"
                >
                  {labels.subtitle}
                </a>
              ) : (
                <p className="font-display text-sm font-semibold tracking-[0.2em] text-primary uppercase">
                  {labels.subtitle}
                </p>
              )}
            </div>
          </div>

          {/* Fade from white to page background with first paragraph on top */}
          <div className="relative h-48 w-full" style={{ background: 'linear-gradient(to bottom, #ffffff, #fafafa)' }}>
            <div className="absolute inset-x-0 top-0 px-6 pt-4" data-reveal
              style={{ "--reveal-delay": "100ms" } as React.CSSProperties}>
              <div className="mx-auto max-w-2xl">
                {labels.storyParagraphs[0] && (
                  <p className="text-base leading-relaxed text-text-muted">
                    {labels.storyParagraphs[0]}
                  </p>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Rest of story */}
        <section className="px-6 pb-6">
          <div key={`story-${language}`} className="mx-auto max-w-2xl space-y-6" data-reveal>
            {labels.storyParagraphs.slice(1).map((paragraph, idx) => (
              <p
                key={`story-${idx + 1}`}
                className="text-base leading-relaxed text-text-muted"
                data-reveal
                style={{ "--reveal-delay": `${180 + idx * 80}ms` } as React.CSSProperties}
              >
                {paragraph}
              </p>
            ))}
          </div>
        </section>

        {/* CTA - Gallery button */}
        <section className="px-6 py-8">
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
      </main>

      <BottomNav active="home" />

      <footer className="bg-background-light py-12 pb-32 text-center">
        <div className="mb-9 flex justify-center">
          <BrandMark size={32} />
        </div>
        <p className="mb-2 text-xs font-medium tracking-widest text-text-muted uppercase">
          © {currentYear} András Dénes
        </p>
        <p className="text-[10px] text-text-muted/60">
          {labels.footerTagline}
        </p>
      </footer>
    </div>
  );
}