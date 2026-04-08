import { cva } from 'class-variance-authority';
import { ChevronDown } from 'lucide-react';
import { NavigationMenu as NavigationMenuPrimitive } from 'radix-ui';
import * as React from 'react';

import { cn } from '@/lib/utils';

const NavigationMenu = ({
  children,
  className,
  viewport = true,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Root> & {
  viewport?: boolean;
}) => {
  return (
    <NavigationMenuPrimitive.Root
      className={cn(
        'group/navigation-menu relative flex max-w-max flex-1 items-center justify-center',
        className,
      )}
      data-slot="navigation-menu"
      data-viewport={viewport}
      {...props}
    >
      {children}
      {viewport && <NavigationMenuViewport />}
    </NavigationMenuPrimitive.Root>
  );
};

const NavigationMenuList = ({
  className,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.List>) => {
  return (
    <NavigationMenuPrimitive.List
      className={cn(
        'group flex flex-1 list-none items-center justify-center gap-1',
        className,
      )}
      data-slot="navigation-menu-list"
      {...props}
    />
  );
};

const NavigationMenuItem = ({
  className,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Item>) => {
  return (
    <NavigationMenuPrimitive.Item
      className={cn('relative', className)}
      data-slot="navigation-menu-item"
      {...props}
    />
  );
};

const navigationMenuTriggerStyle = cva(
  'group inline-flex h-9 w-max items-center justify-center px-3 py-2 text-foreground text-body-sm hover:text-link focus:text-link disabled:pointer-events-none disabled:opacity-50 data-[state=open]:text-link focus-visible:ring-ring/50 outline-none transition-[color,box-shadow] focus-visible:ring-[3px] focus-visible:outline-1',
);

const NavigationMenuTrigger = ({
  children,
  className,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Trigger>) => {
  return (
    <NavigationMenuPrimitive.Trigger
      className={cn(navigationMenuTriggerStyle(), 'group cursor-pointer', className)}
      data-slot="navigation-menu-trigger"
      id={`navigation-menu-trigger-${props.id}`}
      {...props}
    >
      {children}{' '}
      <ChevronDown
        aria-hidden="true"
        className="relative top-px ml-1 size-3.5 transition duration-300 group-data-[state=open]:rotate-180"
      />
    </NavigationMenuPrimitive.Trigger>
  );
};

const NavigationMenuContent = ({
  className,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Content>) => {
  return (
    <NavigationMenuPrimitive.Content
      className={cn(
        'data-[motion^=from-]:fade-in data-[motion^=to-]:fade-out top-0 left-0 w-full p-2 pr-2.5 md:absolute md:w-auto',
        'group-data-[viewport=false]/navigation-menu:bg-popover group-data-[viewport=false]/navigation-menu:text-popover-foreground group-data-[viewport=false]/navigation-menu:data-[state=open]:fade-in-0 group-data-[viewport=false]/navigation-menu:data-[state=closed]:fade-out-0 group-data-[viewport=false]/navigation-menu:top-full group-data-[viewport=false]/navigation-menu:mt-1.5 group-data-[viewport=false]/navigation-menu:overflow-hidden group-data-[viewport=false]/navigation-menu:rounded-md group-data-[viewport=false]/navigation-menu:border group-data-[viewport=false]/navigation-menu:border-t-[3px] group-data-[viewport=false]/navigation-menu:border-t-link group-data-[viewport=false]/navigation-menu:shadow group-data-[viewport=false]/navigation-menu:duration-100 **:data-[slot=navigation-menu-link]:focus:ring-0 **:data-[slot=navigation-menu-link]:focus:outline-none',
        className,
      )}
      data-slot="navigation-menu-content"
      {...props}
    />
  );
};

const NavigationMenuViewport = ({
  className,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Viewport>) => {
  return (
    <div
      className={cn(
        'absolute top-full left-0 isolate z-50 flex justify-center',
      )}
    >
      <NavigationMenuPrimitive.Viewport
        className={cn(
          'origin-top-center bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-90 relative mt-1.5 h-(--radix-navigation-menu-viewport-height) w-full overflow-hidden rounded-md border border-t-2 border-t-primary shadow duration-150 md:w-(--radix-navigation-menu-viewport-width)',
          className,
        )}
        data-slot="navigation-menu-viewport"
        {...props}
      />
    </div>
  );
};

const NavigationMenuLink = ({
  className,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Link>) => {
  return (
    <NavigationMenuPrimitive.Link
      className={cn(
        "data-[active=true]:text-link hover:text-link focus:text-link focus-visible:ring-ring/50 [&_svg:not([class*='text-'])]:text-popover-foreground text-headline-sm flex flex-col gap-1 rounded-sm p-2 transition-all outline-none focus-visible:ring-[3px] focus-visible:outline-1 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      data-slot="navigation-menu-link"
      {...props}
    />
  );
};

const NavigationMenuIndicator = ({
  className,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Indicator>) => {
  return (
    <NavigationMenuPrimitive.Indicator
      className={cn(
        'data-[state=visible]:animate-in data-[state=hidden]:animate-out data-[state=hidden]:fade-out data-[state=visible]:fade-in top-full z-1 flex h-1.5 items-end justify-center overflow-hidden',
        className,
      )}
      data-slot="navigation-menu-indicator"
      {...props}
    >
      <div className="bg-border relative top-[60%] h-2 w-2 rotate-45 rounded-tl-sm shadow-md" />
    </NavigationMenuPrimitive.Indicator>
  );
};

export {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuIndicator,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
  NavigationMenuViewport,
};
