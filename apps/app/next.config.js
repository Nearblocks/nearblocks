const path = require('path');
const { configureRuntimeEnv } = require('next-runtime-env/build/configure');
const nextTranslate = require('next-translate-plugin');
configureRuntimeEnv();

/** @type {import('next').NextConfig} */
const nextConfig = nextTranslate({
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
});

module.exports = nextConfig;
