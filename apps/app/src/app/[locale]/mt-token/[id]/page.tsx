import { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

import Overview from '@/components/app/Tokens/MT/Overview';
import MTTokenOverviewSkeleton from '@/components/app/skeleton/mt/MTTokenOverviewSkeleton';

export default async function TokenIndex(props: {
  params: Promise<{ id: string; locale: string }>;
  searchParams: Promise<{
    a: string;
  }>;
}) {
  const params = await props.params;

  const { id } = params;

  return (
    <ErrorBoundary fallback={<MTTokenOverviewSkeleton error />}>
      <Suspense fallback={<MTTokenOverviewSkeleton />}>
        <Overview id={id} />
      </Suspense>
    </ErrorBoundary>
  );
}
