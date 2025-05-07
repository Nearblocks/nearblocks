import path from 'path';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();
const __dirname = import.meta.dirname;

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    webpackMemoryOptimizations: true,
  },
  reactStrictMode: true,
  poweredByHeader: false,
  output: 'standalone',
  outputFileTracingRoot: path.join(__dirname, '../../'),
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
      {
        source: '/api/health-check',
        destination: '/api/healthcheck',
        permanent: true,
      },
    ];
  },
  generateBuildId: async () => {
    return process.env.GITHUB_SHA || 'nearblocks';
  },
};

export default withNextIntl(nextConfig);
