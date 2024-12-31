import { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

import AccountTabs from '@/components/app/Address/AccountTabs';
import Balance from '@/components/app/Address/Balance';
import BalanceSkeleton from '@/components/app/skeleton/address/balance';
import TabSkeletion from '@/components/app/skeleton/address/tab';
import { getRequest } from '@/utils/app/api';

export default async function AddressIndex(props: {
  params: Promise<{ id: string; locale: string }>;
  searchParams: Promise<{
    cursor?: string;
    event: string;
    from: string;
    involved: string;
    method: string;
    order: string;
    page?: string;
    tab: string;
    to: string;
  }>;
}) {
  const searchParams = await props.searchParams;
  const params = await props.params;

  const { id } = params;

  const { cursor, page, ...rest } = searchParams;
  const options: RequestInit = {
    cache: 'force-cache',
  };
  const parse =
    (await getRequest(`account/${id}/contract/parse`, {}, options)) || {};

  return (
    <>
      <Suspense fallback={<BalanceSkeleton />}>
        <Balance id={id} />
      </Suspense>

      <div className="py-3"></div>

      <ErrorBoundary fallback={<TabSkeletion error reset />}>
        <Suspense fallback={<TabSkeletion />} key={JSON.stringify(rest)}>
          <AccountTabs id={id} parse={parse} searchParams={searchParams} />
        </Suspense>
      </ErrorBoundary>
    </>
  );
}
