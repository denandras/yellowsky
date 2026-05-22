import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getArtworkBySlug, getArtworks } from "@/lib/artwork-data";
import ArtworkPageClient from "@/components/artwork-page-client";

type Props = {
  params: Promise<{ slug: string }>;
};

// ISR: regenerate every 60 seconds
export const revalidate = 60;

// Generate static paths for all artworks
export async function generateStaticParams() {
  const artworks = await getArtworks();
  return artworks.map((artwork) => ({
    slug: artwork.slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const artwork = await getArtworkBySlug(slug);

  if (!artwork) {
    return { title: "Artwork not found" };
  }

  return {
    title: `${artwork.title} | Yellowsky`,
    description: artwork.alt,
    openGraph: {
      title: `${artwork.title} | Yellowsky`,
      description: artwork.alt,
      images: [artwork.heroUrl ?? artwork.viewUrl],
    },
  };
}

export default async function ArtworkPage({ params }: Props) {
  const { slug } = await params;
  const artwork = await getArtworkBySlug(slug);

  if (!artwork) {
    notFound();
  }

  return <ArtworkPageClient artwork={artwork} />;
}