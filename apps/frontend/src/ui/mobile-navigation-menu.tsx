'use client';

import { cva } from 'class-variance-authority';
import { ComponentProps, HTMLAttributes } from 'react';

import { ActiveLink } from '@/components/active-link';
import { cn } from '@/lib/utils';

import { CollapsibleTrigger } from './collapsible';

const mobileNavigationLinkStyle = cva(
  'data-[active=true]:focus:bg-muted data-[active=true]:hover:bg-muted data-[active=true]:bg-muted/50 data-[active=true]:text-link hover:bg-muted hover:text-link focus:bg-muted focus:text-link focus-visible:ring-ring/50 text-headline-sm flex h-9 items-center gap-1 rounded-sm px-4 transition-all outline-none focus-visible:ring-[3px] focus-visible:outline-1',
);

const mobileNavigationCollapsibleTriggerStyle = cva(
  'group data-[active=true]:focus:bg-muted data-[active=true]:hover:bg-muted data-[active=true]:bg-muted/50 data-[active=true]:text-link bg-card text-foreground text-headline-sm hover:bg-muted hover:text-link focus:bg-muted focus:text-link data-[state=open]:hover:bg-muted data-[state=open]:text-link data-[state=open]:focus:bg-muted data-[state=open]:bg-muted/50 focus-visible:ring-ring/50 flex h-9 w-full items-center justify-between gap-1 rounded-md px-4 transition-[color,box-shadow] outline-none focus-visible:ring-[3px] focus-visible:outline-1 disabled:pointer-events-none disabled:opacity-50',
);

type MobileNavigationMenuProps = HTMLAttributes<HTMLUListElement>;

const MobileNavigationMenu = ({
  className,
  ...props
}: MobileNavigationMenuProps) => {
  return (
    <nav>
      <ul className={cn('space-y-2', className)} {...props} />
    </nav>
  );
};

type MobileNavigationMenuItemProps = HTMLAttributes<HTMLLIElement>;

const MobileNavigationMenuItem = ({
  className,
  ...props
}: MobileNavigationMenuItemProps) => {
  return <li className={cn(className)} {...props} />;
};

type MobileNavigationMenuLinkProps = ComponentProps<typeof ActiveLink>;

const MobileNavigationMenuLink = ({
  className,
  ...props
}: MobileNavigationMenuLinkProps) => {
  return (
    <ActiveLink
      className={cn(mobileNavigationLinkStyle(), className)}
      {...props}
    />
  );
};

type MobileNavigationMenuCollapsibleTriggerProps = ComponentProps<
  typeof CollapsibleTrigger
>;

const MobileNavigationMenuCollapsibleTrigger = ({
  className,
  ...props
}: MobileNavigationMenuCollapsibleTriggerProps) => {
  return (
    <CollapsibleTrigger
      className={cn(mobileNavigationCollapsibleTriggerStyle(), className)}
      {...props}
    />
  );
};

export {
  mobileNavigationCollapsibleTriggerStyle,
  mobileNavigationLinkStyle,
  MobileNavigationMenu,
  MobileNavigationMenuCollapsibleTrigger,
  MobileNavigationMenuItem,
  MobileNavigationMenuLink,
};
