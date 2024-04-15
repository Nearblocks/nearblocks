const { configureRuntimeEnv } = require('next-runtime-env/build/configure');
const path = require('path');
const { env } = require('next-runtime-env');

const network = env('NEXT_PUBLIC_NETWORK_ID');
configureRuntimeEnv();

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
        source: '/api/nodes',
        destination:
          network === 'mainnet'
            ? 'https://api3.nearblocks.io/v1/node/telemetry'
            : 'https://api3-testnet.nearblocks.io/v1/node/telemetry',
      },
      {
        source: '/api/circulating-supply',
        destination:
          network === 'mainnet'
            ? 'https://api3.nearblocks.io/v1/legacy/circulating-supply'
            : 'https://api3-testnet.nearblocks.io/v1/legacy/circulating-supply',
      },
      {
        source: '/api/circulating-supply-in-near',
        destination:
          network === 'mainnet'
            ? 'https://api3.nearblocks.io/v1/legacy/circulating-supply?unit=near'
            : 'https://api3-testnet.nearblocks.io/v1/legacy/circulating-supply?unit=near',
      },
      {
        source: '/api/fees-of-previous-day-utc',
        destination:
          network === 'mainnet'
            ? 'https://api3.nearblocks.io/v1/legacy/fees?pediod=day'
            : 'https://api3-testnet.nearblocks.io/v1/legacy/fees?pediod=day',
      },
      {
        source: '/api/fees-of-previous-7-days-utc',
        destination:
          network === 'mainnet'
            ? 'https://api3.nearblocks.io/v1/legacy/fees?pediod=week'
            : 'https://api3-testnet.nearblocks.io/v1/legacy/fees?pediod=week',
      },
      {
        source: '/api/ping',
        destination:
          network === 'mainnet'
            ? 'https://api3.nearblocks.io/v1/legacy/ping'
            : 'https://api3-testnet.nearblocks.io/v1/legacy/ping',
      },
      {
        source: '/api/:path*',
        destination:
          network === 'mainnet'
            ? 'https://legacy.explorer.near.org/api/:path*'
            : 'https://legacy.explorer.testnet.near.org/api/:path*',
      },
    ];
  },
};

module.exports = nextConfig;
