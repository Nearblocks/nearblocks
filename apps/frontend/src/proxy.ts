import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import { defaultLocale, supportedLocales } from '@/locales/config';

export const proxy = (request: NextRequest) => {
  const { pathname } = request.nextUrl;
  const pathnameHasLocale = supportedLocales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`,
  );

  if (pathnameHasLocale) return;

  request.nextUrl.pathname = `/${defaultLocale}${pathname}`;

  return NextResponse.redirect(request.nextUrl);
};

export const config = {
  matcher: ['/((?!_next|images).*)'],
};
