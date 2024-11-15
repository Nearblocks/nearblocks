export const runtime = 'edge';

import { Suspense } from 'react';

import TokenTabSkeleton from '@/components/app/skeleton/ft/TokenTabSkeleton';
import Overview from '@/components/app/Tokens/FT/Overview';
import TokenTabs from '@/components/app/Tokens/FT/TokenTab';

export default async function TokenIndex({
  params: { id },
  searchParams,
}: {
  params: { id: string; locale: string };
  searchParams: { cursor?: string; order: string; p?: string; tab: string };
}) {
  return (
    <div className="relative container-xxl mx-auto px-5">
      <section>
        <Suspense fallback={<TokenTabSkeleton />}>
          <Overview id={id} searchParams={searchParams} />
          <TokenTabs id={id} searchParams={searchParams} />
        </Suspense>
      </section>
    </div>
  );
}
