import { cookies } from 'next/headers';

import { getRequest } from '@/utils/app/api';
import { Token } from '@/utils/types';

import NFTOverviewActions from './NFTOverviewActions';
// import TokenFilter from './TokenFilter';

const NFTOverview = async ({ id }: any) => {
  const options: RequestInit = { next: { revalidate: 10 } };
  const [tokenResult, syncResult, transferResult, holderResult] =
    await Promise.all([
      getRequest(`nfts/${id}`, {}, options),
      getRequest(`sync/status`, {}, options),
      getRequest(`nfts/${id}/txns/count`, {}, options),
      getRequest(`nfts/${id}/holders/count`, {}, options),
    ]);

  const token: Token = tokenResult?.contracts?.[0];
  const transfers = transferResult?.txns?.[0]?.count;
  const holders = holderResult?.holders?.[0]?.count;
  const theme = (await cookies()).get('theme')?.value || 'light';
  const status = syncResult?.status?.aggregates.ft_holders || {
    height: '0',
    sync: true,
    timestamp: '',
  };
  return (
    <>
      <NFTOverviewActions
        holders={holders}
        id={id}
        status={status}
        theme={theme}
        token={token}
        transfers={transfers}
      />
      <div className="py-6"></div>
    </>
  );
};
export default NFTOverview;
