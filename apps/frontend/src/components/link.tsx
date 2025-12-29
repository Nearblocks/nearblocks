'use client';

import OGLink, { LinkProps, useLinkStatus } from 'next/link';
import { AnchorHTMLAttributes, PropsWithChildren } from 'react';

import { cn } from '@/lib/utils';

type Props = PropsWithChildren<LinkProps> &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> & {
    className?: string;
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
