const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    outputFileTracingRoot: path.join(__dirname, '../../'),
  },
  optimizeFonts: false,
  output: 'standalone',
  poweredByHeader: false,
  reactStrictMode: true,
  webpack: (config) => {
    config.experiments.asyncWebAssembly = true;

    return config;
  },
};

module.exports = nextConfig;
