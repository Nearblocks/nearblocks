import { configureRuntimeEnv } from 'next-runtime-env/build/configure.js';

configureRuntimeEnv();

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  poweredByHeader: false,
  reactStrictMode: true,
};

export default nextConfig;
