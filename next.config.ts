import { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  /* config options here */
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
};

export default nextConfig;
