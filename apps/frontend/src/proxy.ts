import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import { defaultLocale, supportedLocales } from '@/locales/config';

export const proxy = (request: NextRequest) => {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/_next/data/')) return NextResponse.next();

  const hasLocale = supportedLocales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`,
  );

  if (hasLocale) return NextResponse.next();

  request.nextUrl.pathname = `/${defaultLocale}${pathname}`;

  return NextResponse.redirect(request.nextUrl);
};

export const config = {
  matcher: [
    '/((?!api(?:/|$)|_next(?:/|$))(?!.*\\.[^/]+$).*)',
    '/:prefix(address|token|nft-token|mt-token|node-explorer)/:path*',
  ],
};
