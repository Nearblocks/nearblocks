/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  optimizeFonts: false,
  output: 'standalone',
  webpack: (config, options) => {
    config.experiments.asyncWebAssembly = true;

    return config;
  },
};

module.exports = nextConfig;
