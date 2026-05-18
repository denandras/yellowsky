import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
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
