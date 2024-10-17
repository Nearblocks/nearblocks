import TokenTabSkeleton from '@/components/app/skeleton/ft/TokenTabSkeleton';
import Overview from '@/components/app/Tokens/FT/Overview';
import TokenTabs from '@/components/app/Tokens/FT/TokenTab';
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
        <Suspense fallback={<TokenTabSkeleton />}>
          <Overview id={id} searchParams={searchParams} />
          <TokenTabs id={id} searchParams={searchParams} />
        </Suspense>
      </section>
    </div>
  );
}
