import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
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
  title: "Yellowsky | Sketches by András Dénes",
  description: "Yellow sketches and visual art by András Dénes – a creative journey that started during lockdown and became a daily practice.",
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
  openGraph: {
    title: "Yellowsky | Sketches by András Dénes",
    description: "Yellow sketches and visual art – a creative journey that started during lockdown.",
    url: "https://yellowsky.andrasdenes.com",
    siteName: "Yellowsky",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Yellowsky | Sketches by András Dénes",
    description: "Yellow sketches and visual art – a creative journey that started during lockdown.",
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
        <link rel="prefetch" href="/" />
        <link rel="prefetch" href="/webshop" />
        <link rel="prefetch" href="/contact" />
      </head>
      <body className={`${inter.variable} ${outfit.variable} antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  );
}