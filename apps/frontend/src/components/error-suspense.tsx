import { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

type Props = {
  children: React.ReactNode;
  fallback: React.ReactNode;
};

export const ErrorSuspense = ({ children, fallback }: Props) => {
  return (
    <ErrorBoundary fallback={fallback}>
      <Suspense fallback={fallback}>{children}</Suspense>
    </ErrorBoundary>
  );
};
