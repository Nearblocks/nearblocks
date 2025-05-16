import { Suspense } from 'react';

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

  const { id: address } = params;
  const id = address?.toLowerCase();

  const { cursor, page, ...rest } = searchParams;

  const parse = getRequest(`v1/account/${id}/contract/parse`) || {};
  const deploymentInfo =
    getRequest(`v1/account/${id}/contract/deployments`) || {};
  const tokenDetails = getRequest(`v1/fts/${id}`) || {};
  const nftTokenData = getRequest(`v1/nfts/${id}`) || {};

  return (
    <>
      <Suspense
        fallback={
          <BalanceSkeleton
            parsePromise={parse}
            deploymentPromise={deploymentInfo}
            ftPromise={tokenDetails}
            nftPromise={nftTokenData}
          />
        }
      >
        <Balance id={id} />
      </Suspense>

      <div className="py-2"></div>

      <Suspense
        fallback={<TabSkeletion parsePromise={parse} />}
        key={JSON.stringify(rest)}
      >
        <AccountTabs id={id} searchParams={searchParams} />
      </Suspense>
    </>
  );
}
