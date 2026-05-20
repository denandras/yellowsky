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
        lastUpdated: "Hatályos: 2026. május 20-tól",
        intro: "Jelen Általános Szerződési Feltételek (a továbbiakban: ÁSZF) a yellowsky.andrasdenes.com webáruházban történő vásárlásra vonatkoznak. A megrendeléssel a Felhasználó elfogadja jelen ÁSZF rendelkezéseit.",
        definitions: {
          title: "I. Fogalmi meghatározások",
          items: [
            "Szolgáltató: a webáruházat üzemeltető Dénes András egyéni vállalkozó (Budapest, Magyarország)",
            "Felhasználó: az a természetes személy, aki a webáruházban terméket rendel",
            "Fogyasztó: a Polgári Törvénykönyv szerinti fogyasztó, az a Felhasználó, aki a terméket nem szakmai tevékenységéhez kapcsolódóan vásárolja",
            "Webáruház: a Szolgáltató által üzemeltetett online értékesítési felület",
            "Termék: a webáruházban kínált giclée minőségű művészeti nyomat",
            "Szerződés: a Felhasználó és a Szolgáltató között létrejött adásvételi szerződés",
          ],
        },
        parties: {
          title: "II. Szerződő felek",
          provider: "Szolgáltató:",
          providerName: "Dénes András",
          providerType: "magánszemély, független művész",
          providerAddress: "Székhely: Budapest, Magyarország",
          providerEmail: "E-mail: contact@andrasdenes.com",
          user: "Felhasználó:",
          userText: "A vásárló, aki a webáruházban rendelést helyez el.",
        },
        products: {
          title: "III. A termékek ismertetése",
          text: "A webáruházban giclée minőségű művészeti nyomatok kaphatók. A termékek a megrendeléskor megadott méretben és anyagban készülnek, egyedi gyártásúak.",
          images: "A weboldalon található képek tájékoztató jellegűek; a tényleges színek a képernyő beállításaitól függően eltérhetnek.",
        },
        ordering: {
          title: "IV. A megrendelés folyamata",
          steps: [
            "A Felhasználó kiválasztja a kívánt nyomatot és méretet",
            "A terméket a kosárba helyezi",
            "Megadja a számlázási és szállítási adatokat",
            "A fizetést a Stripe biztonságos fizetési rendszerén keresztül teljesíti",
            "A Sikeres fizetést követően a Szolgáltató visszaigazoló e-mailt küld",
          ],
          contract: "A szerződés a megrendelés Szolgáltató általi visszaigazolásával (sikeres fizetés esetén automatikus visszaigazolás) jön létre.",
          language: "A szerződés nyelve magyar, a szerződés írásban megkötésének minősül, és a Szolgáltató az iktatott megrendelést 5 évig megőrzi.",
        },
        pricing: {
          title: "V. Árak és fizetés",
          currency: "A termékek árai magyar forintban (HUF) vagy euróban (EUR) vannak feltüntetve.",
          vat: "Az árak az általános forgalmi adót (ÁFA) tartalmazzák.",
          payment: "A fizetés a Stripe biztonságos fizetési rendszerén keresztül történik.",
          cards: "Elfogadott fizetési módok: Visa, Mastercard, American Express és egyéb bankkártyák.",
          confirmation: "A sikeres fizetést követően a Felhasználó elektronikus visszaigazolást kap.",
        },
        shipping: {
          title: "VI. Szállítás",
          worldwide: "A Szolgáltató világszerte ingyenes szállítást biztosít.",
          timeframe: "A várható szállítási idő 7-14 munkanap a rendelés visszaigazolásától számítva (nyomtatás és csomagolás után).",
          tracking: "A Szolgáltató e-mailben értesíti a Felhasználót a megrendelés állapotáról.",
          damage: "Ha a csomag sérülten érkezik, a Felhasználó köteles a sérülésről fotót készíteni és a Szolgáltatót 48 órán belül értesíteni.",
        },
        returns: {
          title: "VII. Elállási és visszáru joga",
          intro: "A Fogyasztót a 45/2014. (II. 26.) Korm. rendelet alapján elállási jog illeti meg.",
          right: "A Fogyasztó a szerződés megkötésének napjától számított 14 napon belül jogosult indokolás nélkül elállni a szerződéstől.",
          conditions: "Az elállási jog gyakorlásának feltételei:",
          conditionList: [
            "A terméket eredeti, sértetlen állapotban kell visszaadni",
            "A visszáru költsége a Fogyasztót terheli",
            "A Szolgáltató a termék visszaérkezését követően legfeljebb 14 napon belül visszatéríti a vételárat",
          ],
          exceptions: "Az elállási jog nem illeti meg a Fogyasztót:",
          exceptionList: [
            "olyan termék esetében, amely a Fogyasztó utasítása szerint készült, vagy amelyet kifejezetten a Fogyasztó számára állítottak elő (egyedi nyomatok)",
            "zárt csomagolású hang-, videó- vagy szoftvertermék esetében, ha a csomagolást a Fogyasztó felbontotta",
          ],
        },
        warranty: {
          title: "VIII. Jótállás",
          text: "A giclée nyomatokat archív minőségű papíron készítjük. A nyomatok megfelelő tárolás mellett (közvetlen napfénytől, nedvességtől védve) akár 80 évig is megőrzik minőségüket.",
          defects: "Gyártási hiba vagy szállítási sérülés esetén a Szolgáltató a terméket ingyen kicseréli vagy visszatéríti a vételárat, a hibás termék visszaküldése mellett.",
        },
        intellectual: {
          title: "IX. Szellemi tulajdon",
          text: "A weboldalon és a termékeken található valamennyi műalkotás, fotó, szöveg és design a szerző (Dénes András) szellemi tulajdonát képezi. A vásárlás nem ad jogot a művek másolására, terjesztésére vagy kereskedelmi célú felhasználására.",
        },
        liability: {
          title: "X. Felelősségi szabályok",
          text: "A Szolgáltató a szerződéses kötelezettségeit a szakmai gondosság követelményeinek megfelelően köteles teljesíteni.",
          limitation: "A Szolgáltató felelőssége korlátozott a szándékos vagy súlyos gondatlanságból eredő károkra. A Szolgáltató nem felel azokért a károkért, amelyek a termék rendeltetésszerű használatából erednek.",
        },
        governing: {
          title: "XI. Joghatóság és alkalmazandó jog",
          text: "Jelen ÁSZF-re, valamint a szerződéses jogviszonyra a magyar jog hatályos szabályai irányadóak.",
          disputes: "A szerződésből eredő viták eldöntésére a magyar bíróságok hatáskörrel és illetékességgel rendelkeznek, a hatályos jogszabályok szerint.",
          eu: "Az Európai Bizottság online vitarendezési platformja elérhető: https://ec.europa.eu/consumers/odr/",
        },
        changes: {
          title: "XII. Az ÁSZF módosítása",
          text: "A Szolgáltató fenntartja a jogot jelen ÁSZF módosítására. A módosítások a weboldalon történő közzétételt követően lépnek hatályba. A vásárláskor érvényes ÁSZF rendelkezései vonatkoznak a megrendelésre.",
        },
        contact: {
          title: "XIII. Kapcsolat",
          text: "Az ÁSZF-fel vagy a megrendeléssel kapcsolatos kérdésekben az alábbi elérhetőségeken lehet kapcsolatba lépni a Szolgáltatóval:",
          email: "contact@andrasdenes.com",
          response: "A Szolgáltató a megkeresést 48 órán belül megválaszolja.",
        },
        backToHome: "← Vissza a főoldalra",
        privacy: "Adatvédelmi Tájékoztató",
      }
    : {
        title: "Terms of Service",
        lastUpdated: "Effective: May 20, 2026",
        intro: "These Terms of Service (\"Terms\") apply to purchases from the Yellowsky webshop. By placing an order, you agree to these Terms.",
        definitions: {
          title: "I. Definitions",
          items: [
            "Provider: Dénes András, independent artist operating the webshop (Budapest, Hungary)",
            "User: any natural person placing an order in the webshop",
            "Consumer: a User purchasing products for personal, non-professional use",
            "Webshop: the online sales platform operated by the Provider",
            "Product: giclée quality art prints offered in the webshop",
            "Contract: the purchase agreement between User and Provider",
          ],
        },
        parties: {
          title: "II. Parties",
          provider: "Provider:",
          providerName: "András Dénes",
          providerType: "independent artist",
          providerAddress: "Location: Budapest, Hungary",
          providerEmail: "Email: contact@andrasdenes.com",
          user: "User:",
          userText: "The customer placing an order through the webshop.",
        },
        products: {
          title: "III. Products",
          text: "The webshop offers giclée quality art prints. Products are made to order in the specified size and material.",
          images: "Images on the website are illustrative; actual colors may vary depending on screen settings.",
        },
        ordering: {
          title: "IV. Ordering Process",
          steps: [
            "User selects the desired print and size",
            "Adds the product to cart",
            "Provides billing and shipping information",
            "Completes payment via Stripe secure payment system",
            "Provider sends order confirmation email upon successful payment",
          ],
          contract: "The contract is formed when the Provider confirms the order (automatic confirmation upon successful payment).",
          language: "The contract language is English. The contract is considered concluded in writing and the Provider retains order records for 5 years.",
        },
        pricing: {
          title: "V. Pricing & Payment",
          currency: "Prices are displayed in Hungarian Forint (HUF) or Euros (EUR).",
          vat: "Prices include value-added tax (VAT).",
          payment: "Payment is processed through the Stripe secure payment system.",
          cards: "Accepted payment methods: Visa, Mastercard, American Express and other bank cards.",
          confirmation: "Upon successful payment, the User receives electronic confirmation.",
        },
        shipping: {
          title: "VI. Shipping",
          worldwide: "The Provider offers free worldwide shipping.",
          timeframe: "Estimated delivery is 7-14 business days from order confirmation (after printing and packaging).",
          tracking: "The Provider notifies the User via email about order status updates.",
          damage: "If the package arrives damaged, the User must photograph the damage and notify the Provider within 48 hours.",
        },
        returns: {
          title: "VII. Right of Withdrawal",
          intro: "Under EU consumer protection law, Consumers have the right of withdrawal.",
          right: "The Consumer is entitled to withdraw from the contract within 14 days from the date of conclusion without giving any reason.",
          conditions: "Conditions for exercising the right of withdrawal:",
          conditionList: [
            "The product must be returned in its original, undamaged condition",
            "Return shipping costs are borne by the Consumer",
            "The Provider will refund the purchase price within 14 days of receiving the returned item",
          ],
          exceptions: "The right of withdrawal does not apply to:",
          exceptionList: [
            "Products made to the Consumer's specifications or clearly personalized (custom prints)",
            "Sealed audio, video, or software products if the seal has been broken by the Consumer",
          ],
        },
        warranty: {
          title: "VIII. Warranty",
          text: "Giclée prints are made on archival quality paper. With proper storage (protected from direct sunlight and moisture), prints can retain their quality for up to 80 years.",
          defects: "In case of manufacturing defects or shipping damage, the Provider will replace the product free of charge or refund the purchase price, upon return of the defective item.",
        },
        intellectual: {
          title: "IX. Intellectual Property",
          text: "All artwork, photos, text, and design on the website and products are the intellectual property of the author (András Dénes). Purchase does not grant rights to copy, distribute, or commercially use the works.",
        },
        liability: {
          title: "X. Limitation of Liability",
          text: "The Provider is obligated to fulfill contractual obligations with professional care.",
          limitation: "The Provider's liability is limited to damages arising from intent or gross negligence. The Provider is not liable for damages resulting from proper use of the product.",
        },
        governing: {
          title: "XI. Governing Law & Jurisdiction",
          text: "These Terms and the contractual relationship are governed by Hungarian law.",
          disputes: "Disputes arising from the contract are subject to the jurisdiction of Hungarian courts in accordance with applicable law.",
          eu: "The European Commission's online dispute resolution platform is available at: https://ec.europa.eu/consumers/odr/",
        },
        changes: {
          title: "XII. Changes to Terms",
          text: "The Provider reserves the right to modify these Terms. Changes take effect upon publication on the website. The Terms in effect at the time of purchase apply to the order.",
        },
        contact: {
          title: "XIII. Contact",
          text: "For questions about these Terms or orders, contact:",
          email: "contact@andrasdenes.com",
          response: "The Provider responds to inquiries within 48 hours.",
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
                {labels.definitions.title}
              </h2>
              <ul className="list-inside list-disc space-y-1 text-sm">
                {labels.definitions.items.map((item, i) => <li key={i}>{item}</li>)}
              </ul>
            </section>

            <section>
              <h2 className="font-outfit text-xl font-semibold text-primary mb-3">
                {labels.parties.title}
              </h2>
              <div className="space-y-1 text-sm">
                <p><strong>{labels.parties.provider}</strong> {labels.parties.providerName}, {labels.parties.providerType}</p>
                <p>{labels.parties.providerAddress}</p>
                <p>{labels.parties.providerEmail}</p>
                <p className="mt-3"><strong>{labels.parties.user}</strong> {labels.parties.userText}</p>
              </div>
            </section>

            <section>
              <h2 className="font-outfit text-xl font-semibold text-primary mb-3">
                {labels.products.title}
              </h2>
              <p className="leading-relaxed">{labels.products.text}</p>
              <p className="mt-2 text-sm">{labels.products.images}</p>
            </section>

            <section>
              <h2 className="font-outfit text-xl font-semibold text-primary mb-3">
                {labels.ordering.title}
              </h2>
              <ol className="list-inside list-decimal space-y-1 text-sm mb-3">
                {labels.ordering.steps.map((step, i) => <li key={i}>{step}</li>)}
              </ol>
              <p className="leading-relaxed">{labels.ordering.contract}</p>
              <p className="mt-2 text-sm">{labels.ordering.language}</p>
            </section>

            <section>
              <h2 className="font-outfit text-xl font-semibold text-primary mb-3">
                {labels.pricing.title}
              </h2>
              <p className="leading-relaxed">{labels.pricing.currency}</p>
              <p className="mt-2 text-sm">{labels.pricing.vat}</p>
              <p className="mt-2 text-sm">{labels.pricing.payment}</p>
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
              <p className="leading-relaxed mb-2">{labels.returns.intro}</p>
              <p className="leading-relaxed mb-2">{labels.returns.right}</p>
              <p className="font-medium mb-1">{labels.returns.conditions}</p>
              <ul className="list-inside list-disc space-y-1 text-sm mb-3">
                {labels.returns.conditionList.map((item, i) => <li key={i}>{item}</li>)}
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
              <p className="mt-2 leading-relaxed">{labels.liability.limitation}</p>
            </section>

            <section>
              <h2 className="font-outfit text-xl font-semibold text-primary mb-3">
                {labels.governing.title}
              </h2>
              <p className="leading-relaxed">{labels.governing.text}</p>
              <p className="mt-2 text-sm">{labels.governing.disputes}</p>
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