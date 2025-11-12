import { locales } from '@/utils/app/config';
import { createNavigation } from 'next-intl/navigation';
import { defineRouting } from 'next-intl/routing';
import { ComponentProps } from 'react';

export const routing = defineRouting({
  defaultLocale: 'en',
  localePrefix: 'as-needed',
  localeDetection: true,
  localeCookie: false,
  locales: locales,
});

export type Locale = (typeof routing.locales)[number];

const {
  Link: IntlLink,
  redirect,
  usePathname,
  useRouter: useIntlRouter,
} = createNavigation(routing);

export const Link = (props: ComponentProps<typeof IntlLink>) => {
  return <IntlLink prefetch={false} {...props} />;
};

export { redirect, usePathname, useIntlRouter };
