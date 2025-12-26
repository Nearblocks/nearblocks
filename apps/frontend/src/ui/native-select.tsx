import * as React from 'react';
import { LuChevronDown } from 'react-icons/lu';

import { cn } from '@/lib/utils';

const NativeSelect = ({
  className,
  size = 'default',
  ...props
}: Omit<React.ComponentProps<'select'>, 'size'> & {
  size?: 'default' | 'sm';
}) => {
  return (
    <div
      className="group/native-select relative w-fit has-[select:disabled]:opacity-50"
      data-slot="native-select-wrapper"
    >
      <select
        className={cn(
          'border-input placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 dark:hover:bg-input/50 text-body-sm h-9 w-full min-w-0 appearance-none rounded-md border bg-transparent px-3 py-2 pr-9 shadow-xs transition-[color,box-shadow] outline-none disabled:pointer-events-none disabled:cursor-not-allowed data-[size=sm]:h-8 data-[size=sm]:py-1',
          'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
          'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
          className,
        )}
        data-size={size}
        data-slot="native-select"
        {...props}
      />
      <LuChevronDown
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 right-3.5 size-4 -translate-y-1/2 opacity-50 select-none"
        data-slot="native-select-icon"
      />
    </div>
  );
};

const NativeSelectOption = ({ ...props }: React.ComponentProps<'option'>) => {
  return <option data-slot="native-select-option" {...props} />;
};

const NativeSelectOptGroup = ({
  className,
  ...props
}: React.ComponentProps<'optgroup'>) => {
  return (
    <optgroup
      className={cn(className)}
      data-slot="native-select-optgroup"
      {...props}
    />
  );
};

export { NativeSelect, NativeSelectOptGroup, NativeSelectOption };
