import TxnsTabsSkeleton from '@/components/app/skeleton/txns/TxnsTabs';
import TxnsTabs from '@/components/app/Transactions/TxnsTabs';
import { Suspense } from 'react';

export default async function TxnsHashIndex({
  params: { hash, locale },
  searchParams,
}: {
  params: { hash: string; locale: string };
  searchParams: { tab: string; cursor?: string; p?: string; order: string };
}) {
  return (
    <Suspense
      fallback={
        <TxnsTabsSkeleton tab={searchParams?.tab || 'overview'} hash={hash} />
      }
    >
      <TxnsTabs hash={hash} locale={locale} searchParams={searchParams} />
    </Suspense>
  );
}

export const revalidate = 20;
