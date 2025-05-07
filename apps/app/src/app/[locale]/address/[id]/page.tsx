import { Suspense } from 'react';

import AccountTabs from '@/components/app/Address/AccountTabs';
import Balance from '@/components/app/Address/Balance';
import BalanceSkeleton from '@/components/app/skeleton/address/balance';
import TabSkeletion from '@/components/app/skeleton/address/tab';
import { getRequest } from '@/utils/app/api';
import { ErrorBoundary } from 'react-error-boundary';
import AccountAlerts from '@/components/app/Address/AccountAlerts';

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

  const options: RequestInit = {
    cache: 'force-cache',
  };

  const parse =
    (await getRequest(`v1/account/${id}/contract/parse`, {}, options)) || {};
  const deploymentInfo =
    (await getRequest(`v1/account/${id}/contract/deployments`, {}, options)) ||
    {};
  const tokenDetails = (await getRequest(`v1/fts/${id}`, {}, options)) || {};
  const nftTokenData = (await getRequest(`v1/nfts/${id}`, {}, options)) || {};

  const tokenTracker =
    (tokenDetails?.contracts?.[0]?.name ? 'token' : null) ||
    (nftTokenData?.contracts?.[0]?.name ? 'nft' : null);

  return (
    <>
      <ErrorBoundary fallback={<div />}>
        <AccountAlerts id={id} />
      </ErrorBoundary>
      <Suspense
        fallback={
          <BalanceSkeleton
            parse={parse}
            deploymentInfo={deploymentInfo?.deployments?.[0]}
            tokenTracker={tokenTracker}
          />
        }
      >
        <Balance id={id} parse={parse} />
      </Suspense>

      <div className="py-2"></div>

      <Suspense
        fallback={<TabSkeletion parse={parse} />}
        key={JSON.stringify(rest)}
      >
        <AccountTabs id={id} searchParams={searchParams} />
      </Suspense>
    </>
  );
}
