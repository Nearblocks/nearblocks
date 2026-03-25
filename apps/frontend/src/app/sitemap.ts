import { readFileSync } from 'fs';
import path from 'path';

import type { MetadataRoute } from 'next';

import { getRuntimeConfig } from '@/lib/config';
import { supportedLocales } from '@/locales/config';

export const dynamic = 'force-dynamic';

const loadManifest = () => {
  const candidates = [
    path.join(process.cwd(), '.next/routes-manifest.json'),
    path.join(process.cwd(), 'apps/frontend/.next/routes-manifest.json'),
  ];

  for (const p of candidates) {
    try {
      return JSON.parse(readFileSync(p, 'utf-8'));
    } catch {}
  }

  throw new Error('routes-manifest.json not found');
};

const getStaticRoutes = (): string[] => {
  const manifest = loadManifest();

  return (manifest.dynamicRoutes as Array<{ page: string }>)
    .map((r) => r.page)
    .filter((page) => {
      if (!page.startsWith('/[lang]')) return false;
      const rest = page.slice('/[lang]'.length);
      if (rest.includes('[')) return false;
      const lastSegment = rest.split('/').at(-1) ?? '';

      return !/^(opengraph-image|twitter-image|icon|apple-icon|favicon)/.test(
        lastSegment,
      );
    })
    .map((page) => page.slice('/[lang]'.length) || '')
    .sort();
};

const sitemap = (): MetadataRoute.Sitemap => {
  const config = getRuntimeConfig();

  return getStaticRoutes().map((route) => ({
    alternates: {
      languages: Object.fromEntries(
        supportedLocales.map((locale) => [
          locale,
          `${config.siteUrl}/${locale}${route}`,
        ]),
      ),
    },
    changeFrequency: route === '' ? 'hourly' : 'daily',
    lastModified: new Date(),
    priority: route === '' ? 1.0 : 0.8,
    url: `${config.siteUrl}${route}`,
  }));
};

export default sitemap;
