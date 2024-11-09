import { createSharedPathnamesNavigation } from 'next-intl/navigation';
import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  defaultLocale: 'en',
  localePrefix: 'as-needed',
  locales: [
    'en',
    'kr',
    'id',
    'zh-cn',
    'zh-hk',
    'ua',
    'ru',
    'es',
    'vi',
    'ph',
    'fr',
    'jp',
    'th',
    'it',
  ],
});

export type Locale = (typeof routing.locales)[number];

export const {
  Link,
  redirect,
  usePathname,
  useRouter: useIntlRouter,
} = createSharedPathnamesNavigation(routing);
