import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { CartProvider } from "@/lib/cart-context";
import JsonLd from "@/components/json-ld";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://yellowsky.andrasdenes.com"),
  title: {
    default: "Yellowsky | Yellow Sketches & Giclée Prints by András Dénes",
    template: "%s | Yellowsky",
  },
  description: "Discover and purchase original yellow sketches and giclée prints by András Dénes. A unique art collection that started during lockdown – free worldwide shipping available.",
  keywords: ["yellow sketches", "giclée prints", "art prints", "András Dénes", "contemporary art", "Budapest artist", "digital art", "architectural sketches", "abstract art", "yellowsky challenge"],
  authors: [{ name: "András Dénes", url: "https://andrasdenes.com" }],
  creator: "András Dénes",
  publisher: "András Dénes",
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
  openGraph: {
    title: "Yellowsky | Yellow Sketches & Giclée Prints by András Dénes",
    description: "Discover and purchase original yellow sketches and giclée prints. A unique art collection that started during lockdown – free worldwide shipping.",
    url: "https://yellowsky.andrasdenes.com",
    siteName: "Yellowsky",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/hero.jpg",
        width: 1200,
        height: 630,
        alt: "Yellowsky – Yellow Sketches by András Dénes",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Yellowsky | Yellow Sketches & Giclée Prints",
    description: "Discover and purchase original yellow sketches and giclée prints – free worldwide shipping.",
    images: ["/hero.jpg"],
  },
  alternates: {
    canonical: "https://yellowsky.andrasdenes.com",
    languages: {
      "en-US": "https://yellowsky.andrasdenes.com",
      "hu-HU": "https://yellowsky.andrasdenes.com",
    },
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://s3.tb1.denandras.cloud" />
        <link rel="dns-prefetch" href="https://s3.tb1.denandras.cloud" />
        <link rel="prefetch" href="/" />
        <link rel="prefetch" href="/webshop" />
        <link rel="prefetch" href="/contact" />
        <link rel="prefetch" href="/legal" />
      </head>
      <body className={`${inter.variable} ${outfit.variable} antialiased`}>
        <JsonLd type="website" />
        <JsonLd type="artist" />
        <CartProvider>
          {children}
        </CartProvider>
        <Analytics />
      </body>
    </html>
  );
}