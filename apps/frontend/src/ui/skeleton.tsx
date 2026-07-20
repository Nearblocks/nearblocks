import { cn } from '@/lib/utils';

const Skeleton = ({ className, ...props }: React.ComponentProps<'span'>) => {
  return (
    <span
      className={cn(
        'bg-accent inline-flex h-[1em] animate-pulse rounded-md align-middle',
        className,
      )}
      data-slot="skeleton"
      {...props}
    >
      &nbsp;
    </span>
  );
};

export { Skeleton };
