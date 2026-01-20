import { Slot } from '@radix-ui/react-slot';
import * as React from 'react';

import { cn } from '@/lib/utils';
import { Badge } from '@/ui/badge';

const TabLinks = ({ className, ...props }: React.ComponentProps<'div'>) => {
  return (
    <div
      className={cn(
        'bg-background text-muted-foreground inline-flex h-9 w-fit items-center justify-center gap-0.5 rounded-md border p-[2px]',
        className,
      )}
      data-slot="tab-links"
      {...props}
    />
  );
};

const TabLink = ({
  asChild = false,
  className,
  ...props
}: React.ComponentProps<'a'> & { asChild?: boolean }) => {
  const Comp = asChild ? Slot : 'a';

  return (
    <Comp
      className={cn(
        "data-[active=true]:bg-accent focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:outline-ring text-foreground text-body-sm hover:bg-accent/50 inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center rounded-md px-2 py-1 whitespace-nowrap transition-[color] focus-visible:ring-2 focus-visible:outline-1 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      data-slot="tab-link"
      {...props}
    />
  );
};

const TabBadge = ({
  className,
  ...props
}: React.ComponentProps<typeof Badge>) => {
  return (
    <Badge
      className={cn('ml-1 px-1 text-[8px] leading-normal', className)}
      {...props}
    />
  );
};

export { TabBadge, TabLink, TabLinks };
