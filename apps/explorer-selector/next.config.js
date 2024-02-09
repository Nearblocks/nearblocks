const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
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
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination:
          process.env.NEXT_PUBLIC_NETWORK_ID === 'mainnet'
            ? 'https://api3.nearblocks.io/v1/legacy/:path*'
            : 'https://api3-testnet.nearblocks.io/v1/legacy/:path*',
      },
    ];
  },
};

module.exports = nextConfig;
