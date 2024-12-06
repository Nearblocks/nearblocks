import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpackMemoryOptimizations: true,
  reactStrictMode: true,
  poweredByHeader: false,
  optimizeFonts: false,
  output: 'standalone',
  experimental: {
    outputFileTracingRoot: path.join(__dirname, '../../'),
  },
  webpack: (config, options) => {
    config.experiments.asyncWebAssembly = true;
    return config;
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
};

export default withNextIntl(nextConfig);
