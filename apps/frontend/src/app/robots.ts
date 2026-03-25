import type { MetadataRoute } from 'next';

import { getRuntimeConfig } from '@/lib/config';

export const dynamic = 'force-dynamic';

const robots = (): MetadataRoute.Robots => {
  const config = getRuntimeConfig();

  return {
    rules: { allow: '/', userAgent: '*' },
    sitemap: `${config.siteUrl}/sitemap.xml`,
  };
};

export default robots;
