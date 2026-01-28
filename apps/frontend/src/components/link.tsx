'use client';

import OGLink, { LinkProps, useLinkStatus } from 'next/link';
import { usePathname } from 'next/navigation';
import { AnchorHTMLAttributes, PropsWithChildren, useMemo } from 'react';

import { cn } from '@/lib/utils';
import { supportedLocales } from '@/locales/config';
import { useHighlightStore } from '@/stores/highlight';

import { Truncate, TruncateCopy, TruncateText } from './truncate';

type Props = PropsWithChildren<LinkProps> &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> & {
    className?: string;
  };

type ActiveLinkProps = PropsWithChildren<LinkProps & { className?: string }>;

type AccountLinkProps = {
  account?: null | string;
  className?: string;
  hideCopy?: boolean;
  textClassName?: string;
};

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
