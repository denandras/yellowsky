import type { SiteLanguage } from "@/lib/site-language";

type JsonLdProps = {
  type: "website" | "artist" | "product" | "breadcrumb";
  language?: SiteLanguage;
  productData?: {
    name: string;
    description: string;
    image: string;
    priceA4?: number;
    priceA3?: number;
    currency?: string;
  };
};

export default function JsonLd({ type, language = "en", productData }: JsonLdProps) {
  const baseUrl = "https://yellowsky.andrasdenes.com";
  
  const artistSchema = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "András Dénes",
    alternateName: "Andras Denes",
    url: "https://andrasdenes.com",
    jobTitle: language === "hu" ? "Képzőművész, Harsonaművész" : "Visual Artist, Trombonist",
    nationality: language === "hu" ? "Magyar" : "Hungarian",
    knowsAbout: ["yellow sketches", "giclée prints", "contemporary art", "trombone"],
    sameAs: [
      "https://instagram.com/yellowsky.sketches",
      "https://instagram.com/abstract.sketcher",
      "https://andrasdenes.com",
    ],
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Yellowsky",
    url: baseUrl,
    description: language === "hu" 
      ? "Sárga vázlatok és giclée nyomatok Dénes Andrástól" 
      : "Yellow sketches and giclée prints by András Dénes",
    publisher: {
      "@type": "Person",
      name: "András Dénes",
      url: "https://andrasdenes.com",
    },
    potentialAction: {
      "@type": "SearchAction",
      target: `${baseUrl}/webshop`,
      "query-input": "required name=search_term_string",
    },
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: baseUrl,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: language === "hu" ? "Webshop" : "Webshop",
        item: `${baseUrl}/webshop`,
      },
    ],
  };

  const productSchema = productData ? {
    "@context": "https://schema.org",
    "@type": "Product",
    name: productData.name,
    description: productData.description,
    image: productData.image,
    brand: {
      "@type": "Person",
      name: "András Dénes",
    },
    offers: [
      productData.priceA4 && {
        "@type": "Offer",
        name: "A4 Print",
        price: (productData.priceA4 / 100).toFixed(0),
        priceCurrency: productData.currency || "HUF",
        availability: "https://schema.org/InStock",
        seller: {
          "@type": "Person",
          name: "András Dénes",
        },
      },
      productData.priceA3 && {
        "@type": "Offer",
        name: "A3 Print",
        price: (productData.priceA3 / 100).toFixed(0),
        priceCurrency: productData.currency || "HUF",
        availability: "https://schema.org/InStock",
        seller: {
          "@type": "Person",
          name: "András Dénes",
        },
      },
    ].filter(Boolean),
  } : null;

  const schemas = {
    website: websiteSchema,
    artist: artistSchema,
    breadcrumb: breadcrumbSchema,
    product: productSchema,
  };

  const schema = schemas[type];
  if (!schema) return null;

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schema),
      }}
    />
  );
}