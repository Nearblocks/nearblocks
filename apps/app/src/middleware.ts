import createMiddleware from 'next-intl/middleware';

import { routing } from './i18n/routing';
import { NextRequest, NextResponse } from 'next/server';
import { locales } from '@/utils/app/config';

const nextIntlMiddleware = createMiddleware(routing);

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const localeCookie = request.cookies.get('NEXT_LOCALE')?.value;

  if (!localeCookie || !locales.includes(localeCookie)) {
    return nextIntlMiddleware(request);
  }
  const currentLocale = locales.find(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`),
  );

  const needsRedirect =
    currentLocale !== localeCookie &&
    !(currentLocale === undefined && localeCookie === routing.defaultLocale);

  if (needsRedirect) {
    const url = request.nextUrl.clone();
    const pathWithoutLocale = currentLocale
      ? pathname.replace(new RegExp(`^/${currentLocale}`), '') || '/'
      : pathname;
    url.pathname =
      localeCookie === routing.defaultLocale
        ? pathWithoutLocale
        : `/${localeCookie}${
            pathWithoutLocale === '/' ? '' : pathWithoutLocale
          }`;

    return NextResponse.redirect(url);
  }
  return nextIntlMiddleware(request);
}

export const config = {
  matcher: [
    '/((?!api|_next|_vercel|.*\\..*).*)',
    '/(en|kr|id|zh-cn|zh-hk|ua|ru|es|vi|ph|fr|jp|th|it)/:path*',
    '/([\\w-]+)?/address/(.+)',
    '/([\\w-]+)?/token/(.+)',
    '/([\\w-]+)?/nft-token/(.+)',
    '/([\\w-]+)?/mt-token/(.+)',
    '/([\\w-]+)?/node-explorer/(.+)',
    '/([\\w-]+)?/apis/:path*',
  ],
};
