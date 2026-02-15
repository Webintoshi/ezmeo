import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.ezmeo.com',
        pathname: '/products/**',
      },
      {
        protocol: 'https',
        hostname: 'cdn.ezmeo.com',
        pathname: '/categories/**',
      },
      {
        protocol: 'https',
        hostname: 'cdn.ezmeo.com',
        pathname: '/hero-banners/**',
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
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
};

export default nextConfig;
