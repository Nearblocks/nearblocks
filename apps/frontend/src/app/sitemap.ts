import type { MetadataRoute } from 'next';

import { getRuntimeConfig } from '@/lib/config';
import { supportedLocales } from '@/locales/config';

const staticRoutes = [
  '',
  '/blocks',
  '/txns',
  '/tokens',
  '/nft-tokens',
  '/charts',
  '/validators',
  '/about',
  '/contact',
  '/advertise',
  '/apis',
  '/privacy-policy',
  '/terms',
];

const config = getRuntimeConfig();
const baseUrl =
  config.networkId === 'mainnet' ? config.mainnetUrl : config.testnetUrl;

const sitemap = (): MetadataRoute.Sitemap =>
  staticRoutes.map((route) => ({
    alternates: {
      languages: Object.fromEntries(
        supportedLocales.map((locale) => [
          locale,
          `${baseUrl}/${locale}${route}`,
        ]),
      ),
    },
    changeFrequency: route === '' ? 'hourly' : 'daily',
    lastModified: new Date(),
    priority: route === '' ? 1.0 : 0.8,
    url: `${baseUrl}${route}`,
  }));

export default sitemap;
