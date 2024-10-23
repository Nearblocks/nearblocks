import QueryString from 'qs';
import NFTTransfersActions from './NFTTransfersActions';
import { getRequest } from '@/utils/app/api';

const TransfersList = async ({ searchParams }: any) => {
  const apiUrl = 'nfts/txns';
  const fetchUrl = searchParams
    ? `nfts/txns?${QueryString.stringify(searchParams)}`
    : `${apiUrl}`;

  const [data, dataCount, syncDetails] = await Promise.all([
    getRequest(fetchUrl),
    getRequest('nfts/txns/count'),
    getRequest('sync/status'),
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

export const revalidate = 5;
