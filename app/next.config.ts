import type { NextConfig } from 'next';

const nextConfig: NextConfig = process.env.PAGES_EXPORT === '1'
  ? {
      output: 'export',
      assetPrefix: process.env.NEXT_PUBLIC_BASE_PATH || '',
      trailingSlash: true,
      images: { unoptimized: true },
    }
  : {};

export default nextConfig;
