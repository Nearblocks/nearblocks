'use client';

import type { UrlObject } from 'url';

import OGLink, { LinkProps, useLinkStatus } from 'next/link';
import { usePathname } from 'next/navigation';
import {
  AnchorHTMLAttributes,
  PropsWithChildren,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { useLocale } from '@/hooks/use-locale';
import { cn } from '@/lib/utils';
import type { Locale } from '@/locales/config';
import { defaultLocale, supportedLocales } from '@/locales/config';
import { useHighlightStore } from '@/stores/highlight';

import { Truncate, TruncateCopy, TruncateText } from './truncate';

type Props = PropsWithChildren<LinkProps> &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> & {
    className?: string;
  };

type ActiveLinkProps = PropsWithChildren<
  LinkProps & { className?: string; exact?: boolean }
>;

type AccountLinkProps = {
  account?: null | string;
  className?: string;
  hideCopy?: boolean;
  name?: string;
  textClassName?: string;
};

const localizeHref = (
  href: LinkProps['href'],
  locale: Locale,
): LinkProps['href'] => {
  if (locale === defaultLocale) return href;

  if (typeof href === 'object' && href !== null) {
    const pathname = (href as UrlObject).pathname;
    if (!pathname || typeof pathname !== 'string') return href;
    const localized = localizeHref(pathname, locale);
    return { ...href, pathname: localized as string };
  }

  const hrefStr = href.toString();
  if (
    supportedLocales.some(
      (l) => hrefStr === `/${l}` || hrefStr.startsWith(`/${l}/`),
    )
  )
    return href;
  if (hrefStr.startsWith('//')) return href;
  if (hrefStr === '/') return `/${locale}`;
  if (hrefStr.startsWith('/')) return `/${locale}${hrefStr}`;

  return href;
};

const PendingMarker = () => {
  const { pending } = useLinkStatus();
  const [delayedPending, setDelayedPending] = useState(false);

  useEffect(() => {
    if (pending) {
      const timeout = setTimeout(() => setDelayedPending(true), 250);
      return () => clearTimeout(timeout);
    }
    setDelayedPending(false);
    return;
  }, [pending]);

  return (
    <span
      aria-hidden="true"
      className="hidden"
      data-link-pending={delayedPending}
    />
  );
};

export const Link = ({ children, className, href, ...props }: Props) => {
  const { locale } = useLocale();

  const localizedHref = useMemo(
    () => localizeHref(href, locale),
    [href, locale],
  );

  return (
    <OGLink
      {...props}
      className={cn(
        className,
        '[&:has([data-link-pending=true])]:cursor-progress',
      )}
      href={localizedHref}
    >
      <PendingMarker />
      {children}
    </OGLink>
  );
};

const getLinkUrl = (href: LinkProps['href'], as?: LinkProps['as']): string => {
  if (as) return as.toString();

  return href.toString();
};

const stripDefaultLocalePrefix = (path: string): string => {
  const prefix = `/${defaultLocale}`;
  if (path === prefix || path === `${prefix}/`) return '/';
  if (path.startsWith(`${prefix}/`)) return path.slice(prefix.length);

  return path;
};

const linkHasAnyLocalePrefix = (path: string) =>
  supportedLocales.some((l) => path === `/${l}` || path.startsWith(`/${l}/`));

const isPathActive = (
  linkUrl: string,
  pathname: string,
  exact: boolean,
): boolean => {
  if (exact) return linkUrl === pathname;

  return linkUrl === pathname || pathname.startsWith(linkUrl + '/');
};

export const ActiveLink = ({
  children,
  exact = true,
  ...props
}: ActiveLinkProps) => {
  const pathname = usePathname();
  const isActive = useMemo(() => {
    if (pathname) {
      const rawLinkUrl = getLinkUrl(props.href, props.as);
      const linkUrl = stripDefaultLocalePrefix(rawLinkUrl);
      const pathForMatch = stripDefaultLocalePrefix(pathname);

      if (isPathActive(linkUrl, pathForMatch, exact)) return true;

      const segments = pathname.split('/').filter(Boolean);

      if (
        !linkHasAnyLocalePrefix(rawLinkUrl) &&
        segments.length > 0 &&
        supportedLocales.some((locale) => locale === segments[0])
      ) {
        const activePathname = `/${segments.slice(1).join('/')}`;

        if (
          activePathname !== '/' &&
          isPathActive(linkUrl, activePathname, exact)
        )
          return true;
      }
    }

    return false;
  }, [exact, pathname, props.as, props.href]);

  return (
    <Link {...props} data-active={isActive}>
      {children}
    </Link>
  );
};

export const AccountLink = ({
  account,
  className,
  hideCopy = false,
  name,
  textClassName,
}: AccountLinkProps) => {
  const { highlighted, setHighlighted } = useHighlightStore();

  const onEnter = () => setHighlighted(account ?? null);
  const onLeave = () => setHighlighted(null);

  if (!account || account === 'system')
    return <span className="text-muted-foreground px-1">system</span>;

  return (
    <Link className={cn('text-link', className)} href={`/address/${account}`}>
      <Truncate>
        <TruncateText
          className={cn(
            textClassName,
            'rounded-md border border-transparent px-1',
            {
              'bg-amber-background border-amber-foreground/20 border-dashed':
                highlighted === account,
            },
          )}
          onMouseEnter={onEnter}
          onMouseLeave={onLeave}
          text={name ?? account}
        />
        {!hideCopy && <TruncateCopy text={account} />}
      </Truncate>
    </Link>
  );
};
