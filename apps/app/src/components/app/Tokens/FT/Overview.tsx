import { cookies } from 'next/headers';

import { getRequest } from '@/utils/app/api';
import { Token } from '@/utils/types';

import OverviewActions from './OverviewActions';
import TokenFilter from './TokenFilter';

const Overview = async ({ id, searchParams }: any) => {
  const [statsResult, tokenResult, syncResult, transferResult, holderResult] =
    await Promise.all([
      getRequest(`stats`),
      getRequest(`fts/${id}`),
      getRequest(`sync/status`),
      getRequest(`fts/${id}/txns/count`),
      getRequest(`fts/${id}/holders/count`),
    ]);

  const token: Token = tokenResult?.contracts?.[0];
  const transfers = transferResult?.txns?.[0]?.count;
  const holders = holderResult?.holders?.[0]?.count;
  const stats = statsResult?.stats?.[0];
  const status = syncResult?.status?.aggregates?.ft_holders || {
    height: '0',
    sync: true,
    timestamp: '',
  };

  const inventoryDataPromise = searchParams?.a
    ? await getRequest(`account/${searchParams?.a}/inventory`)
    : Promise.resolve(null);
  const inventoryData = inventoryDataPromise?.inventory;
  const theme = (await cookies()).get('theme')?.value || 'light';

  if (tokenResult.message === 'Error') {
    throw new Error(`Server Error : ${tokenResult.error}`);
  }

  return (
    <>
      <OverviewActions
        holders={holders}
        id={id}
        stats={stats}
        status={status}
        theme={theme}
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
