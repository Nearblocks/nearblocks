'use client';

import OGLink, { LinkProps, useLinkStatus } from 'next/link';
import { usePathname } from 'next/navigation';
import {
  AnchorHTMLAttributes,
  PropsWithChildren,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { cn } from '@/lib/utils';
import { supportedLocales } from '@/locales/config';
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
  textClassName?: string;
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

export const Link = ({ children, className, ...props }: Props) => {
  return (
    <OGLink
      {...props}
      className={cn(
        className,
        '[&:has([data-link-pending=true])]:cursor-progress',
      )}
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
      const linkUrl = getLinkUrl(props.href, props.as);

      if (isPathActive(linkUrl, pathname, exact)) return true;

      const segments = pathname.split('/').filter(Boolean);

      if (
        segments.length > 0 &&
        supportedLocales.some((locale) => locale === segments[0])
      ) {
        const activePathname = `/${segments.slice(1).join('/')}`;

        if (isPathActive(linkUrl, activePathname, exact)) return true;
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
          text={account}
        />
        {!hideCopy && <TruncateCopy text={account} />}
      </Truncate>
    </Link>
  );
};
