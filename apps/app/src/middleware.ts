import { NextRequest, NextResponse } from 'next/server';
import { routing } from './i18n/routing';
import createIntlMiddleware from 'next-intl/middleware';

const routes = [
  '',
  'blocks',
  'address',
  'testing',
  'token',
  'charts',
  'txns',
  'hash',
  'tokens',
  'tokentxns',
  'nft-tokens',
  'nft-tokentxns',
  'node-explorer',
  'advertise',
  'about',
  'contact',
  'terms-and-conditions',
  'apis',
  'exportdata',
  'verify-contract',
  ...routing.locales,
];

const intlMiddleware = createIntlMiddleware(routing, {
  localeDetection: false,
});

export default async function middleware(request: NextRequest) {
  const [, locale] = request.nextUrl.pathname.split('/');

  if (!routes?.includes(locale)) {
    return NextResponse.rewrite(new URL('/404', request.url));
  }

  const response = await intlMiddleware(request);

  return response || NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next|_vercel|.*\\..*).*)',
    '/(en|kr|id|zh-cn|zh-hk|ua|ru|es|vi|ph|fr|jp|th|it)/:path*',
    '/([\\w-]+)?/address/(.+)',
    '/([\\w-]+)?/token/(.+)',
  ],
};
