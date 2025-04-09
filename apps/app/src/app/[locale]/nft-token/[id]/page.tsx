import { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import NFTTokenTabSkeletion from '@/components/app/skeleton/nft/NFTTokenTab';
import NFTOverview from '@/components/app/Tokens/NFT/NFTOverview';
import NFTTokenTab from '@/components/app/Tokens/NFT/NFTTokenTab';
import OverViewSkelton from '@/components/app/skeleton/nft/OverViewSkelton';

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
    <div className="relative container-xxl mx-auto px-4">
      <ErrorBoundary fallback={<OverViewSkelton error />}>
        <Suspense fallback={<OverViewSkelton />}>
          <NFTOverview id={id} searchParams={searchParams} />
        </Suspense>
      </ErrorBoundary>
      <ErrorBoundary
        fallback={
          <NFTTokenTabSkeletion
            error
            id={id}
            tab={searchParams?.tab || 'transfers'}
          />
        }
      >
        <Suspense
          fallback={
            <NFTTokenTabSkeletion
              id={id}
              tab={searchParams?.tab || 'transfers'}
            />
          }
        >
          <NFTTokenTab id={id} searchParams={searchParams} />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}
