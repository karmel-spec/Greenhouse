import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Local verification builds set NEXT_DIST_DIR=.next-build so a running
  // `next dev` and a production build never corrupt each other's cache.
  // Netlify/production builds leave it unset and use the default .next.
  distDir: process.env.NEXT_DIST_DIR || ".next",
};

export default nextConfig;
