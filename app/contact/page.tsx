import type { Metadata } from "next";
import BottomNav from "@/components/bottom-nav";
import BrandMark from "@/components/brand-mark";
import { IconMail, IconOpenInNew, IconCamera } from "@/components/icons";
import { useEffect } from "react";

export const metadata: Metadata = {
  title: "Contact | Yellowsky",
  description: "Get in touch about prints, commissions, or collaborations.",
};

export default function ContactPage() {
  return <ContactPageClient />;
}

function ContactPageClient() {
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

  const labels = {
    header: "Get in Touch",
    email: "Email",
    instagram: "Instagram",
    name: "Name",
    emailAddress: "Email Address",
    message: "Message",
    placeholderName: "Your name",
    placeholderEmail: "Your email",
    placeholderMessage: "How can I help you?",
    send: "Send Message",
    subject: "New inquiry from yellowsky.andrasdenes.com",
  };

  return (
    <div className="flex min-h-screen flex-col bg-background-light text-text-dark">
      <header className="sticky top-0 z-50 border-b border-neutral-border bg-white/80 backdrop-blur-md">
        <div className="flex h-16 w-full items-center justify-center px-6">
          <div className="flex items-center gap-2">
            <BrandMark />
            <h1 className="font-display text-lg font-bold tracking-tight uppercase">{labels.header}</h1>
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-6 py-8 pb-24">
        <section className="mt-6">
          <div className="relative grid gap-6 border-b border-neutral-border/70 py-10 md:grid-cols-12 md:gap-8" data-reveal>
            <h3 className="pointer-events-none absolute top-11 left-1 z-0 hidden max-w-[92%] font-display text-6xl leading-[0.85] font-bold tracking-tight text-text-dark/10 uppercase md:block lg:text-7xl">
              {labels.header}
            </h3>

            <div className="md:col-span-4 md:order-1 md:text-left">
              <h3 className="font-display text-4xl leading-[0.88] font-bold tracking-tight uppercase md:hidden">
                {labels.header}
              </h3>
            </div>

            <div className="relative md:col-span-8 md:order-2">
              <div className="relative z-10 space-y-3 md:pt-10">
                <div data-reveal style={{ "--reveal-delay": "120ms" }}>
                  <a
                    href="mailto:contact@andrasdenes.com"
                    className="interactive-surface group flex items-center justify-between rounded-xl border border-neutral-border bg-white p-5 transition-all hover:border-primary/40 hover:shadow-md"
                    data-proximity
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex size-12 items-center justify-center rounded-lg bg-primary/20 text-primary">
                        <IconMail className="size-5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold tracking-widest text-primary uppercase">{labels.email}</p>
                        <p className="font-display font-semibold">contact@andrasdenes.com</p>
                      </div>
                    </div>
                    <IconOpenInNew className="size-5 text-text-muted transition-colors group-hover:text-primary" />
                  </a>
                </div>

                <div data-reveal style={{ "--reveal-delay": "180ms" }}>
                  <a
                    href="https://instagram.com/abstract.sketcher"
                    target="_blank"
                    rel="noreferrer"
                    className="interactive-surface group flex items-center justify-between rounded-xl border border-neutral-border bg-white p-5 transition-all hover:border-primary/40 hover:shadow-md"
                    data-proximity
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex size-12 items-center justify-center rounded-lg bg-primary/20 text-primary">
                        <IconCamera className="size-5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold tracking-widest text-primary uppercase">{labels.instagram}</p>
                        <p className="font-display font-semibold">@abstract.sketcher</p>
                      </div>
                    </div>
                    <IconOpenInNew className="size-5 text-text-muted transition-colors group-hover:text-primary" />
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Contact form */}
          <div className="relative grid gap-6 border-b border-neutral-border/70 py-10 md:grid-cols-12 md:gap-8" data-reveal>
            <h3 className="pointer-events-none absolute top-11 right-1 z-0 hidden max-w-[92%] font-display text-6xl leading-[0.85] font-bold tracking-tight text-text-dark/10 uppercase md:block lg:text-7xl">
              Form
            </h3>

            <div className="md:col-span-4 md:order-2 md:text-right">
              <h3 className="font-display text-4xl leading-[0.88] font-bold tracking-tight uppercase md:hidden">
                Form
              </h3>
            </div>

            <div className="relative md:col-span-8 md:order-1">
              <div className="relative z-10 space-y-3 md:pt-10">
                <div data-reveal style={{ "--reveal-delay": "120ms" }}>
                  <section className="rounded-2xl border border-neutral-border bg-white p-6">
                    <form action="https://formsubmit.co/contact@andrasdenes.com" method="POST" className="space-y-4" noValidate>
                      <input type="hidden" name="_subject" value={labels.subject} />
                      <input type="hidden" name="_template" value="table" />
                      <input type="hidden" name="_captcha" value="false" />
                      <input type="hidden" name="_next" value="https://yellowsky.andrasdenes.com/contact?sent=1" />
                      <input type="text" name="_honey" className="hidden" tabIndex={-1} autoComplete="off" />

                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-text-muted" htmlFor="contact-name">{labels.name}</label>
                          <input
                            id="contact-name"
                            name="name"
                            type="text"
                            placeholder={labels.placeholderName}
                            required
                            title=""
                            className="w-full rounded-lg border border-neutral-border bg-background-light px-4 py-3 text-text-dark placeholder:text-text-muted/50 transition-all focus:ring-2 focus:ring-primary/50 focus:outline-none"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium text-text-muted" htmlFor="contact-email">{labels.emailAddress}</label>
                          <input
                            id="contact-email"
                            name="email"
                            type="email"
                            placeholder={labels.placeholderEmail}
                            required
                            title=""
                            className="w-full rounded-lg border border-neutral-border bg-background-light px-4 py-3 text-text-dark placeholder:text-text-muted/50 transition-all focus:ring-2 focus:ring-primary/50 focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-text-muted" htmlFor="contact-message">{labels.message}</label>
                        <textarea
                          id="contact-message"
                          name="message"
                          rows={4}
                          placeholder={labels.placeholderMessage}
                          required
                          title=""
                          className="w-full resize-none rounded-lg border border-neutral-border bg-background-light px-4 py-3 text-text-dark placeholder:text-text-muted/50 transition-all focus:ring-2 focus:ring-primary/50 focus:outline-none"
                        />
                      </div>

                      <button
                        type="submit"
                        className="interactive-surface w-full cursor-pointer rounded-xl border border-primary/20 bg-primary/10 py-4 font-display font-bold text-text-dark transition-colors hover:bg-primary/20"
                        data-proximity
                      >
                        {labels.send}
                      </button>
                    </form>
                  </section>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <BottomNav active="contact" />
    </div>
  );
}