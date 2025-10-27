import QueryString from 'qs';

import { getRequest, getRequestBeta } from '@/utils/app/api';

import FTTransfersActions from '@/components/app/Tokens/FTTransfersActions';

const Transfers = async ({ searchParams }: any) => {
  const apiUrl = 'v3/fts/txns';
  const fetchUrl = `${apiUrl}?${QueryString.stringify(searchParams)}`;

  const [data, dataCount, syncDetails] = await Promise.all([
    getRequestBeta(fetchUrl),
    getRequestBeta('v3/fts/txns/count'),
    getRequest('v1/sync/status'),
  ]);

  const status = syncDetails?.status?.indexers?.events || {
    height: 0,
    sync: true,
  };
  if (data.errors) {
    throw new Error(`Server Error : ${data?.errors[0].message}`);
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
