import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '@/lib/utils';
import { Separator } from '@/ui/separator';

const ItemGroup = ({ className, ...props }: React.ComponentProps<'div'>) => {
  return (
    <div
      className={cn('group/item-group flex flex-col', className)}
      data-slot="item-group"
      role="list"
      {...props}
    />
  );
};

const ItemSeparator = ({
  className,
  ...props
}: React.ComponentProps<typeof Separator>) => {
  return (
    <Separator
      className={cn('my-0', className)}
      data-slot="item-separator"
      orientation="horizontal"
      {...props}
    />
  );
};

const itemVariants = cva(
  'group/item flex items-center border border-transparent text-body-sm rounded-md transition-colors [a]:hover:bg-accent/50 [a]:transition-colors duration-100 flex-wrap outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
  {
    defaultVariants: {
      size: 'default',
      variant: 'default',
    },
    variants: {
      size: {
        default: 'p-4 gap-4 ',
        sm: 'py-3 px-4 gap-2.5',
      },
      variant: {
        default: 'bg-transparent',
        muted: 'bg-muted/50',
        outline: 'border-border',
      },
    },
  },
);

const Item = ({
  asChild = false,
  className,
  size = 'default',
  variant = 'default',
  ...props
}: React.ComponentProps<'div'> &
  VariantProps<typeof itemVariants> & { asChild?: boolean }) => {
  const Comp = asChild ? Slot : 'div';
  return (
    <Comp
      className={cn(itemVariants({ className, size, variant }))}
      data-size={size}
      data-slot="item"
      data-variant={variant}
      {...props}
    />
  );
};

const itemMediaVariants = cva(
  'flex shrink-0 items-center justify-center gap-2 group-has-[[data-slot=item-description]]/item:self-start [&_svg]:pointer-events-none group-has-[[data-slot=item-description]]/item:translate-y-0.5',
  {
    defaultVariants: {
      variant: 'default',
    },
    variants: {
      variant: {
        default: 'bg-transparent',
        icon: "size-8 border rounded-sm bg-muted [&_svg:not([class*='size-'])]:size-4",
        image:
          'size-10 rounded-sm overflow-hidden [&_img]:size-full [&_img]:object-cover',
      },
    },
  },
);

const ItemMedia = ({
  className,
  variant = 'default',
  ...props
}: React.ComponentProps<'div'> & VariantProps<typeof itemMediaVariants>) => {
  return (
    <div
      className={cn(itemMediaVariants({ className, variant }))}
      data-slot="item-media"
      data-variant={variant}
      {...props}
    />
  );
};

const ItemContent = ({ className, ...props }: React.ComponentProps<'div'>) => {
  return (
    <div
      className={cn(
        'flex flex-1 flex-col gap-1 [&+[data-slot=item-content]]:flex-none',
        className,
      )}
      data-slot="item-content"
      {...props}
    />
  );
};

const ItemTitle = ({ className, ...props }: React.ComponentProps<'div'>) => {
  return (
    <div
      className={cn(
        'text-body-sm flex w-fit items-center gap-2 leading-snug',
        className,
      )}
      data-slot="item-title"
      {...props}
    />
  );
};

const ItemDescription = ({
  className,
  ...props
}: React.ComponentProps<'p'>) => {
  return (
    <p
      className={cn(
        'text-muted-foreground text-body-sm line-clamp-2 leading-normal font-normal text-balance',
        '[&>a:hover]:text-primary [&>a]:underline [&>a]:underline-offset-4',
        className,
      )}
      data-slot="item-description"
      {...props}
    />
  );
};

const ItemActions = ({ className, ...props }: React.ComponentProps<'div'>) => {
  return (
    <div
      className={cn('flex items-center gap-2', className)}
      data-slot="item-actions"
      {...props}
    />
  );
};

const ItemHeader = ({ className, ...props }: React.ComponentProps<'div'>) => {
  return (
    <div
      className={cn(
        'flex basis-full items-center justify-between gap-2',
        className,
      )}
      data-slot="item-header"
      {...props}
    />
  );
};

const ItemFooter = ({ className, ...props }: React.ComponentProps<'div'>) => {
  return (
    <div
      className={cn(
        'flex basis-full items-center justify-between gap-2',
        className,
      )}
      data-slot="item-footer"
      {...props}
    />
  );
};

export {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemFooter,
  ItemGroup,
  ItemHeader,
  ItemMedia,
  ItemSeparator,
  ItemTitle,
};
