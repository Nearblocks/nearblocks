import { getRequest } from '@/utils/app/api';
import { Token } from '@/utils/types';

import OverviewActions from './OverviewActions';
import TokenFilter from './TokenFilter';

const Overview = async ({ id, searchParams }: any) => {
  const options: RequestInit = {
    next: { revalidate: 10 },
  };
  const [
    statsResult,
    tokenResult,
    syncResult,
    transferResult,
    holderResult,
    filterResult,
  ] = await Promise.all([
    getRequest(`stats`, {}, options),
    getRequest(`fts/${id}`, {}, options),
    getRequest(`sync/status`, {}, options),
    getRequest(`fts/${id}/txns/count`, {}, options),
    getRequest(`fts/${id}/holders/count`, {}, options),
    getRequest(`account/${searchParams?.a}/inventory`, {}, options),
  ]);

  const token: Token = tokenResult?.contracts?.[0];
  const transfers = transferResult?.txns?.[0]?.count;
  const holders = holderResult?.holders?.[0]?.count;
  const stats = statsResult?.stats[0];
  const status = syncResult?.status?.aggregates.ft_holders || {
    height: '0',
    sync: true,
    timestamp: '',
  };
  const inventoryData = filterResult?.inventory;

  return (
    <>
      <OverviewActions
        holders={holders}
        id={id}
        stats={stats}
        status={status}
        token={token}
        transfers={transfers}
      />
      <div className="py-6"></div>
      {searchParams?.a && (
        <TokenFilter
          id={id}
          inventoryData={inventoryData}
          tokenFilter={searchParams?.a}
        />
      )}
    </>
  );
};
export default Overview;
