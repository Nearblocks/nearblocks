import { useTheme } from 'next-themes';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import { ReactNode } from 'react';

interface LoaderProps {
  count?: number;
  className?: string;
  wrapperClassName?: string;
  children?: ReactNode;
  [key: string]: any;
}

const Loader = ({
  count = 1,
  className,
  wrapperClassName,
  ...props
}: LoaderProps) => {
  const { theme } = useTheme();
  const Wrapper = (props: { children?: ReactNode }) => (
    <div className={wrapperClassName} {...props} />
  );
  const baseColor = theme === 'dark' ? '#1f2228' : '#e5e7eb';
  const highlightColor = theme === 'dark' ? '#444' : '#f0f0f0';

  if (!theme) {
    return null;
  }

  return (
    <SkeletonTheme baseColor={baseColor} highlightColor={highlightColor}>
      <Skeleton
        count={count}
        className={className}
        wrapper={Wrapper}
        {...props}
      />
    </SkeletonTheme>
  );
};

export default Loader;
