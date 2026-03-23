import type { MetadataRoute } from 'next';

import { getRuntimeConfig } from '@/lib/config';

export const dynamic = 'force-dynamic';

const robots = (): MetadataRoute.Robots => {
  const config = getRuntimeConfig();
  const baseUrl =
    config.networkId === 'mainnet' ? config.mainnetUrl : config.testnetUrl;

  return {
    rules: { allow: '/', userAgent: '*' },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
};

export default robots;
