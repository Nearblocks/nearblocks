const path = require('path');
const nextTranslate = require('next-translate-plugin');

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
});

module.exports = nextConfig;
