import { getRequest } from '@/utils/app/api';
import OverviewActions from './OverviewActions';
import { Token } from '@/utils/types';
import TokenFilter from './TokenFilter';

const Overview = async ({ id, searchParams }: any) => {
  const [
    statsResult,
    tokenResult,
    syncResult,
    transferResult,
    holderResult,
    filterResult,
  ] = await Promise.all([
    getRequest(`stats`),
    getRequest(`fts/${id}`),
    getRequest(`sync/status`),
    getRequest(`fts/${id}/txns/count`),
    getRequest(`fts/${id}/holders/count`),
    getRequest(`account/${searchParams?.a}/inventory`),
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
        id={id}
        stats={stats}
        token={token}
        status={status}
        transfers={transfers}
        holders={holders}
      />
      <div className="py-6"></div>
      {searchParams?.a && (
        <TokenFilter
          id={id}
          tokenFilter={searchParams?.a}
          inventoryData={inventoryData}
        />
      )}
    </>
  );
};
export default Overview;
