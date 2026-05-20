"use client";

import Link from "next/link";
import LanguageSwitcher, { useSiteLanguage } from "@/components/language-switcher";
import type { SiteLanguage } from "@/lib/site-language";

type PrivacyPageClientProps = {
  initialLanguage: SiteLanguage;
};

export default function PrivacyPageClient({ initialLanguage }: PrivacyPageClientProps) {
  const { language } = useSiteLanguage(initialLanguage);

  const labels = language === "hu"
    ? {
        title: "Adatvédelmi Irányelvek",
        lastUpdated: "Utolsó frissítés: 2026. május",
        intro: "Ez az adatvédelmi irányelv elmagyarázza, hogyan gyűjtöm és használom a személyes adataidat a Yellowsky weboldalon.",
        controller: {
          title: "1. Adatkezelő",
          text: "Ez a weboldalt Dénes András, Budapesten élő független művész működteti.",
          contact: "Kapcsolat:",
        },
        data: {
          title: "2. Milyen adatokat gyűjtök",
          collected: [
            "Név és email cím – amikor kapcsolatfelvételi űrlapot küldesz be",
            "Szállítási cím – amikor rendelést helyezel el a webshopban",
            "Fizetési információk – a rendelés teljesítéséhez (közvetlenül nem tárolom, lásd a harmadik felek részt)",
            "Böngészési adatok – anonim analitikai adatok a weboldal használatáról",
          ],
          notCollected: [
            "Jelszavak vagy bejelentkezési adatok (nincs felhasználói fiók rendszer)",
            "Érzékeny személyes adatok (egészség, vallás, politikai nézetek stb.)",
            "Fizetési kártya adatok (ezeket a Stripe kezeli, nem én)",
          ],
        },
        legalBasis: {
          title: "3. Jogi alap adataid kezeléséhez",
          text: "A GDPR 6. cikke szerint az adataidat a következő jogi alapokon kezelem:",
          items: [
            "Szerződés teljesítése – a megrendelésed teljesítéséhez szükséges adatok (név, email, szállítási cím)",
            "Jogos érdek – a weboldal működtetése, biztonsága és fejlesztése",
            "Hozzájárulás – amikor önként kapcsolatba lépsz velem",
          ],
        },
        purpose: {
          title: "4. Hogyan használom az adataidat",
          items: [
            "Megrendelések feldolgozása és teljesítése",
            "Kapcsolatfelvételi kérelmek megválaszolása",
            "Rendelés állapotáról történő tájékoztatás",
            "Weboldal teljesítményének elemzése és fejlesztése",
            "Jogi kötelezettségek teljesítése",
          ],
        },
        retention: {
          title: "5. Adatmegőrzés",
          text: "Az adataidat csak addig őrizzük meg, ameddig szükséges:",
          items: [
            "Rendelési adatok: 5 év a számviteli előírások szerint",
            "Kapcsolatfelvételi üzenetek: 1 év",
            "Analitikai adatok: 2 év",
            "Megrendelések: a rendelés teljesítése után törlésre kerülnek",
          ],
        },
        thirdParty: {
          title: "6. Harmadik felek és adattovábbítás",
          text: "Néhány szolgáltatást harmadik felek biztosítanak, akik saját adatvédelmi irányelvekkel rendelkeznek:",
          services: [
            { name: "Stripe", purpose: "Fizetés feldolgozása", policy: "https://stripe.com/privacy" },
            { name: "Vercel", purpose: "Weboldal tárhely", policy: "https://vercel.com/legal/privacy-policy" },
            { name: "Cloudflare", purpose: "CDN és biztonság", policy: "https://www.cloudflare.com/privacypolicy/" },
          ],
          note: "Nem adom el, bérlem ki vagy osztom meg a személyes adataidat harmadik felekkel, kivéve a fent említett szolgáltatásokat a rendelés teljesítéséhez.",
        },
        rights: {
          title: "7. GDPR jogaid",
          text: "Az Általános Adatvédelmi Rendelet alapján a következő jogokkal rendelkezel:",
          items: [
            "Hozzáférési jog – másolatot kérhetsz a személyes adataidról",
            "Helyesbítési jog – kérheted pontatlan adatok javítását",
            "Törlési jog – kérheted az adataid törlését („elfelejtéshez való jog”)",
            "Feldolgozás korlátozásának joga – korlátozhatod az adataid használatát",
            "Adathordozhatóság joga – gép által olvasható formátumban kaphatod meg az adataidat",
            "Hozzájárulás visszavonása – bármikor visszavonhatod hozzájárulásodat",
            "Panasztétel – panaszt tehetek a magyar Nemzeti Adatvédelmi és Információszabadság Hatóságnál (NAIH)",
          ],
          contact: "Ezen jogok érvényesítéséhez lépj kapcsolatba velem:",
          authority: "NAIH elérhetőség: 1055 Budapest, Falk Miksa utca 9-11., https://www.naih.hu",
        },
        security: {
          title: "8. Adatbiztonság",
          text: "Megfelelő intézkedéseket teszek az adataid védelmében:",
          items: [
            "HTTPS titkosítás minden kapcsolaton",
            "Biztonságos tárhely és infrastruktúra",
            "Hozzáférés korlátozása a személyes adatokhoz",
            "Rendszeres biztonsági frissítések",
          ],
          disclaimer: "Azonban az interneten keresztüli adatátvitel sosem 100%-ban biztonságos.",
        },
        cookies: {
          title: "9. Sütik (Cookies)",
          text: "Ez a weboldal minimális sütiket használ:",
          items: [
            "Munkamenet sütik – a nyelvi beállítások megőrzéséhez",
            "Analitikai sütik – anonim statisztikákhoz (letiltható)",
          ],
          control: "A böngésző beállításaiban letilthatod a sütiket, de ez korlátozhatja a weboldal funkcionalitását.",
        },
        changes: {
          title: "10. Változások",
          text: "Időszakonként frissíthetem ezt az irányelvet. A jelentős változtatások fent lesznek jelölve a frissítés dátumával. Javasolt rendszeresen áttekinteni ezt az oldalt.",
        },
        contact: {
          title: "11. Kapcsolat",
          text: "Kérdésekkel kapcsolatban ezen irányelvekről vagy a személyes adataidról, lépj kapcsolatba:",
          email: "contact@andrasdenes.com",
          location: "Budapest, Hungary",
        },
        backToHome: "← Vissza a főoldalra",
        terms: "Általános Szerződési Feltételek",
      }
    : {
        title: "Privacy Policy",
        lastUpdated: "Last updated: May 2026",
        intro: "This privacy policy explains how I collect and use your personal data on the Yellowsky website.",
        controller: {
          title: "1. Data Controller",
          text: "This website is operated by András Dénes, an independent artist based in Budapest, Hungary.",
          contact: "Contact:",
        },
        data: {
          title: "2. What Data I Collect",
          collected: [
            "Name and email address – when you submit the contact form",
            "Shipping address – when you place an order in the webshop",
            "Payment information – to fulfill your order (I don't store this directly, see third-party services)",
            "Browsing data – anonymous analytics about website usage",
          ],
          notCollected: [
            "Passwords or login credentials (no user account system)",
            "Sensitive personal data (health, religion, political views, etc.)",
            "Payment card details (handled by Stripe, not me)",
          ],
        },
        legalBasis: {
          title: "3. Legal Basis for Processing",
          text: "Under GDPR Article 6, I process your data based on the following legal grounds:",
          items: [
            "Contract performance – data necessary to fulfill your order (name, email, shipping address)",
            "Legitimate interest – operating and improving the website, security",
            "Consent – when you voluntarily contact me",
          ],
        },
        purpose: {
          title: "4. How I Use Your Data",
          items: [
            "Processing and fulfilling your orders",
            "Responding to your contact inquiries",
            "Communicating about your order status",
            "Analyzing and improving website performance",
            "Complying with legal obligations",
          ],
        },
        retention: {
          title: "5. Data Retention",
          text: "I keep your data only as long as necessary:",
          items: [
            "Order data: 5 years per accounting regulations",
            "Contact form submissions: 1 year",
            "Analytics data: 2 years",
            "After order fulfillment: deleted",
          ],
        },
        thirdParty: {
          title: "6. Third-Party Services & Data Transfers",
          text: "Some services are provided by third parties who have their own privacy policies:",
          services: [
            { name: "Stripe", purpose: "Payment processing", policy: "https://stripe.com/privacy" },
            { name: "Vercel", purpose: "Website hosting", policy: "https://vercel.com/legal/privacy-policy" },
            { name: "Cloudflare", purpose: "CDN and security", policy: "https://www.cloudflare.com/privacypolicy/" },
          ],
          note: "I do not sell, rent, or share your personal data with third parties beyond these services necessary for order fulfillment.",
        },
        rights: {
          title: "7. Your GDPR Rights",
          text: "Under the General Data Protection Regulation, you have the following rights:",
          items: [
            "Right of access – request a copy of your personal data",
            "Right to rectification – correct inaccurate data",
            "Right to erasure – request deletion of your data (\"right to be forgotten\")",
            "Right to restrict processing – limit how your data is used",
            "Right to data portability – receive your data in a machine-readable format",
            "Right to withdraw consent – withdraw your consent at any time",
            "Right to complain – lodge a complaint with the Hungarian National Authority for Data Protection and Freedom of Information (NAIH)",
          ],
          contact: "To exercise these rights, contact me:",
          authority: "NAIH contact: 1055 Budapest, Falk Miksa utca 9-11., https://www.naih.hu",
        },
        security: {
          title: "8. Data Security",
          text: "I take appropriate measures to protect your data:",
          items: [
            "HTTPS encryption on all connections",
            "Secure hosting and infrastructure",
            "Limited access to personal data",
            "Regular security updates",
          ],
          disclaimer: "However, no method of transmission over the Internet is 100% secure.",
        },
        cookies: {
          title: "9. Cookies",
          text: "This website uses minimal cookies:",
          items: [
            "Session cookies – to remember your language preferences",
            "Analytics cookies – for anonymous statistics (can be disabled)",
          ],
          control: "You can disable cookies in your browser settings, but this may limit website functionality.",
        },
        changes: {
          title: "10. Changes to This Policy",
          text: "I may update this policy periodically. Significant changes will be noted with an updated revision date above. I recommend reviewing this page regularly.",
        },
        contact: {
          title: "11. Contact",
          text: "For questions about this policy or your personal data, contact:",
          email: "contact@andrasdenes.com",
          location: "Budapest, Hungary",
        },
        backToHome: "← Back to Home",
        terms: "Terms of Service",
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
                {labels.controller.title}
              </h2>
              <p className="leading-relaxed">{labels.controller.text}</p>
              <p className="mt-2 text-sm"><strong>{labels.controller.contact}</strong> {labels.contact.email}</p>
            </section>

            <section>
              <h2 className="font-outfit text-xl font-semibold text-primary mb-3">
                {labels.data.title}
              </h2>
              <p className="font-medium mb-2">{language === "hu" ? "Gyűjtött adatok:" : "Data collected:"}</p>
              <ul className="list-inside list-disc space-y-1 text-sm mb-4">
                {labels.data.collected.map((item, i) => <li key={i}>{item}</li>)}
              </ul>
              <p className="font-medium mb-2">{language === "hu" ? "Nem gyűjtött adatok:" : "Data not collected:"}</p>
              <ul className="list-inside list-disc space-y-1 text-sm">
                {labels.data.notCollected.map((item, i) => <li key={i}>{item}</li>)}
              </ul>
            </section>

            <section>
              <h2 className="font-outfit text-xl font-semibold text-primary mb-3">
                {labels.legalBasis.title}
              </h2>
              <p className="leading-relaxed mb-2">{labels.legalBasis.text}</p>
              <ul className="list-inside list-disc space-y-1 text-sm">
                {labels.legalBasis.items.map((item, i) => <li key={i}>{item}</li>)}
              </ul>
            </section>

            <section>
              <h2 className="font-outfit text-xl font-semibold text-primary mb-3">
                {labels.purpose.title}
              </h2>
              <ul className="list-inside list-disc space-y-1 text-sm">
                {labels.purpose.items.map((item, i) => <li key={i}>{item}</li>)}
              </ul>
            </section>

            <section>
              <h2 className="font-outfit text-xl font-semibold text-primary mb-3">
                {labels.retention.title}
              </h2>
              <p className="leading-relaxed mb-2">{labels.retention.text}</p>
              <ul className="list-inside list-disc space-y-1 text-sm">
                {labels.retention.items.map((item, i) => <li key={i}>{item}</li>)}
              </ul>
            </section>

            <section>
              <h2 className="font-outfit text-xl font-semibold text-primary mb-3">
                {labels.thirdParty.title}
              </h2>
              <p className="leading-relaxed mb-3">{labels.thirdParty.text}</p>
              <div className="space-y-2 text-sm">
                {labels.thirdParty.services.map((service, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <strong className="text-primary">{service.name}:</strong>
                    <span>{service.purpose} – </span>
                    <a href={service.policy} target="_blank" rel="noopener noreferrer" className="text-primary underline hover:opacity-80">
                      {language === "hu" ? "Adatvédelmi irányelv" : "Privacy Policy"}
                    </a>
                  </div>
                ))}
              </div>
              <p className="mt-3 leading-relaxed text-sm">{labels.thirdParty.note}</p>
            </section>

            <section>
              <h2 className="font-outfit text-xl font-semibold text-primary mb-3">
                {labels.rights.title}
              </h2>
              <p className="leading-relaxed mb-2">{labels.rights.text}</p>
              <ul className="list-inside list-disc space-y-1 text-sm">
                {labels.rights.items.map((item, i) => <li key={i}>{item}</li>)}
              </ul>
              <p className="mt-3 leading-relaxed">
                {labels.rights.contact} <a href="mailto:denandras@gmail.com" className="text-primary underline">denandras@gmail.com</a>
              </p>
              <p className="mt-2 text-sm text-neutral-500">{labels.rights.authority}</p>
            </section>

            <section>
              <h2 className="font-outfit text-xl font-semibold text-primary mb-3">
                {labels.security.title}
              </h2>
              <p className="leading-relaxed mb-2">{labels.security.text}</p>
              <ul className="list-inside list-disc space-y-1 text-sm">
                {labels.security.items.map((item, i) => <li key={i}>{item}</li>)}
              </ul>
              <p className="mt-3 leading-relaxed text-sm">{labels.security.disclaimer}</p>
            </section>

            <section>
              <h2 className="font-outfit text-xl font-semibold text-primary mb-3">
                {labels.cookies.title}
              </h2>
              <p className="leading-relaxed mb-2">{labels.cookies.text}</p>
              <ul className="list-inside list-disc space-y-1 text-sm">
                {labels.cookies.items.map((item, i) => <li key={i}>{item}</li>)}
              </ul>
              <p className="mt-3 leading-relaxed text-sm">{labels.cookies.control}</p>
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
              <ul className="space-y-1 text-sm">
                <li><strong>Email:</strong> {labels.contact.email}</li>
                <li><strong>{language === "hu" ? "Helyszín" : "Location"}:</strong> {labels.contact.location}</li>
              </ul>
            </section>
          </section>

          <footer className="mt-12 pt-8 border-t border-neutral-200 flex items-center justify-between">
            <Link href="/" className="text-sm text-neutral-400 hover:text-primary transition-colors">
              {labels.backToHome}
            </Link>
            <Link href="/terms" className="text-sm text-primary underline hover:opacity-80 transition-opacity">
              {labels.terms}
            </Link>
          </footer>
        </article>
      </main>
    </div>
  );
}