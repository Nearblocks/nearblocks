import { LuLoaderCircle } from 'react-icons/lu';

import { cn } from '@/lib/utils';

const Spinner = ({ className, ...props }: React.ComponentProps<'svg'>) => {
  return (
    <LuLoaderCircle
      aria-label="Loading"
      className={cn('size-4 animate-spin', className)}
      role="status"
      {...props}
    />
  );
};

export { Spinner };
