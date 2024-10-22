import { getRequest } from '@/utils/app/api';
import FTTransfersActions from './FTTransfersActions';
import QueryString from 'qs';

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

  return (
    <FTTransfersActions
      data={data}
      totalCount={dataCount}
      error={!data}
      status={status}
    />
  );
};
export default Transfers;
