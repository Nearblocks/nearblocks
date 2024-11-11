import { getRequest } from '@/utils/app/api';
import FTTransfersActions from './FTTransfersActions';

const Transfers = async ({ searchParams }: any) => {
  const options = {
    cache: 'no-store',
  };

  const [data, dataCount, syncDetails] = await Promise.all([
    getRequest('fts/txns', searchParams, options),
    getRequest('fts/txns/count', searchParams, options),
    getRequest('sync/status', searchParams, options),
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
