import type { Locale } from '@/locales/config';
import { supportedLocales } from '@/locales/config';

export const pathnameWithoutLocale = (pathname: string): string => {
  const segments = pathname.split('/').filter(Boolean);
  if (segments.length === 0) return '/';

  const [first, ...rest] = segments;
  if (!supportedLocales.some((l) => l === first)) {
    return pathname.startsWith('/') ? pathname : `/${pathname}`;
  }

  if (rest.length === 0) return '/';

  return `/${rest.join('/')}`;
};

export const hrefForLocale = (pathname: string, locale: Locale): string => {
  const base = pathnameWithoutLocale(pathname);
  if (base === '/') return `/${locale}`;

  return `/${locale}${base}`;
};
