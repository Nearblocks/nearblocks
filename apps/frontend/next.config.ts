import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  experimental: {
    globalNotFound: true,
    optimizePackageImports: ['radix-ui', '@remixicon/react'],
  },
  async headers() {
    return [
      {
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
        source: '/(.*)',
      },
    ];
  },
  output: 'standalone',
  async redirects() {
    return [
      {
        destination: '/tokens/transfers',
        permanent: true,
        source: '/tokentxns',
      },
      {
        destination: '/nft-tokens/transfers',
        permanent: true,
        source: '/nft-tokentxns',
      },
      {
        destination: '/validators',
        permanent: true,
        source: '/node-explorer',
      },
      {
        destination: '/terms',
        permanent: true,
        source: '/terms-and-conditions',
      },
    ];
  },
};

export default nextConfig;
