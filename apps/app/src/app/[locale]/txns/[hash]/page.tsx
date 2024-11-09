export const runtime = 'edge';

import { Suspense } from 'react';

import TxnsTabsSkeleton from '@/components/app/skeleton/txns/TxnsTabs';
import TxnsTabs from '@/components/app/Transactions/TxnsTabs';

export default async function TxnsHashIndex({
  params: { hash, locale },
  searchParams,
}: {
  params: { hash: string; locale: string };
  searchParams: { cursor?: string; order: string; p?: string; tab: string };
}) {
  return (
    <Suspense
      fallback={
        <TxnsTabsSkeleton hash={hash} tab={searchParams?.tab || 'overview'} />
      }
    >
      <TxnsTabs hash={hash} locale={locale} searchParams={searchParams} />
    </Suspense>
  );
}

export const revalidate = 20;
