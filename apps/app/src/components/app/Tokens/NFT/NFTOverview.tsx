import { getRequest } from '@/utils/app/api';
import { Token } from '@/utils/types';
import NFTOverviewActions from './NFTOverviewActions';
// import TokenFilter from './TokenFilter';

const NFTOverview = async ({ id }: any) => {
  const [tokenResult, syncResult, transferResult, holderResult] =
    await Promise.all([
      getRequest(`nfts/${id}`),
      getRequest(`sync/status`),
      getRequest(`nfts/${id}/txns/count`),
      getRequest(`nfts/${id}/holders/count`),
    ]);

  const token: Token = tokenResult?.contracts?.[0];
  const transfers = transferResult?.txns?.[0]?.count;
  const holders = holderResult?.holders?.[0]?.count;
  const status = syncResult?.status?.aggregates.ft_holders || {
    height: '0',
    sync: true,
    timestamp: '',
  };
  return (
    <>
      <NFTOverviewActions
        id={id}
        token={token}
        status={status}
        transfers={transfers}
        holders={holders}
      />
      <div className="py-6"></div>
    </>
  );
};
export default NFTOverview;
