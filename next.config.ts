import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Izinkan hostname acak Quick Tunnel mengakses aset dan endpoint dev Next.js.
  allowedDevOrigins: ["*.trycloudflare.com"],
  // Teruskan request /api ke Express lokal saat FE dibuka dari Cloudflare Tunnel.
  async rewrites() {
    if (process.env.NODE_ENV !== "development") return [];

    return [
      {
        source: "/api/:path*",
        destination: "http://localhost:4000/api/:path*",
      },
    ];
  },
  cacheComponents: true,
  partialPrefetching: true,
  experimental: {
    instantInsights: {
      validationLevel: "manual-warning",
    },
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
