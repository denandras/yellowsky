"use client";

import { useState } from "react";
import { IconHeart } from "@/components/icons";

type CommunityPost = {
  id: string;
  image: string;
  author: string;
  likes: number;
  caption?: string;
  link?: string;
};

type CommunityGalleryProps = {
  posts: CommunityPost[];
  language: "en" | "hu";
};

export default function CommunityGallery({ posts, language }: CommunityGalleryProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const labels = language === "hu"
    ? {
        title: "#yellowskychallenge",
        subtitle: "A közösség művei",
        viewOnInstagram: "Megtekintés",
      }
    : {
        title: "#yellowskychallenge",
        subtitle: "From the community",
        viewOnInstagram: "View on Instagram",
      };

  return (
    <section className="px-6 py-8">
      <div className="mx-auto max-w-2xl" data-reveal>
        <div className="mb-6 text-center">
          <h2 className="font-display text-2xl font-bold tracking-tight">
            {labels.title}
          </h2>
          <p className="mt-1 text-sm text-text-muted">
            {labels.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-3 gap-1 sm:gap-2">
          {posts.map((post) => (
            <a
              key={post.id}
              href={post.link || "#"}
              target="_blank"
              rel="noreferrer"
              className="relative aspect-square overflow-hidden rounded-lg bg-neutral-100"
              onMouseEnter={() => setHoveredId(post.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              {/* Image */}
              <img
                src={post.image}
                alt={post.caption || `Post by ${post.author}`}
                className="h-full w-full object-cover transition-transform duration-300"
              />

              {/* Hover overlay */}
              <div
                className={`absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/50 transition-opacity duration-200 ${
                  hoveredId === post.id ? "opacity-100" : "opacity-0"
                }`}
              >
                <div className="flex items-center gap-4 text-white">
                  <div className="flex items-center gap-1">
                    <IconHeart className="size-5" />
                    <span className="text-sm font-semibold">{post.likes}</span>
                  </div>
                </div>
                <a
                  href={`https://instagram.com/${post.author.replace("@", "")}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-medium text-white/80 hover:text-white transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  {post.author}
                </a>
              </div>
            </a>
          ))}
        </div>

        <div className="mt-4 text-center">
          <a
            href="https://www.instagram.com/explore/tags/yellowskychallenge"
            target="_blank"
            rel="noreferrer"
            className="text-sm text-text-muted underline decoration-text-muted/30 underline-offset-2 transition-colors hover:text-primary"
          >
            {language === "hu" ? "További művek Instagramon →" : "More on Instagram →"}
          </a>
        </div>
      </div>
    </section>
  );
}