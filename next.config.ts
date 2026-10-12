import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "fattoriaisola.com" },
      { protocol: "https", hostname: "dbyoung.it" },
    ],
  },
};

export default nextConfig;
