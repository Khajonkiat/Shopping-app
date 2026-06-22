import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    turbo: {
      // Disable persistent cache to prevent stale server-side module compilation
      persistentCaching: false,
    },
  },
};

export default nextConfig;
