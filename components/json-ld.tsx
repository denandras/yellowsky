import type { SiteLanguage } from '@/lib/site-language';
import { SITE_URL, AUTHOR_NAME, AUTHOR_URL } from '@/lib/config';

type JsonLdProps = {
  type: 'website' | 'artist' | 'product' | 'breadcrumb';
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

export default function JsonLd({ type, language = 'en', productData }: JsonLdProps) {
  const artistSchema = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: AUTHOR_NAME,
    alternateName: 'Andras Denes',
    url: AUTHOR_URL,
    jobTitle: language === 'hu' ? 'Képzőművész, Harsonaművész' : 'Visual Artist, Trombonist',
    nationality: language === 'hu' ? 'Magyar' : 'Hungarian',
    knowsAbout: ['yellow sketches', 'giclée prints', 'art posters', 'contemporary art', 'trombone'],
    sameAs: [
      'https://instagram.com/yellowsky.sketches',
      'https://instagram.com/abstract.sketcher',
      AUTHOR_URL,
    ],
  };

  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Yellowsky',
    url: SITE_URL,
    description: language === 'hu'
      ? 'Sárga grafikák, giclée nyomatok kenderpapíron és poszterek Dénes Andrástól'
      : 'Yellow sketches, giclée prints on hemp paper, and art posters by András Dénes',
    publisher: {
      '@type': 'Person',
      name: AUTHOR_NAME,
      url: AUTHOR_URL,
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: `${SITE_URL}/webshop`,
      'query-input': 'required name=search_term_string',
    },
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: SITE_URL,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: language === 'hu' ? 'Webshop' : 'Webshop',
        item: `${SITE_URL}/webshop`,
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