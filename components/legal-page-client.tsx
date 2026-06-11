"use client";

import Link from "next/link";
import LanguageSwitcher, { useSiteLanguage } from "@/components/language-switcher";
import type { SiteLanguage } from "@/lib/site-language";

type LegalPageClientProps = {
  initialLanguage: SiteLanguage;
};

export default function LegalPageClient({ initialLanguage }: LegalPageClientProps) {
  const { language } = useSiteLanguage(initialLanguage);
  const currentYear = new Date().getFullYear();

  const labels = language === "hu"
    ? {
        title: "Jogi Nyilatkozat & Adatvédelmi Irányelvek",
        lastUpdated: "Utoljára frissítve: 2025. május",
        dataController: "Adatkezelő",
        dataControllerText: "Ez a weboldalt Dénes András Szilveszter egyéni vállalkozó működteti.",
        dataControllerName: "Név:",
        dataControllerAddress: "Székhely:",
        dataControllerTaxId: "Adószám:",
        email: "Email:",
        location: "Helyszín:",
        whatDataTitle: "Milyen adatokat gyűjtök",
        whatDataText: "Csak azokat az információkat gyűjtöm, amelyeket önként megadsz, amikor kapcsolatba lépsz velem vagy vásárolsz:",
        nameEmail: "Név és email cím (kapcsolati űrlapon keresztül)",
        shippingPayment: "Szállítási cím és fizetési információk (webshopon keresztül, harmadik fél által biztonságosan kezelve)",
        howUsedTitle: "Hogyan használom az adataidat",
        howUsedText: "Az adataidat kizárólag a következő célokra használom:",
        respondingInquiries: "Válaszadás a megkereséseidre",
        processingOrders: "Megrendelések teljesítése és feldolgozása",
        orderStatus: "Kommunikáció a megrendelésed állapotáról",
        noSelling: "Nem adom el, nem bérlem ki és nem osztom meg harmadik féllel a személyes adataidat, kivéve, ha ez a megrendelés teljesítéséhez szükséges (pl. szállítási szolgáltatók, fizetési processzorok).",
        cookiesTitle: "Sütik & Analitika",
        cookiesText: "Ez a weboldal minimális analitikát használ a látogatói minták megértéséhez és az oldal fejlesztéséhez. Személyazonosítható információkat nem követek. A böngésződbeállításaidon keresztül letilthatod.",
        gdprTitle: "Jogaid a GDPR szerint",
        gdprText: "Az Általános Adatvédelmi Rendelet (GDPR) alapján a következő jogokkal rendelkezel:",
        rightAccess: "Hozzáférési jog: Kérheted a személyes adataid másolatát",
        rightRectification: "Helyesbítéshez való jog: Pontatlan adatok javítása",
        rightErasure: "Törléshez való jog: Kérheted az adataid törlését",
        rightRestrict: "Feldolgozás korlátozásának joga: Korlátozhatod az adataid használatát",
        rightPortability: "Adathordozhatóság joga: Gép által olvasható formátumban kaphatod meg az adataidat",
        gdprContact: "Ezen jogok érvényesítéséhez lépj kapcsolatba velem:",
        securityTitle: "Adatbiztonság",
        securityText: "Megfelelő intézkedéseket teszek az adataid védelmében, beleértve a biztonságos tárhelyet, titkosított kommunikációt (HTTPS) és a személyes információkhoz való hozzáférés korlátozását. Azonban az interneten történő adatátvitel sosem 100%-ban biztonságos.",
        thirdPartyTitle: "Harmadik Felek",
        thirdPartyText: "Ez a weboldal linkeket tartalmazhat vagy használhat harmadik felek szolgáltatásait (pl. fizetési processzorok, szállítási szolgáltatók). Ezeknek a szolgáltatásoknak saját adatvédelmi irányelveik vannak, amelyeket javasolt elolvasnod.",
        changesTitle: "Változások az Irányelvekben",
        changesText: "Időszakonként frissíthetem ezt az irányelvet. A jelentős változtatások fent lesznek jelölve a frissítés dátumával.",
        contactTitle: "Kapcsolat",
        contactText: "Kérdésekkel kapcsolatban ezen irányelvekről vagy a személyes adataidról, lépj kapcsolatba:",
        backToHome: "← Vissza a Yellowsky oldalra",
      }
    : {
        title: "Legal Notice & Privacy Policy",
        lastUpdated: "Last updated: May 2025",
        dataController: "Data Controller",
        dataControllerText: "This website is operated by Dénes András Szilveszter, sole proprietor (egyéni vállalkozó).",
        dataControllerName: "Name:",
        dataControllerAddress: "Address:",
        dataControllerTaxId: "Tax ID:",
        email: "Email:",
        location: "Location:",
        whatDataTitle: "What Data I Collect",
        whatDataText: "I collect only the information you voluntarily provide when contacting me or making a purchase:",
        nameEmail: "Name and email address (via contact form)",
        shippingPayment: "Shipping address and payment information (via webshop, processed securely by third-party providers)",
        howUsedTitle: "How I Use Your Data",
        howUsedText: "Your information is used solely for:",
        respondingInquiries: "Responding to your inquiries",
        processingOrders: "Processing and fulfilling orders from the webshop",
        orderStatus: "Communicating about your order status",
        noSelling: "I do not sell, rent, or share your personal information with third parties beyond what is necessary to fulfill orders (e.g., shipping providers, payment processors).",
        cookiesTitle: "Cookies & Analytics",
        cookiesText: "This website uses minimal analytics to understand visitor patterns and improve the site. No personally identifiable information is tracked. You may opt out via your browser settings.",
        gdprTitle: "Your Rights Under GDPR",
        gdprText: "Under the General Data Protection Regulation (GDPR), you have the following rights:",
        rightAccess: "Right to access: Request a copy of your personal data",
        rightRectification: "Right to rectification: Correct inaccurate data",
        rightErasure: "Right to erasure: Request deletion of your data",
        rightRestrict: "Right to restrict processing: Limit how your data is used",
        rightPortability: "Right to data portability: Receive your data in a machine-readable format",
        gdprContact: "To exercise these rights, contact me at",
        securityTitle: "Data Security",
        securityText: "I take reasonable measures to protect your data, including secure hosting, encrypted communications (HTTPS), and limiting access to personal information. However, no method of transmission over the Internet is 100% secure.",
        thirdPartyTitle: "Third-Party Services",
        thirdPartyText: "This website may link to or use third-party services (e.g., payment processors, shipping providers). These services have their own privacy policies, and I encourage you to review them.",
        changesTitle: "Changes to This Policy",
        changesText: "I may update this policy periodically. Significant changes will be noted with an updated revision date above.",
        contactTitle: "Contact",
        contactText: "For questions about this policy or your personal data, reach out at",
        backToHome: "← Back to Yellowsky",
      };

  return (
    <div className="flex min-h-screen flex-col bg-background-light text-text-dark">
      <header className="sticky top-0 z-50 border-b border-neutral-border bg-white/80 backdrop-blur-md">
        <div className="flex h-16 w-full items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded-full bg-primary" />
            <h1 className="font-display text-lg font-bold tracking-tight uppercase">{labels.title.split(" | ")[0]}</h1>
          </div>
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

          <section className="space-y-8 text-neutral-700">
            <section>
              <h2 className="font-outfit text-xl font-semibold text-primary mb-3">
                {labels.dataController}
              </h2>
              <p className="leading-relaxed">
                {labels.dataControllerText}
              </p>
              <ul className="mt-3 space-y-1 text-sm">
                <li><strong>{labels.dataControllerName}</strong> Dénes András Szilveszter</li>
                <li><strong>{labels.dataControllerAddress}</strong> 1133 Budapest, Garam u. 23. I./9.</li>
                <li><strong>{labels.dataControllerTaxId}</strong> 90416576-1-41</li>
                <li><strong>{labels.email}</strong> denandras@gmail.com</li>
              </ul>
            </section>

            <section>
              <h2 className="font-outfit text-xl font-semibold text-primary mb-3">
                {labels.whatDataTitle}
              </h2>
              <p className="leading-relaxed">
                {labels.whatDataText}
              </p>
              <ul className="mt-3 list-inside list-disc space-y-1 text-sm">
                <li>{labels.nameEmail}</li>
                <li>{labels.shippingPayment}</li>
              </ul>
            </section>

            <section>
              <h2 className="font-outfit text-xl font-semibold text-primary mb-3">
                {labels.howUsedTitle}
              </h2>
              <p className="leading-relaxed">
                {labels.howUsedText}
              </p>
              <ul className="mt-3 list-inside list-disc space-y-1 text-sm">
                <li>{labels.respondingInquiries}</li>
                <li>{labels.processingOrders}</li>
                <li>{labels.orderStatus}</li>
              </ul>
              <p className="mt-3 leading-relaxed">
                {labels.noSelling}
              </p>
            </section>

            <section>
              <h2 className="font-outfit text-xl font-semibold text-primary mb-3">
                {labels.cookiesTitle}
              </h2>
              <p className="leading-relaxed">
                {labels.cookiesText}
              </p>
            </section>

            <section>
              <h2 className="font-outfit text-xl font-semibold text-primary mb-3">
                {labels.gdprTitle}
              </h2>
              <p className="leading-relaxed">
                {labels.gdprText}
              </p>
              <ul className="mt-3 list-inside list-disc space-y-1 text-sm">
                <li><strong>{labels.rightAccess}</strong></li>
                <li><strong>{labels.rightRectification}</strong></li>
                <li><strong>{labels.rightErasure}</strong></li>
                <li><strong>{labels.rightRestrict}</strong></li>
                <li><strong>{labels.rightPortability}</strong></li>
              </ul>
              <p className="mt-3 leading-relaxed">
                {labels.gdprContact} <a href="mailto:denandras@gmail.com" className="text-primary underline">denandras@gmail.com</a>.
              </p>
            </section>

            <section>
              <h2 className="font-outfit text-xl font-semibold text-primary mb-3">
                {labels.securityTitle}
              </h2>
              <p className="leading-relaxed">
                {labels.securityText}
              </p>
            </section>

            <section>
              <h2 className="font-outfit text-xl font-semibold text-primary mb-3">
                {labels.thirdPartyTitle}
              </h2>
              <p className="leading-relaxed">
                {labels.thirdPartyText}
              </p>
            </section>

            <section>
              <h2 className="font-outfit text-xl font-semibold text-primary mb-3">
                {labels.changesTitle}
              </h2>
              <p className="leading-relaxed">
                {labels.changesText}
              </p>
            </section>

            <section>
              <h2 className="font-outfit text-xl font-semibold text-primary mb-3">
                {labels.contactTitle}
              </h2>
              <p className="leading-relaxed">
                {labels.contactText} <a href="mailto:denandras@gmail.com" className="text-primary underline">denandras@gmail.com</a>.
              </p>
            </section>
          </section>

          <footer className="mt-12 pt-8 border-t border-neutral-200">
            <Link href="/" className="text-sm text-neutral-400 hover:text-primary transition-colors">
              {labels.backToHome}
            </Link>
          </footer>
        </article>
      </main>
    </div>
  );
}