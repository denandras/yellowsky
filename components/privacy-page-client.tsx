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
        title: "Adatvédelmi Tájékoztató",
        lastUpdated: "Hatályos: 2026. május 20-tól",
        intro: "Jelen Adatvédelmi Tájékoztató (a továbbiakban: Tájékoztató) a yellowsky.cc weboldal (a továbbiakban: Weboldal) látogatói és a Webáruház vásárlói személyes adatainak kezelésére vonatkozik. A Tájékoztató megfelel az Európai Parlament és a Tanács 2016/679. rendeletének (Általános Adatvédelmi Rendelet, GDPR) és a magyar adatvédelmi jogszabályoknak.",
        controller: {
          title: "I. Adatkezelő",
          text: "A Weboldalt és a Webáruházat Dénes András magánszemély, független művész üzemelteti (a továbbiakban: Adatkezelő).",
          contact: "Elérhetőség:",
          email: "contact@andrasdenes.com",
          location: "Budapest, Magyarország",
        },
        data: {
          title: "II. A kezelt személyes adatok köre",
          intro: "Az Adatkezelő a következő személyes adatokat kezeli:",
          collected: [
            "Név, e-mail cím és telefonszám – kapcsolatfelvételi űrlap beküldésekor",
            "Név, e-mail cím, számlázási cím és szállítási cím – a Webáruházban történő vásárláskor",
            "IP-cím, böngésző típusa – a Weboldal látogatásakor (automatikusan generált adatok)",
          ],
          notCollected: [
            "Fizetési kártya adatok – ezeket a Stripe fizetési szolgáltató kezeli",
            "Jelszavak – nincs felhasználói fiók rendszer",
            "Érzékeny személyes adatok – egészségi állapot, vallási meggyőződés, politikai nézetek stb.",
          ],
        },
        legalBasis: {
          title: "III. Az adatkezelés jogalapja",
          text: "Az Adatkezelő a GDPR 6. cikke szerint az alábbi jogalapokon kezeli a személyes adatokat:",
          items: [
            "a) szerződés teljesítése (GDPR 6. cikk (1) bekezdés b) pont) – a megrendelés teljesítéséhez szükséges adatok",
            "b) jogos érdek (GDPR 6. cikk (1) bekezdés f) pont) – a Weboldal működtetése, biztonsága és fejlesztése",
            "c) hozzájárulás (GDPR 6. cikk (1) bekezdés a) pont) – önkéntes kapcsolatfelvétel esetén",
          ],
        },
        purpose: {
          title: "IV. Az adatkezelés célja",
          items: [
            "Megrendelések feldolgozása és teljesítése",
            "Számla kiállítása a számviteli előírásoknak megfelelően",
            "Kapcsolatfelvételi kérelmek megválaszolása",
            "Weboldal biztonságának fenntartása",
            "Weboldal teljesítményének elemzése és fejlesztése",
            "Jogi kötelezettségek teljesítése",
          ],
        },
        retention: {
          title: "V. Az adatok tárolásának időtartama",
          text: "Az Adatkezelő a személyes adatokat csak a szükséges ideig tárolja:",
          items: [
            "Rendelési adatok: 5 év a számviteli törvény (2000. évi C. törvény) szerint",
            "Kapcsolatfelvételi üzenetek: 1 év a megválaszolást követően",
            "Weboldal naplók: 30 nap",
            "Analitikai adatok: 2 év",
          ],
          deletion: "Az adatkezelési cél megvalósulását követően az Adatkezelő törli az adatokat.",
        },
        thirdParty: {
          title: "VI. Adattovábbítás és harmadik felek",
          text: "Az Adatkezelő a következő harmadik feleknek továbbíthatja a személyes adatokat:",
          services: [
            { name: "Stripe Inc.", purpose: "Fizetés feldolgozása", location: "Amerikai Egyesült Államok (EU-EGP adatátviteli megállapodás alapján)", policy: "https://stripe.com/privacy" },
            { name: "Vercel Inc.", purpose: "Weboldal tárhelyszolgáltatás", location: "Amerikai Egyesült Államok", policy: "https://vercel.com/legal/privacy-policy" },
            { name: "Cloudflare Inc.", purpose: "CDN és biztonsági szolgáltatások", location: "Amerikai Egyesült Államok", policy: "https://www.cloudflare.com/privacypolicy/" },
          ],
          note: "Az Adatkezelő nem adja át, adja el vagy bérli ki a személyes adatokat más harmadik félnek, kivéve a fent említett szolgáltatókat a szolgáltatás nyújtása érdekében.",
        },
        rights: {
          title: "VII. Az érintett jogai",
          text: "A GDPR alapján az érintett (a személyes adatok tulajdonosa) az alábbi jogokkal rendelkezik:",
          items: [
            "Hozzáférési jog (GDPR 15. cikk) – tájékoztatást kérhet a kezelt adatokról",
            "Helyesbítési jog (GDPR 16. cikk) – kérheti pontatlan adatok javítását",
            "Törlési jog (GDPR 17. cikk) – kérheti az adatok törlését („elfelejtéshez való jog”)",
            "Feldolgozás korlátozásának joga (GDPR 18. cikk)",
            "Adathordozhatóság joga (GDPR 20. cikk) – gép által olvasható formátumban kaphatja meg az adatait",
            "Hozzájárulás visszavonásának joga – bármikor visszavonhatja hozzájárulását",
            "Tiltakozási jog (GDPR 21. cikk) – tiltakozhat az adatkezelés ellen",
          ],
          complaint: "Panasztétel joga:",
          authority: "Az érintett panaszt tehet a Nemzeti Adatvédelmi és Információszabadság Hatóságnál (NAIH):",
          authorityAddress: "1363 Budapest, Pf. 9. | Tel: +36-1-391-1400 | E-mail: ugyfelszolgalat@naih.hu | Web: www.naih.hu",
        },
        security: {
          title: "VIII. Adatbiztonság",
          text: "Az Adatkezelő megfelelő technikai és szervezési intézkedéseket tesz a személyes adatok védelme érdekében:",
          items: [
            "HTTPS titkosítás minden kapcsolaton",
            "Biztonságos tárhelyszolgáltató (Vercel)",
            "Hozzáférés korlátozása a személyes adatokhoz",
            "Rendszeres biztonsági frissítések",
          ],
          disclaimer: "Azonban az interneten keresztüli adatátvitel sosem garantálható 100%-os biztonsággal.",
        },
        cookies: {
          title: "IX. Sütik (Cookies)",
          text: "A Weboldal sütiket használ a következő célokra:",
          items: [
            "Munkamenet sütik – a nyelvi beállítások megőrzéséhez",
            "Analitikai sütik – anonim statisztikákhoz (letiltható)",
          ],
          control: "A böngésző beállításaiban letilthatja a sütiket, de ez korlátozhatja a Weboldal funkcionalitását.",
          more: "Részletes információ a sütikről a böngésző súgójában található.",
        },
        changes: {
          title: "X. A Tájékoztató módosítása",
          text: "Az Adatkezeló fenntartja a jogot jelen Tájékoztató módosítására. A módosítások a Weboldalon történő közzététellel lépnek hatályba. Javasolt rendszeresen felkeresni a Weboldalt a frissítések megtekintéséhez.",
        },
        contact: {
          title: "XI. Kapcsolat",
          text: "Az adatkezeléssel kapcsolatos kérdésekben az alábbi elérhetőségeken lehet kapcsolatba lépni az Adatkezelővel:",
          email: "contact@andrasdenes.com",
          response: "Az Adatkezelő a megkeresést 30 napon belül megválaszolja.",
        },
        backToHome: "← Vissza a főoldalra",
        terms: "Általános Szerződési Feltételek",
      }
    : {
        title: "Privacy Policy",
        lastUpdated: "Effective: May 20, 2026",
        intro: "This Privacy Policy applies to visitors of the yellowsky.cc website (hereinafter: \"Website\") and customers of the Webshop, regarding the processing of their personal data. This Policy complies with Regulation (EU) 2016/679 of the European Parliament and of the Council (General Data Protection Regulation, GDPR) and Hungarian data protection laws.",
        controller: {
          title: "I. Data Controller",
          text: "The Website and Webshop are operated by András Dénes, independent artist (hereinafter: \"Data Controller\").",
          contact: "Contact:",
          email: "contact@andrasdenes.com",
          location: "Budapest, Hungary",
        },
        data: {
          title: "II. Personal Data Processed",
          intro: "The Data Controller processes the following personal data:",
          collected: [
            "Name, email address, and phone number – when submitting the contact form",
            "Name, email address, billing address, and shipping address – when purchasing from the Webshop",
            "IP address, browser type – automatically generated during Website visits",
          ],
          notCollected: [
            "Payment card details – these are processed by Stripe payment provider",
            "Passwords – there is no user account system",
            "Sensitive personal data – health status, religious beliefs, political views, etc.",
          ],
        },
        legalBasis: {
          title: "III. Legal Basis for Data Processing",
          text: "The Data Controller processes personal data based on the following legal grounds under GDPR Article 6:",
          items: [
            "a) Contract performance (GDPR Art. 6(1)(b)) – data necessary for order fulfillment",
            "b) Legitimate interest (GDPR Art. 6(1)(f)) – Website operation, security, and improvement",
            "c) Consent (GDPR Art. 6(1)(a)) – voluntary contact inquiries",
          ],
        },
        purpose: {
          title: "IV. Purpose of Data Processing",
          items: [
            "Processing and fulfilling orders",
            "Issuing invoices in accordance with accounting regulations",
            "Responding to contact inquiries",
            "Maintaining Website security",
            "Analyzing and improving Website performance",
            "Complying with legal obligations",
          ],
        },
        retention: {
          title: "V. Data Retention Period",
          text: "The Data Controller stores personal data only for the necessary duration:",
          items: [
            "Order data: 5 years per the Accounting Act (Act C of 2000)",
            "Contact messages: 1 year after response",
            "Website logs: 30 days",
            "Analytics data: 2 years",
          ],
          deletion: "Upon completion of the data processing purpose, the Data Controller deletes the data.",
        },
        thirdParty: {
          title: "VI. Data Transfers and Third Parties",
          text: "The Data Controller may transfer personal data to the following third parties:",
          services: [
            { name: "Stripe Inc.", purpose: "Payment processing", location: "United States (under EU-US Data Privacy Framework)", policy: "https://stripe.com/privacy" },
            { name: "Vercel Inc.", purpose: "Website hosting", location: "United States", policy: "https://vercel.com/legal/privacy-policy" },
            { name: "Cloudflare Inc.", purpose: "CDN and security services", location: "United States", policy: "https://www.cloudflare.com/privacypolicy/" },
          ],
          note: "The Data Controller does not transfer, sell, or rent personal data to other third parties except for the above-mentioned service providers.",
        },
        rights: {
          title: "VII. Rights of the Data Subject",
          text: "Under GDPR, the data subject (owner of personal data) has the following rights:",
          items: [
            "Right of access (GDPR Art. 15) – request information about processed data",
            "Right to rectification (GDPR Art. 16) – request correction of inaccurate data",
            "Right to erasure (GDPR Art. 17) – request deletion of data (\"right to be forgotten\")",
            "Right to restrict processing (GDPR Art. 18)",
            "Right to data portability (GDPR Art. 20) – receive data in machine-readable format",
            "Right to withdraw consent – withdraw consent at any time",
            "Right to object (GDPR Art. 21) – object to data processing",
          ],
          complaint: "Right to lodge a complaint:",
          authority: "The data subject may lodge a complaint with the National Authority for Data Protection and Freedom of Information (NAIH):",
          authorityAddress: "1363 Budapest, Pf. 9. | Tel: +36-1-391-1400 | Email: ugyfelszolgalat@naih.hu | Web: www.naih.hu",
        },
        security: {
          title: "VIII. Data Security",
          text: "The Data Controller takes appropriate technical and organizational measures to protect personal data:",
          items: [
            "HTTPS encryption on all connections",
            "Secure hosting provider (Vercel)",
            "Limited access to personal data",
            "Regular security updates",
          ],
          disclaimer: "However, data transmission over the Internet can never be guaranteed 100% secure.",
        },
        cookies: {
          title: "IX. Cookies",
          text: "The Website uses cookies for the following purposes:",
          items: [
            "Session cookies – to remember language preferences",
            "Analytics cookies – for anonymous statistics (can be disabled)",
          ],
          control: "You can disable cookies in your browser settings, but this may limit Website functionality.",
          more: "Detailed information about cookies is available in your browser's help section.",
        },
        changes: {
          title: "X. Changes to This Policy",
          text: "The Data Controller reserves the right to modify this Policy. Changes take effect upon publication on the Website. It is recommended to check the Website regularly for updates.",
        },
        contact: {
          title: "XI. Contact",
          text: "For questions regarding data processing, contact the Data Controller:",
          email: "contact@andrasdenes.com",
          response: "The Data Controller responds to inquiries within 30 days.",
        },
        backToHome: "← Back to Home",
        terms: "Terms of Service",
      };

  return (
    <div className="min-h-screen">
      {/* Fixed background - hero image */}
      <div className="fixed inset-0 z-0 bg-neutral-900">
        <div className="relative w-full h-full">
          <img
            alt="Yellowsky German Street sketch - yellow architectural illustration"
            className="absolute inset-0 w-full h-full object-cover"
            src="/hero.jpg"
            draggable={false}
            onContextMenu={(e) => e.preventDefault()}
          />
        </div>
        {/* Subtle gradient overlay for depth */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/40" />
      </div>

      {/* Content layer */}
      <div className="relative z-10">
        {/* Header */}
        <header className="sticky top-0 z-50 border-b border-white/10 bg-neutral-900/60 backdrop-blur-xl">
          <div className="flex h-16 w-full items-center justify-between px-6">
            <Link href="/" className="font-display text-lg font-bold tracking-tight uppercase text-white hover:text-white/80 transition-colors">
              YELLOWSKY
            </Link>
            <LanguageSwitcher initialLanguage={initialLanguage} />
          </div>
        </header>

      <main className="relative px-4 py-12 pb-24 md:px-6">
        <article className="mx-auto max-w-2xl">
          {/* Glass card header */}
          <header className="mb-10 p-6 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10">
            <h1 className="font-outfit text-2xl md:text-3xl font-semibold text-primary">
              {labels.title}
            </h1>
            <p className="mt-2 text-sm text-white/70">
              {labels.lastUpdated}
            </p>
          </header>

          {/* Content sections wrapped in glass card */}
          <div className="p-6 md:p-8 rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-white/10 space-y-8 text-white/90">
            <p className="leading-relaxed">{labels.intro}</p>

            <section className="p-5 rounded-xl bg-white/[0.02] border border-white/5">
              <h2 className="font-outfit text-lg font-semibold text-primary mb-3">
                {labels.controller.title}
              </h2>
              <p className="leading-relaxed">{labels.controller.text}</p>
              <p className="mt-2 text-sm text-white/80"><strong className="text-white">{labels.controller.contact}</strong> {labels.controller.email}</p>
              <p className="text-sm text-white/80">{labels.controller.location}</p>
            </section>

            <section className="p-5 rounded-xl bg-white/[0.02] border border-white/5">
              <h2 className="font-outfit text-lg font-semibold text-primary mb-3">
                {labels.data.title}
              </h2>
              <p className="font-medium mb-2 text-white">{labels.data.intro}</p>
              <ul className="list-inside list-disc space-y-1.5 text-sm text-white/80 mb-4">
                {labels.data.collected.map((item, i) => <li key={i}>{item}</li>)}
              </ul>
              <p className="font-medium mb-2 text-white">{language === "hu" ? "Nem gyűjtött adatok:" : "Data not collected:"}</p>
              <ul className="list-inside list-disc space-y-1.5 text-sm text-white/80">
                {labels.data.notCollected.map((item, i) => <li key={i}>{item}</li>)}
              </ul>
            </section>

            <section className="p-5 rounded-xl bg-white/[0.02] border border-white/5">
              <h2 className="font-outfit text-lg font-semibold text-primary mb-3">
                {labels.legalBasis.title}
              </h2>
              <p className="leading-relaxed mb-2">{labels.legalBasis.text}</p>
              <ul className="list-inside list-disc space-y-1.5 text-sm text-white/80">
                {labels.legalBasis.items.map((item, i) => <li key={i}>{item}</li>)}
              </ul>
            </section>

            <section className="p-5 rounded-xl bg-white/[0.02] border border-white/5">
              <h2 className="font-outfit text-lg font-semibold text-primary mb-3">
                {labels.purpose.title}
              </h2>
              <ul className="list-inside list-disc space-y-1.5 text-sm text-white/80">
                {labels.purpose.items.map((item, i) => <li key={i}>{item}</li>)}
              </ul>
            </section>

            <section className="p-5 rounded-xl bg-white/[0.02] border border-white/5">
              <h2 className="font-outfit text-lg font-semibold text-primary mb-3">
                {labels.retention.title}
              </h2>
              <p className="leading-relaxed mb-2">{labels.retention.text}</p>
              <ul className="list-inside list-disc space-y-1.5 text-sm text-white/80">
                {labels.retention.items.map((item, i) => <li key={i}>{item}</li>)}
              </ul>
              <p className="mt-3 leading-relaxed text-sm text-white/80">{labels.retention.deletion}</p>
            </section>

            <section className="p-5 rounded-xl bg-white/[0.02] border border-white/5">
              <h2 className="font-outfit text-lg font-semibold text-primary mb-3">
                {labels.thirdParty.title}
              </h2>
              <p className="leading-relaxed mb-3">{labels.thirdParty.text}</p>
              <div className="space-y-2 text-sm text-white/80">
                {labels.thirdParty.services.map((service, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <strong className="text-primary">{service.name}:</strong>
                    <span>{service.purpose} – <em>{service.location}</em></span>
                  </div>
                ))}
              </div>
              <div className="mt-3 space-y-1">
                {labels.thirdParty.services.map((service, i) => (
                  <a key={i} href={service.policy} target="_blank" rel="noopener noreferrer" className="block text-sm text-primary hover:text-yellow-300 transition-colors">
                    {language === "hu" ? `${service.name} adatvédelmi irányelvek` : `${service.name} Privacy Policy`}
                  </a>
                ))}
              </div>
              <p className="mt-3 leading-relaxed text-sm text-white/80">{labels.thirdParty.note}</p>
            </section>

            <section className="p-5 rounded-xl bg-white/[0.02] border border-white/5">
              <h2 className="font-outfit text-lg font-semibold text-primary mb-3">
                {labels.rights.title}
              </h2>
              <p className="leading-relaxed mb-2">{labels.rights.text}</p>
              <ul className="list-inside list-disc space-y-1.5 text-sm text-white/80">
                {labels.rights.items.map((item, i) => <li key={i}>{item}</li>)}
              </ul>
              <p className="mt-4 font-medium text-white">{labels.rights.complaint}</p>
              <p className="text-sm text-white/80">{labels.rights.authority}</p>
              <p className="text-sm text-white/80">{labels.rights.authorityAddress}</p>
            </section>

            <section className="p-5 rounded-xl bg-white/[0.02] border border-white/5">
              <h2 className="font-outfit text-lg font-semibold text-primary mb-3">
                {labels.security.title}
              </h2>
              <p className="leading-relaxed mb-2">{labels.security.text}</p>
              <ul className="list-inside list-disc space-y-1.5 text-sm text-white/80">
                {labels.security.items.map((item, i) => <li key={i}>{item}</li>)}
              </ul>
              <p className="mt-3 leading-relaxed text-sm text-white/80">{labels.security.disclaimer}</p>
            </section>

            <section className="p-5 rounded-xl bg-white/[0.02] border border-white/5">
              <h2 className="font-outfit text-lg font-semibold text-primary mb-3">
                {labels.cookies.title}
              </h2>
              <p className="leading-relaxed mb-2">{labels.cookies.text}</p>
              <ul className="list-inside list-disc space-y-1.5 text-sm text-white/80">
                {labels.cookies.items.map((item, i) => <li key={i}>{item}</li>)}
              </ul>
              <p className="mt-3 leading-relaxed text-sm text-white/80">{labels.cookies.control}</p>
            </section>

            <section className="p-5 rounded-xl bg-white/[0.02] border border-white/5">
              <h2 className="font-outfit text-lg font-semibold text-primary mb-3">
                {labels.changes.title}
              </h2>
              <p className="leading-relaxed">{labels.changes.text}</p>
            </section>

            <section className="p-5 rounded-xl bg-white/[0.02] border border-white/5">
              <h2 className="font-outfit text-lg font-semibold text-primary mb-3">
                {labels.contact.title}
              </h2>
              <p className="leading-relaxed mb-2">{labels.contact.text}</p>
              <p className="text-sm text-white/80"><strong className="text-white">Email:</strong> {labels.contact.email}</p>
              <p className="text-sm text-white/80">{labels.contact.response}</p>
            </section>
          </div>

          <footer className="mt-8 flex items-center justify-between">
            <Link href="/" className="text-sm text-neutral-500 hover:text-primary transition-colors">
              {labels.backToHome}
            </Link>
            <Link href="/terms" className="text-sm text-primary hover:text-yellow-300 transition-colors">
              {labels.terms}
            </Link>
          </footer>
        </article>
      </main>
      </div>
    </div>
  );
}