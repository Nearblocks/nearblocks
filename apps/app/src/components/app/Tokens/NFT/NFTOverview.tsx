import { cookies } from 'next/headers';

import { getRequest } from '@/utils/app/api';
import { Token } from '@/utils/types';

import NFTOverviewActions from '@/components/app/Tokens/NFT/NFTOverviewActions';
// import TokenFilter from './TokenFilter';

const NFTOverview = async ({ id }: any) => {
  const options: RequestInit = { next: { revalidate: 10 } };
  const [tokenResult, syncResult, transferResult, holderResult] =
    await Promise.all([
      getRequest(`v1/nfts/${id}`, {}, options),
      getRequest(`v1/sync/status`, {}, options),
      getRequest(`v1/nfts/${id}/txns/count`, {}, options),
      getRequest(`v1/nfts/${id}/holders/count`, {}, options),
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
  if (tokenResult.message === 'Error') {
    throw new Error(`Server Error : ${tokenResult.error}`);
  }
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
