import { Suspense } from 'react';

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

  return (
    <div className="relative container-xxl mx-auto px-5">
      <section>
        <Suspense
          fallback={
            <NFTTokenTabSkeletion
              id={id}
              tab={searchParams?.tab || 'transfers'}
            />
          }
        >
          <NFTOverview id={id} searchParams={searchParams} />
          <NFTTokenTab id={id} searchParams={searchParams} />
        </Suspense>
      </section>
    </div>
  );
}
