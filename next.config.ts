import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // Allow production builds to complete even if there are TypeScript errors
    ignoreBuildErrors: true,
  },
  images: {
    // R2 Storage domains for product images
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.ezmeo.com',
        pathname: '/products/**',
      },
      {
        protocol: 'https',
        hostname: '**.r2.cloudflarestorage.com',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
