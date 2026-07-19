import { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

import { ErrorFallback } from '@/components/error-fallback';

type Props = {
  children: React.ReactNode;
  // Optional override for the error state. Defaults to a retry card so a
  // failed section never masquerades as an eternally-loading skeleton.
  // Boundaries with `fallback={null}` (optional sections) also fail silent.
  errorFallback?: React.ReactNode;
  fallback: React.ReactNode;
};

export const ErrorSuspense = ({ children, errorFallback, fallback }: Props) => {
  const onError =
    errorFallback !== undefined ? (
      errorFallback
    ) : fallback === null ? null : (
      <ErrorFallback />
    );

  return (
    <ErrorBoundary fallback={onError}>
      <Suspense fallback={fallback}>{children}</Suspense>
    </ErrorBoundary>
  );
};
