import NFTTokenTabSkeletion from '@/components/app/skeleton/nft/NFTTokenTab';
import NFTOverview from '@/components/app/Tokens/NFT/NFTOverview';
import NFTTokenTab from '@/components/app/Tokens/NFT/NFTTokenTab';
import { Suspense } from 'react';

export default async function TokenIndex({
  params: { id },
  searchParams,
}: {
  params: { id: string; locale: string };
  searchParams: { tab: string; cursor?: string; p?: string; order: string };
}) {
  return (
    <div className="relative container mx-auto px-3">
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
