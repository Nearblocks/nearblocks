'use client';

import { LinkProps } from 'next/link';
import { usePathname } from 'next/navigation';
import { PropsWithChildren, useMemo } from 'react';

import { supportedLocales } from '@/locales/config';

import { Link } from './link';

const getLinkUrl = (href: LinkProps['href'], as?: LinkProps['as']): string => {
  if (as) return as.toString();

  return href.toString();
};

type Props = PropsWithChildren<LinkProps & { className?: string }>;

export const ActiveLink = ({ children, ...props }: Props) => {
  const pathname = usePathname();
  const isActive = useMemo(() => {
    if (pathname) {
      const linkUrl = getLinkUrl(props.href, props.as);

      if (linkUrl === pathname) return true;

      const segments = pathname.split('/').filter(Boolean);

      if (
        segments.length > 0 &&
        supportedLocales.some((locale) => locale === segments[0])
      ) {
        const activePathname = `/${segments.slice(1).join('/')}`;

        if (linkUrl === activePathname) return true;
      }
    }

    return false;
  }, [pathname, props.as, props.href]);

  return (
    <Link {...props} data-active={isActive}>
      {children}
    </Link>
  );
};
