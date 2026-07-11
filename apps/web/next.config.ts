import { composePlugins, withNx } from '@nx/next';
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ['@org/ui-design-system', 'lucide-react'],
  images: {
    unoptimized: process.env.NODE_ENV !== 'production',
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'upload.wikimedia.org',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://127.0.0.1:3000/api/:path*',
      },
    ];
  },
};

const plugins = [withNx];
export default composePlugins(...plugins)(nextConfig);
