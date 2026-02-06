import { Slot as SlotPrimitive } from 'radix-ui';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center justify-center rounded-md px-2 w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none overflow-hidden',
  {
    defaultVariants: {
      variant: 'gray',
    },
    variants: {
      variant: {
        amber: 'bg-amber-background text-amber-foreground',
        blue: 'bg-blue-background text-blue-foreground',
        gray: 'bg-gray-background text-gray-foreground',
        lime: 'bg-lime-background text-lime-foreground',
        pink: 'bg-pink-background text-pink-foreground',
        purple: 'bg-purple-background text-purple-foreground',
        red: 'bg-red-background text-red-foreground',
        teal: 'bg-teal-background text-teal-foreground',
      },
    },
  },
);

const Badge = ({
  asChild = false,
  className,
  variant,
  ...props
}: React.ComponentProps<'span'> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) => {
  const Comp = asChild ? SlotPrimitive.Slot : 'span';

  return (
    <Comp
      className={cn(badgeVariants({ variant }), className)}
      data-slot="badge"
      {...props}
    />
  );
};

export { Badge, badgeVariants };
