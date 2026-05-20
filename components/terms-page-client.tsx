"use client";

import Link from "next/link";
import LanguageSwitcher, { useSiteLanguage } from "@/components/language-switcher";
import type { SiteLanguage } from "@/lib/site-language";

type TermsPageClientProps = {
  initialLanguage: SiteLanguage;
};

export default function TermsPageClient({ initialLanguage }: TermsPageClientProps) {
  const { language } = useSiteLanguage(initialLanguage);

  const labels = language === "hu"
    ? {
        title: "Általános Szerződési Feltételek",
        lastUpdated: "Utolsó frissítés: 2026. május",
        intro: "A Yellowsky webshopban történő vásárlással elfogadod ezeket az általános szerződési feltételeket. Kérjük, figyelmesen olvasd el.",
        parties: {
          title: "1. Szerződő felek",
          seller: "Eladó:",
          sellerName: "András Dénes független művész",
          sellerAddress: "Budapest, Magyarország",
          sellerEmail: "denandras@gmail.com",
          buyer: "Vevő:",
          buyerText: "A vásárló, aki a webshopban rendelést helyez el.",
        },
        products: {
          title: "2. Termékek",
          text: "A webshopban giclée minőségű művészeti nyomatok kaphatók. A termékek a megrendeléskor megadott méretben és anyagban készülnek. A képek a weboldalon tájékoztató jellegűek; a tényleges színek eltérhetnek a képernyő beállításaitól függően.",
        },
        ordering: {
          title: "3. Megrendelés",
          steps: [
            "Válaszd ki a kívánt nyomatot és méretet",
            "Add hozzá a kosárhoz",
            "Add meg a szállítási adatokat",
            "Fizess Stripe-on keresztül (biztonságos fizetés)",
            "Erősítést kapsz emailben",
          ],
          contract: "A szerződés a sikeres fizetés után jön létre.",
        },
        pricing: {
          title: "4. Árak és fizetés",
          text: "Az árak magyar forintban (HUF) vagy euróban (EUR) vannak megadva, az árfolyamoktól függően. Az árak tartalmazzák az általános forgalmi adót (ÁFA). A fizetés a Stripe biztonságos fizetési rendszerén keresztül történik.",
          cards: "Elfogadott fizetési módok: Visa, Mastercard, American Express, és más bankkártyák.",
          currency: "A fizetés a kiválasztott pénznemben történik.",
        },
        shipping: {
          title: "5. Szállítás",
          worldwide: "Ingyenes szállítás világszerte.",
          timeframe: "Várható szállítási idő: 7-14 munkanap (véglegesítés és nyomtatás után).",
          tracking: "A megrendelés állapotáról emailben értesítünk.",
          damage: "Ha a csomag sérülten érkezik, kérjük, fotózd le és értesíts minket 48 órán belül.",
        },
        returns: {
          title: "6. Elállási és visszáru jog",
          eu: "Az Európai Unió fogyasztóvédelmi törvényei szerint 14 napon belül elállhatsz a szerződéstől.",
          conditions: [
            "A terméket eredeti, sértetlen állapotban kell visszaadni",
            "A visszáru költségét a vevő viseli",
            "A vételárat a termék visszaérkezése után 14 napon belül visszatérítjük",
          ],
          exceptions: "A következő esetekben nincs elállási jog:",
          exceptionList: [
            "Egyedi, személyre szabott termékek",
            "Zárt csomagolású hang-, videó- vagy szoftvertermékek, ha a csomagolást felbontottad",
          ],
        },
        warranty: {
          title: "7. Garancia és minőség",
          text: "Minden nyomatot giclée minőségben, archív papíron készítünk. A nyomatok megfelelő tárolás mellett évtizedekig megőrzik színüket és minőségüket.",
          defects: "Gyártási hiba esetén kérjük, értesíts minket és küldd vissza a terméket. A hibás terméket ingyen kicseréljük vagy visszatérítjük az árát.",
        },
        intellectual: {
          title: "8. Szellemi tulajdon",
          text: "A weboldalon és a termékeken található valamennyi művészet, fotó, szöveg és design András Dénes szellemi tulajdona. A vásárlás nem ad jogot a művek másolására, terjesztésére vagy kereskedelmi célú felhasználására.",
        },
        liability: {
          title: "9. Felelősség korlátozása",
          text: "Az eladó felelőssége korlátozott a szándékos vagy súlyos gondatlanságból eredő károkra. Az eladó nem felel azokért a károkért, amelyek a termék rendeltetésszerű használatából erednek.",
        },
        governing: {
          title: "10. Alkalmazandó jog és joghatóság",
          text: "Ezekre a feltételekre a magyar jog vonatkozik. Vitás esetekben a magyar bíróságok hatáskörrel rendelkeznek, kivéve, ha a vonatkozó jogszabályok másként rendelkezik.",
          eu: "Az Európai Bizottság online vitarendezési platformja elérhető: https://ec.europa.eu/consumers/odr/",
        },
        changes: {
          title: "11. Módosítások",
          text: "Az eladó fenntartja a jogot ezeknek a feltételeknek a módosítására. A módosítások a weboldalon történő közzététel lépnek hatályba. A vásárláskor érvényben lévő feltételek vonatkoznak a megrendelésre.",
        },
        contact: {
          title: "12. Kapcsolat",
          text: "Kérdésekkel kapcsolatban lépj kapcsolatba:",
          email: "denandras@gmail.com",
          response: "Válaszolunk 48 órán belül.",
        },
        backToHome: "← Vissza a főoldalra",
        privacy: "Adatvédelmi Irányelvek",
      }
    : {
        title: "Terms of Service",
        lastUpdated: "Last updated: May 2026",
        intro: "By purchasing from the Yellowsky webshop, you agree to these terms and conditions. Please read them carefully.",
        parties: {
          title: "1. Parties",
          seller: "Seller:",
          sellerName: "András Dénes, independent artist",
          sellerAddress: "Budapest, Hungary",
          sellerEmail: "denandras@gmail.com",
          buyer: "Buyer:",
          buyerText: "The customer placing an order through the webshop.",
        },
        products: {
          title: "2. Products",
          text: "The webshop offers giclée quality art prints. Products are made to order in the specified size and material. Images on the website are illustrative; actual colors may vary depending on screen settings.",
        },
        ordering: {
          title: "3. Ordering",
          steps: [
            "Select the desired print and size",
            "Add to cart",
            "Provide shipping information",
            "Pay via Stripe (secure payment)",
            "Receive confirmation email",
          ],
          contract: "The contract is formed after successful payment.",
        },
        pricing: {
          title: "4. Pricing & Payment",
          text: "Prices are displayed in Hungarian Forint (HUF) or Euros (EUR) depending on exchange rates. Prices include VAT. Payment is processed securely through Stripe.",
          cards: "Accepted payment methods: Visa, Mastercard, American Express, and other major cards.",
          currency: "Payment is made in the selected currency.",
        },
        shipping: {
          title: "5. Shipping",
          worldwide: "Free worldwide shipping.",
          timeframe: "Estimated delivery: 7-14 business days (after finalization and printing).",
          tracking: "You will receive email updates on your order status.",
          damage: "If your package arrives damaged, please photograph it and notify us within 48 hours.",
        },
        returns: {
          title: "6. Returns & Cancellations",
          eu: "Under EU consumer protection laws, you have 14 days to withdraw from the contract.",
          conditions: [
            "The product must be returned in its original, undamaged condition",
            "Return shipping costs are borne by the buyer",
            "Refunds are processed within 14 days of receiving the returned item",
          ],
          exceptions: "No right of withdrawal exists for:",
          exceptionList: [
            "Custom, personalized products",
            "Sealed audio, video, or software products if the seal is broken",
          ],
        },
        warranty: {
          title: "7. Warranty & Quality",
          text: "All prints are made in giclée quality on archival paper. With proper storage, prints retain their color and quality for decades.",
          defects: "In case of manufacturing defects, please contact us and return the item. Defective products will be replaced free of charge or refunded.",
        },
        intellectual: {
          title: "8. Intellectual Property",
          text: "All artwork, photos, text, and design on the website and products are the intellectual property of András Dénes. Purchase does not grant rights to copy, distribute, or commercially use the works.",
        },
        liability: {
          title: "9. Limitation of Liability",
          text: "The seller's liability is limited to damages arising from intent or gross negligence. The seller is not liable for damages resulting from proper use of the product.",
        },
        governing: {
          title: "10. Governing Law & Jurisdiction",
          text: "These terms are governed by Hungarian law. Disputes are subject to the jurisdiction of Hungarian courts, unless applicable law provides otherwise.",
          eu: "The European Commission's online dispute resolution platform is available at: https://ec.europa.eu/consumers/odr/",
        },
        changes: {
          title: "11. Changes",
          text: "The seller reserves the right to modify these terms. Changes take effect upon publication on the website. The terms in effect at the time of purchase apply to the order.",
        },
        contact: {
          title: "12. Contact",
          text: "For questions, contact:",
          email: "denandras@gmail.com",
          response: "We respond within 48 hours.",
        },
        backToHome: "← Back to Home",
        privacy: "Privacy Policy",
      };

  return (
    <div className="flex min-h-screen flex-col bg-background-light text-text-dark">
      <header className="sticky top-0 z-50 border-b border-neutral-border bg-white/80 backdrop-blur-md">
        <div className="flex h-16 w-full items-center justify-between px-6">
          <Link href="/" className="font-display text-lg font-bold tracking-tight uppercase hover:opacity-80 transition-opacity">
            {labels.title.split(" | ")[0]}
          </Link>
          <LanguageSwitcher initialLanguage={initialLanguage} />
        </div>
      </header>

      <main className="flex-1 px-6 py-12 pb-24">
        <article className="mx-auto max-w-2xl">
          <header className="mb-12">
            <h1 className="font-outfit text-3xl font-semibold text-primary">
              {labels.title}
            </h1>
            <p className="mt-2 text-sm text-neutral-400">
              {labels.lastUpdated}
            </p>
          </header>

          <section className="space-y-10 text-neutral-700">
            <p className="leading-relaxed">{labels.intro}</p>

            <section>
              <h2 className="font-outfit text-xl font-semibold text-primary mb-3">
                {labels.parties.title}
              </h2>
              <div className="space-y-2 text-sm">
                <p><strong>{labels.parties.seller}</strong> {labels.parties.sellerName}</p>
                <p>{labels.parties.sellerAddress}</p>
                <p>{labels.parties.sellerEmail}</p>
                <p className="mt-3"><strong>{labels.parties.buyer}</strong> {labels.parties.buyerText}</p>
              </div>
            </section>

            <section>
              <h2 className="font-outfit text-xl font-semibold text-primary mb-3">
                {labels.products.title}
              </h2>
              <p className="leading-relaxed">{labels.products.text}</p>
            </section>

            <section>
              <h2 className="font-outfit text-xl font-semibold text-primary mb-3">
                {labels.ordering.title}
              </h2>
              <ol className="list-inside list-decimal space-y-1 text-sm">
                {labels.ordering.steps.map((step, i) => <li key={i}>{step}</li>)}
              </ol>
              <p className="mt-3 leading-relaxed">{labels.ordering.contract}</p>
            </section>

            <section>
              <h2 className="font-outfit text-xl font-semibold text-primary mb-3">
                {labels.pricing.title}
              </h2>
              <p className="leading-relaxed">{labels.pricing.text}</p>
              <p className="mt-2 text-sm">{labels.pricing.cards}</p>
            </section>

            <section>
              <h2 className="font-outfit text-xl font-semibold text-primary mb-3">
                {labels.shipping.title}
              </h2>
              <p className="leading-relaxed mb-2"><strong>{labels.shipping.worldwide}</strong></p>
              <p className="leading-relaxed">{labels.shipping.timeframe}</p>
              <p className="mt-2 text-sm">{labels.shipping.tracking}</p>
              <p className="mt-2 text-sm">{labels.shipping.damage}</p>
            </section>

            <section>
              <h2 className="font-outfit text-xl font-semibold text-primary mb-3">
                {labels.returns.title}
              </h2>
              <p className="leading-relaxed mb-2">{labels.returns.eu}</p>
              <ul className="list-inside list-disc space-y-1 text-sm mb-3">
                {labels.returns.conditions.map((item, i) => <li key={i}>{item}</li>)}
              </ul>
              <p className="font-medium mb-1">{labels.returns.exceptions}</p>
              <ul className="list-inside list-disc space-y-1 text-sm">
                {labels.returns.exceptionList.map((item, i) => <li key={i}>{item}</li>)}
              </ul>
            </section>

            <section>
              <h2 className="font-outfit text-xl font-semibold text-primary mb-3">
                {labels.warranty.title}
              </h2>
              <p className="leading-relaxed">{labels.warranty.text}</p>
              <p className="mt-2 leading-relaxed">{labels.warranty.defects}</p>
            </section>

            <section>
              <h2 className="font-outfit text-xl font-semibold text-primary mb-3">
                {labels.intellectual.title}
              </h2>
              <p className="leading-relaxed">{labels.intellectual.text}</p>
            </section>

            <section>
              <h2 className="font-outfit text-xl font-semibold text-primary mb-3">
                {labels.liability.title}
              </h2>
              <p className="leading-relaxed">{labels.liability.text}</p>
            </section>

            <section>
              <h2 className="font-outfit text-xl font-semibold text-primary mb-3">
                {labels.governing.title}
              </h2>
              <p className="leading-relaxed">{labels.governing.text}</p>
              <p className="mt-2 text-sm">{labels.governing.eu}</p>
            </section>

            <section>
              <h2 className="font-outfit text-xl font-semibold text-primary mb-3">
                {labels.changes.title}
              </h2>
              <p className="leading-relaxed">{labels.changes.text}</p>
            </section>

            <section>
              <h2 className="font-outfit text-xl font-semibold text-primary mb-3">
                {labels.contact.title}
              </h2>
              <p className="leading-relaxed mb-2">{labels.contact.text}</p>
              <p className="text-sm"><strong>Email:</strong> {labels.contact.email}</p>
              <p className="text-sm">{labels.contact.response}</p>
            </section>
          </section>

          <footer className="mt-12 pt-8 border-t border-neutral-200 flex items-center justify-between">
            <Link href="/" className="text-sm text-neutral-400 hover:text-primary transition-colors">
              {labels.backToHome}
            </Link>
            <Link href="/privacy" className="text-sm text-primary underline hover:opacity-80 transition-opacity">
              {labels.privacy}
            </Link>
          </footer>
        </article>
      </main>
    </div>
  );
}