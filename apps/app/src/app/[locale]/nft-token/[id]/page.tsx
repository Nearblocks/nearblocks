import { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

import ErrorMessage from '@/components/app/common/ErrorMessage';
import FaInbox from '@/components/app/Icons/FaInbox';
import NFTTokenTabSkeletion from '@/components/app/skeleton/nft/NFTTokenTab';
import NFTOverview from '@/components/app/Tokens/NFT/NFTOverview';
import NFTTokenTab from '@/components/app/Tokens/NFT/NFTTokenTab';

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

  const errorBoundaryFallback = (
    <ErrorMessage
      icons={<FaInbox />}
      message={''}
      mutedText="Please try again later"
      reset
    />
  );

  return (
    <div className="relative container-xxl mx-auto px-4">
      <section>
        <Suspense
          fallback={
            <NFTTokenTabSkeletion
              id={id}
              tab={searchParams?.tab || 'transfers'}
            />
          }
        >
          <ErrorBoundary
            fallback={
              <div className="container-xxl mx-auto p-5 sm:!py-10">
                <div className="h-56 flex justify-center items-center bg-white soft-shadow rounded-xl overflow-hidden px-5 md:py lg:px-0 dark:bg-black-600">
                  {errorBoundaryFallback}
                </div>
              </div>
            }
          >
            <NFTOverview id={id} searchParams={searchParams} />
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
            <NFTTokenTab id={id} searchParams={searchParams} />
          </ErrorBoundary>
        </Suspense>
      </section>
    </div>
  );
}
