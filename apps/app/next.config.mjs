import { setupDevPlatform } from '@cloudflare/next-on-pages/next-dev';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = withNextIntl({
  experimental: {
    instrumentationHook: true,
  },
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
    ];
  },
});

if (process.env.NODE_ENV === 'development') {
  await setupDevPlatform();
}

export default withNextIntl(nextConfig);
