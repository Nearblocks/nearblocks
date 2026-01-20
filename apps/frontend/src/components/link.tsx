'use client';

import OGLink, { LinkProps, useLinkStatus } from 'next/link';
import { usePathname } from 'next/navigation';
import { AnchorHTMLAttributes, PropsWithChildren, useMemo } from 'react';

import { cn } from '@/lib/utils';
import { supportedLocales } from '@/locales/config';

type Props = PropsWithChildren<LinkProps> &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> & {
    className?: string;
  };

type ActiveLinkProps = PropsWithChildren<LinkProps & { className?: string }>;

export const Link = ({ children, className, ...props }: Props) => {
  const { pending } = useLinkStatus();

  return (
    <OGLink
      {...props}
      aria-busy={pending ? 'true' : undefined}
      className={cn(className, {
        'pointer-events-none cursor-progress': pending,
      })}
    >
      {children}
    </OGLink>
  );
};

const getLinkUrl = (href: LinkProps['href'], as?: LinkProps['as']): string => {
  if (as) return as.toString();

  return href.toString();
};

export const ActiveLink = ({ children, ...props }: ActiveLinkProps) => {
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
