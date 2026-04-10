import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  cacheMaxMemorySize: 0,
  deploymentId: process.env.GITHUB_SHA,
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
        destination: '/txns',
        permanent: true,
        source: '/transactions',
      },
      {
        destination: '/txns/:slug',
        permanent: true,
        source: '/transactions/:slug',
      },
      {
        destination: '/txns/:slug',
        permanent: true,
        source: '/tx/:slug',
      },
      {
        destination: '/blocks/:slug',
        permanent: true,
        source: '/block/:slug',
      },
      {
        destination: '/tokens/:slug',
        permanent: true,
        source: '/token/:slug',
      },
      {
        destination: '/nft-tokens/:slug',
        permanent: true,
        source: '/nft-token/:slug',
      },
      {
        destination: '/nft-tokens/:slug/tokens/:token',
        permanent: true,
        source: '/nft-token/:slug/:token',
      },
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
      {
        destination: '/fil-ph/:path*',
        permanent: true,
        source: '/ph/:path*',
      },
      {
        destination: '/ja/:path*',
        permanent: true,
        source: '/jp/:path*',
      },
      {
        destination: '/ko/:path*',
        permanent: true,
        source: '/kr/:path*',
      },
      {
        destination: '/uk/:path*',
        permanent: true,
        source: '/ua/:path*',
      },
    ];
  },
};

export default nextConfig;
