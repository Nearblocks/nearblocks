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
      {
        destination: '/charts/addresses',
        permanent: true,
        source: '/charts/active-accounts',
      },
      {
        destination: '/multichain-txns',
        permanent: true,
        source: '/charts/multichain-txns',
      },
      {
        destination: '/validators/:slug',
        permanent: true,
        source: '/node-explorer/:slug',
      },
      {
        destination: '/export-csv',
        permanent: true,
        source: '/exportdata',
      },
      {
        destination: '/tokens',
        permanent: true,
        source: '/token/exportdata',
      },
      {
        destination: '/nft-tokens',
        permanent: true,
        source: '/nft-token/exportdata',
      },
      {
        destination: '/mt-tokens/transfers',
        permanent: true,
        source: '/mt-token/:slug',
      },
      {
        destination: '/',
        permanent: true,
        source: '/login',
      },
      {
        destination: '/',
        permanent: true,
        source: '/register',
      },
      {
        destination: '/',
        permanent: true,
        source: '/resend',
      },
      {
        destination: '/',
        permanent: true,
        source: '/reset',
      },
      {
        destination: '/',
        permanent: true,
        source: '/lostpassword',
      },
      {
        destination: '/',
        permanent: true,
        source: '/confirmemail',
      },
      {
        destination: '/',
        permanent: true,
        source: '/updateemail',
      },
      {
        destination: '/',
        permanent: true,
        source: '/plans',
      },
      {
        destination: '/',
        permanent: true,
        source: '/user/:path*',
      },
      {
        destination: '/',
        permanent: true,
        source: '/publisher/:path*',
      },
      {
        destination: '/',
        permanent: true,
        source: '/campaign/:path*',
      },
      {
        destination: '/',
        permanent: true,
        source: '/campaign',
      },
    ];
  },
};

export default nextConfig;
