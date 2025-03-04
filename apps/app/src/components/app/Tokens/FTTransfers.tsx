import QueryString from 'qs';

import { getRequest } from '@/utils/app/api';

import FTTransfersActions from './FTTransfersActions';

const Transfers = async ({ searchParams }: any) => {
  const apiUrl = 'fts/txns';
  const fetchUrl = `${apiUrl}?${QueryString.stringify(searchParams)}`;

  const [data, dataCount, syncDetails] = await Promise.all([
    getRequest(fetchUrl),
    getRequest('fts/txns/count'),
    getRequest('sync/status'),
  ]);

  const status = syncDetails?.status?.indexers?.events || {
    height: 0,
    sync: true,
  };
  if (data.message === 'Error') {
    throw new Error(`Server Error : ${data.error}`);
  }
  return (
    <FTTransfersActions
      data={data}
      error={!data}
      status={status}
      totalCount={dataCount}
    />
  );
};
export default Transfers;
