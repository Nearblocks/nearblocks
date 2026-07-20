'use client';

import {
  ChevronLeft,
  ChevronRight,
  Ellipsis,
  LoaderCircle,
} from 'lucide-react';
import { useLinkStatus } from 'next/link';
import * as React from 'react';

import { Link } from '@/components/link';
import { cn } from '@/lib/utils';
import { Button, buttonVariants } from '@/ui/button';

const Pagination = ({ className, ...props }: React.ComponentProps<'nav'>) => {
  return (
    <nav
      aria-label="pagination"
      className={cn('mx-auto flex w-full justify-center', className)}
      data-slot="pagination"
      role="navigation"
      {...props}
    />
  );
};

const PaginationContent = ({
  className,
  ...props
}: React.ComponentProps<'ul'>) => {
  return (
    <ul
      className={cn('flex flex-row items-center gap-1', className)}
      data-slot="pagination-content"
      {...props}
    />
  );
};

const PaginationItem = ({ ...props }: React.ComponentProps<'li'>) => {
  return <li data-slot="pagination-item" {...props} />;
};

type PaginationLinkProps = {
  isActive?: boolean;
} & Pick<React.ComponentProps<typeof Button>, 'size'> &
  React.ComponentProps<typeof Link>;

const PaginationLink = ({
  className,
  isActive,
  size = 'icon',
  ...props
}: PaginationLinkProps) => {
  return (
    <Link
      aria-current={isActive ? 'page' : undefined}
      className={cn(
        buttonVariants({
          size,
          variant: isActive ? 'secondary' : 'outline',
        }),
        className,
      )}
      data-active={isActive}
      data-slot="pagination-link"
      {...props}
    />
  );
};

// Swaps the chevron for a spinner when this link's navigation has been
// pending for a noticeable time, so slow pagination gives feedback.
const PendingIcon = ({ children }: { children: React.ReactNode }) => {
  const { pending } = useLinkStatus();
  const [slow, setSlow] = React.useState(false);

  React.useEffect(() => {
    if (pending) {
      const t = setTimeout(() => setSlow(true), 250);
      return () => clearTimeout(t);
    }
    setSlow(false);
    return;
  }, [pending]);

  if (slow) return <LoaderCircle className="animate-spin" />;

  return <>{children}</>;
};

const PaginationPrevious = ({
  className,
  ...props
}: React.ComponentProps<typeof PaginationLink>) => {
  return (
    <PaginationLink
      aria-label="Go to previous page"
      className={cn('gap-1 pr-2.5 pl-1.5!', className)}
      size="default"
      {...props}
    >
      <PendingIcon>
        <ChevronLeft />
      </PendingIcon>
      <span className="block">Prev</span>
    </PaginationLink>
  );
};

const PaginationNext = ({
  className,
  ...props
}: React.ComponentProps<typeof PaginationLink>) => {
  return (
    <PaginationLink
      aria-label="Go to next page"
      className={cn('gap-1 pr-1.5! pl-2.5', className)}
      size="default"
      {...props}
    >
      <span className="block">Next</span>
      <PendingIcon>
        <ChevronRight />
      </PendingIcon>
    </PaginationLink>
  );
};

const PaginationEllipsis = ({
  className,
  ...props
}: React.ComponentProps<'span'>) => {
  return (
    <span
      aria-hidden
      className={cn('flex size-9 items-center justify-center', className)}
      data-slot="pagination-ellipsis"
      {...props}
    >
      <Ellipsis className="size-4" />
      <span className="sr-only">More pages</span>
    </span>
  );
};

export {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
};
