import { ReactNode } from 'react';

type Props = {
  children: () => ReactNode;
  fallback: ReactNode;
  loading: boolean;
};

export const SkeletonSlot = ({ children, fallback, loading }: Props) => {
  if (loading) {
    return <>{fallback}</>;
  }

  return <>{children()}</>;
};
