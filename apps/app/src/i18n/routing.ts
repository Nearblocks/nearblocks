import { locales } from '@/utils/app/config';
import { createNavigation } from 'next-intl/navigation';
import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  defaultLocale: 'en',
  localePrefix: 'as-needed',
  localeDetection: true,
  localeCookie: false,
  locales: locales,
});

export type Locale = (typeof routing.locales)[number];

export const {
  Link,
  redirect,
  usePathname,
  useRouter: useIntlRouter,
} = createNavigation(routing);
