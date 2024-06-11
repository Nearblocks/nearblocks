import { ReactNode } from 'react';

type SkeletonProps = {
  children?: ReactNode;
  className?: string;
  inline?: boolean;
  loading?: boolean;
};

const Skeleton = ({
  children,
  className,
  inline = false,
  loading = false,
}: SkeletonProps) => {
  const classNames = loading
    ? `font-skeleton bg-bg-skeleton animate-pulse rounded-lg bg-none bg-clip-border shadow-none box-decoration-clone text-transparent pointer-events-none select-none cursor-default border-[none] *:invisible ${
        inline ? 'leading-[0]' : 'inline-flex leading-[1]'
      } ${className}`
    : '';

  return <span className={classNames}>{children}</span>;
};

export default Skeleton;
