"use client";

import Image from "next/image";
import BottomNav from "@/components/bottom-nav";
import BrandMark from "@/components/brand-mark";
import LanguageSwitcher, { useSiteLanguage } from "@/components/language-switcher";
import { IconGroups } from "@/components/icons";
import type { SiteLanguage } from "@/lib/site-language";
import { useEffect, useRef, useState } from "react";

type HomePageClientProps = {
  initialLanguage: SiteLanguage;
};

export default function HomePageClient({ initialLanguage }: HomePageClientProps) {
  const heroRef = useRef<HTMLElement | null>(null);
  const [headerProgress, setHeaderProgress] = useState(0);
  const { language } = useSiteLanguage(initialLanguage);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const currentYear = new Date().getFullYear();

  const labels = language === "hu"
    ? {
        title: "Yellowsky",
        subtitle: "Vázlatok",
        storyParagraphs: [
          <>A covidos időszakban kezdtem el vázolni, mert otthon kellett tanulnom egész nap, és a lezárás alatt sehová nem mehettem. Úgy éreztem, ki kell fejeznem magam. Eleinte csak kísérleteztem, de egy idő után kihívássá vált – mind magamnak, mind másoknak: elindítottam a{" "}
            <a
              href="https://instagram.com/explore/tags/yellowskychallenge"
              target="_blank"
              rel="noreferrer"
              className="font-semibold text-primary underline decoration-primary/30 underline-offset-2 transition-colors hover:text-primary/80"
            >
              #yellowskychallenge
            </a>
            -t.</>,
          <>Sokan követték ezt az utat, amit azóta sem hagytam abba teljesen. Voltak időszakok, amikor a{" "}
            <a
              href="https://andrasdenes.com"
              className="font-semibold text-primary underline decoration-primary/30 underline-offset-2 transition-colors hover:text-primary/80"
            >
              harsonázásra
            </a>
            {" "}kellett koncentrálnom, de néha akkor is vázoltam valamit.</>,
          "Most, hogy elvégeztem a mesterképzést a Liszt Ferenc Zeneművészeti Egyetemen, egy kicsit több időm van alkotni.",
        ],
        ctaLabel: "Most elérhető",
        ctaTitle: "Vásárolj nyomatot",
        footerTagline: "Yellowsky • Vázlatok Budapestről",
      }
    : {
        title: "Yellowsky",
        subtitle: "Sketches",
        storyParagraphs: [
          <>I began sketching during covid times because I had to study at home all day and during the lockdown, I could not go anywhere. I figured I needed to express myself. At first, I was just experimenting but after a while, I challenged myself and others for a whole journey: I started the{" "}
            <a
              href="https://instagram.com/explore/tags/yellowskychallenge"
              target="_blank"
              rel="noreferrer"
              className="font-semibold text-primary underline decoration-primary/30 underline-offset-2 transition-colors hover:text-primary/80"
            >
              #yellowskychallenge
            </a>
            .</>,
          <>Many people had been following this journey which I haven&apos;t stopped fully since. I had times when I had to concentrate more on{" "}
            <a
              href="https://andrasdenes.com"
              className="font-semibold text-primary underline decoration-primary/30 underline-offset-2 transition-colors hover:text-primary/80"
            >
              playing the trombone
            </a>
            , but sometimes I sketched a bit.</>,
          "Now that I have done my master's degree on the Franz Liszt Academy of Budapest, I have a bit more free time for creating.",
        ],
        ctaLabel: "Available now",
        ctaTitle: "Get your print",
        footerTagline: "Yellowsky • Sketches from Budapest",
      };

  useEffect(() => {
    const update = () => {
      const heroHeight = heroRef.current?.offsetHeight ?? Math.round(window.innerHeight * 0.8);
      const start = Math.max(24, heroHeight - 220);
      const end = Math.max(start + 1, heroHeight - 120);
      const progress = Math.max(0, Math.min(1, (window.scrollY - start) / (end - start)));
      setHeaderProgress(progress);
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);

    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

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
      <header
        className="fixed top-0 right-0 left-0 z-50 flex items-center justify-between border-b border-neutral-border bg-white/80 px-4 py-3 backdrop-blur-md"
        style={{
          opacity: headerProgress,
          transform: `translateY(${Math.round((1 - headerProgress) * -14)}px)`,
          pointerEvents: headerProgress > 0.08 ? "auto" : "none",
        }}
      >
        <div className="flex items-center gap-2">
          <BrandMark />
          <span className="font-display text-lg font-bold tracking-tight uppercase">
            {labels.title}
          </span>
        </div>
        <LanguageSwitcher initialLanguage={initialLanguage} light={headerProgress > 0.08} />
      </header>

      <main className="flex-1 pb-24">
        {/* Hero */}
        <section ref={heroRef} className="relative flex aspect-[4/5] w-full flex-col justify-end overflow-hidden md:aspect-[16/8]">
          <div className="absolute inset-0 z-10 bg-gradient-to-t from-background-light via-background-light/40 to-transparent" />
          {mounted && (
            <div className="absolute inset-0">
              <Image
                alt="Yellowsky Seoul sketch - yellow architectural illustration"
                className="h-full w-full object-cover"
                src="/hero.jpg"
                fill
                priority
                sizes="100vw"
              />
            </div>
          )}
          <div className="relative z-20 px-6 pb-12" data-reveal>
            <h1
              className="relative font-display mb-2 text-4xl font-bold leading-none tracking-tighter md:text-7xl"
              data-reveal
              style={{
                "--reveal-delay": "120ms",
                top: `${Math.round(headerProgress * -22)}px`,
                opacity: 1 - headerProgress * 0.35,
              } as React.CSSProperties}
            >
              {labels.title}
            </h1>
            <div
              className="relative flex items-center gap-3"
              data-reveal
              style={{
                "--reveal-delay": "220ms",
                top: `${Math.round(headerProgress * -14)}px`,
                opacity: 1 - headerProgress * 0.75,
              } as React.CSSProperties}
            >
              <div className="h-px w-12 bg-primary" />
              <p className="font-display text-sm font-semibold tracking-[0.2em] text-primary uppercase">
                {labels.subtitle}
              </p>
            </div>
          </div>
        </section>

        {/* Story */}
        <section className="px-6 py-12">
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
        </section>

        {/* CTA */}
        <section className="px-6 py-8">
          <div data-reveal style={{ "--reveal-delay": "340ms" } as React.CSSProperties}>
            <a
              href="/webshop"
              className="interactive-surface group block rounded-xl border border-neutral-border bg-white p-5 transition-all hover:border-primary/40 hover:shadow-md"
              data-proximity
              data-proximity-strength="2.1"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="mb-1 text-xs font-bold tracking-widest text-primary uppercase">
                    {labels.ctaLabel}
                  </p>
                  <h3 className="font-display text-xl font-semibold">
                    {labels.ctaTitle}
                  </h3>
                </div>
                <div className="flex size-12 items-center justify-center rounded-lg bg-primary/20 text-primary transition-all group-hover:bg-primary group-hover:text-white">
                  <IconGroups className="size-6" />
                </div>
              </div>
            </a>
          </div>
        </section>
      </main>

      <BottomNav active="home" />

      <footer className="bg-background-light py-12 pb-32 text-center">
        <div className="mb-9 flex justify-center">
          <div className="h-8 w-8 rounded-full bg-primary" />
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