export const runtime = 'edge';

import { Suspense } from 'react';

import TxnsTabsSkeleton from '@/components/app/skeleton/txns/TxnsTabs';
import TxnsTabs from '@/components/app/Transactions/TxnsTabs';

export default async function TxnsHashIndex(props: {
  params: Promise<{ hash: string; locale: string }>;
  searchParams: Promise<{
    cursor?: string;
    order: string;
    p?: string;
    tab: string;
  }>;
}) {
  const searchParams = await props.searchParams;
  const params = await props.params;

  const { hash, locale } = params;

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
