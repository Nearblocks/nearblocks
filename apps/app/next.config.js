const path = require('path');
const { configureRuntimeEnv } = require('next-runtime-env/build/configure');
// const createNextIntlPlugin = require('next-intl/plugin');
const nextTranslate = require('next-translate-plugin');

// const withNextIntl = createNextIntlPlugin('./src/app/config/i18n.ts');

configureRuntimeEnv();

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  optimizeFonts: false,
  output: 'standalone',
  experimental: {
    outputFileTracingRoot: path.join(__dirname, '../../'),
    // ppr:true
  },
  webpack: (config, options) => {
    config.experiments.asyncWebAssembly = true;

    return config;
  },
  async redirects() {
    return [
      {
        source: '/transactions',
        destination: '/txns',
        permanent: true,
      },
      {
        source: '/transactions/:slug',
        destination: '/txns/:slug',
        permanent: true,
      },
      {
        source: '/tx/:slug',
        destination: '/txns/:slug',
        permanent: true,
      },
    ];
  },
};

module.exports = nextTranslate(nextConfig);
