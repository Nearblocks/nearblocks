const { configureRuntimeEnv } = require('next-runtime-env/build/configure');
const path = require('path');
const { env } = require('next-runtime-env');

const network = env('NEXT_PUBLIC_NETWORK_ID');
const mainnetApiUrl =
  env('NEXT_PUBLIC_MAINNET_API_URL') || 'https://api.nearblocks.io/v1';
const testnetApiUrl =
  env('NEXT_PUBLIC_TESTNET_API_URL') || 'https://api-testnet.nearblocks.io/v1';
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
            ? `${mainnetApiUrl}/node/telemetry`
            : `${testnetApiUrl}/node/telemetry`,
      },
      /*
      {
        source: '/api/circulating-supply',
        destination:
          network === 'mainnet'
            ? `${mainnetApiUrl}/legacy/circulating-supply`
            : `${testnetApiUrl}/legacy/circulating-supply`,
      },
*/
      {
        source: '/api/circulating-supply-in-near',
        destination:
          network === 'mainnet'
            ? `${mainnetApiUrl}/legacy/circulating-supply?unit=near`
            : `${testnetApiUrl}/legacy/circulating-supply?unit=near`,
      },
      {
        source: '/api/fees-of-previous-day-utc',
        destination:
          network === 'mainnet'
            ? `${mainnetApiUrl}/legacy/fees?period=day`
            : `${testnetApiUrl}/legacy/fees?period=day`,
      },
      {
        source: '/api/fees-of-previous-7-days-utc',
        destination:
          network === 'mainnet'
            ? `${mainnetApiUrl}/legacy/fees?period=week`
            : `${testnetApiUrl}/legacy/fees?period=week`,
      },
      {
        source: '/api/ping',
        destination:
          network === 'mainnet'
            ? `${mainnetApiUrl}/legacy/ping`
            : `${testnetApiUrl}/legacy/ping`,
      },
    ];
  },
};

module.exports = nextConfig;
