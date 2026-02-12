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
      {
        protocol: 'https',
        hostname: '**.r2.dev',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'pub-245578082b99402d9e1093b849089bb2.r2.dev',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
