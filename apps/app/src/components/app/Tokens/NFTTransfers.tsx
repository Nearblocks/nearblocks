import NFTTransfersActions from './NFTTransfersActions';
import { getRequest } from '@/utils/app/api';

const TransfersList = async ({ searchParams }: any) => {
  const options = {
    cache: 'no-store',
  };

  const [data, dataCount, syncDetails] = await Promise.all([
    getRequest('nfts/txns', searchParams, options),
    getRequest('nfts/txns/count', searchParams, options),
    getRequest('sync/status', searchParams, options),
  ]);

  const status = syncDetails?.status?.indexers?.events || {
    height: 0,
    sync: true,
  };

  return (
    <NFTTransfersActions
      data={data}
      totalCount={dataCount}
      error={!data}
      status={status}
    />
  );
};
export default TransfersList;
