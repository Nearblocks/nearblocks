import QueryString from 'qs';

import { getRequest } from '@/utils/app/api';

import NFTTransfersActions from '@/components/app/Tokens/NFTTransfersActions';

const TransfersList = async ({ searchParams }: any) => {
  const apiUrl = 'v1/nfts/txns';
  const fetchUrl = searchParams
    ? `v1/nfts/txns?${QueryString.stringify(searchParams)}`
    : `${apiUrl}`;

  const [data, dataCount, syncDetails] = await Promise.all([
    getRequest(fetchUrl),
    getRequest('v1/nfts/txns/count'),
    getRequest('v1/sync/status'),
  ]);

  const status = syncDetails?.status?.indexers?.events || {
    height: 0,
    sync: true,
  };

  if (data.message === 'Error') {
    throw new Error(`Server Error : ${data.error}`);
  }

  return (
    <NFTTransfersActions
      data={data}
      error={!data}
      status={status}
      totalCount={dataCount}
    />
  );
};
export default TransfersList;
