import { cn } from '@/lib/utils';

const Skeleton = ({ className, ...props }: React.ComponentProps<'span'>) => {
  return (
    <span
      className={cn(
        'bg-accent inline-flex animate-pulse rounded-md leading-[inherit]',
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
