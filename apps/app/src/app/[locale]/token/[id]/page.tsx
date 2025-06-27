import { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

import TokenTabSkeleton from '@/components/app/skeleton/ft/TokenTabSkeleton';
import Overview from '@/components/app/Tokens/FT/Overview';
import TokenTabs from '@/components/app/Tokens/FT/TokenTabs';
import TokenOverviewSkeleton from '@/components/app/skeleton/ft/TokenOverviewSkelton';

export default async function TokenIndex(props: {
  params: Promise<{ id: string; locale: string }>;
  searchParams: Promise<{
    cursor?: string;
    order: string;
    p?: string;
    tab: string;
  }>;
}) {
  const searchParams = await props.searchParams;
  const params = await props.params;

  const { id } = params;

  return (
    <>
      <ErrorBoundary fallback={<TokenOverviewSkeleton error />}>
        <Suspense fallback={<TokenOverviewSkeleton />}>
          <Overview id={id} searchParams={searchParams} />
        </Suspense>
      </ErrorBoundary>
      <ErrorBoundary
        fallback={
          <TokenTabSkeleton
            error
            tab={searchParams?.tab || 'transfers'}
            id={id}
          />
        }
      >
        <Suspense
          fallback={
            <TokenTabSkeleton tab={searchParams?.tab || 'transfers'} id={id} />
          }
        >
          <TokenTabs id={id} searchParams={searchParams} />
        </Suspense>
      </ErrorBoundary>
    </>
  );
}
