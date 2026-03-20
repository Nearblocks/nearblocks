import type { MetadataRoute } from 'next';

import { getRuntimeConfig } from '@/lib/config';

const config = getRuntimeConfig();
const baseUrl =
  config.networkId === 'mainnet' ? config.mainnetUrl : config.testnetUrl;

const robots = (): MetadataRoute.Robots => ({
  rules: { allow: '/', userAgent: '*' },
  sitemap: `${baseUrl}/sitemap.xml`,
});

export default robots;
