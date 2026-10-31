import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    localPatterns: [
      {
        pathname: "/**",
      },
      {
        pathname: "/api/media/file",
      },
    ],
  },
};

export default nextConfig;
