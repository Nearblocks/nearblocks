import { routing } from './i18n/routing';
import createMiddleware from 'next-intl/middleware';

export default createMiddleware(routing);

export const config = {
  matcher: [
    '/((?!api|_next|_vercel|.*\\..*).*)',
    '/(en|kr|id|zh-cn|zh-hk|ua|ru|es|vi|ph|fr|jp|th|it)/:path*',
    '/([\\w-]+)?/address/(.+)',
    '/([\\w-]+)?/token/(.+)',
    '/([\\w-]+)?/nft-token/(.+)',
    '/([\\w-]+)?/node-explorer/(.+)',
    '/([\\w-]+)?/apis/:path*',
  ],
};
