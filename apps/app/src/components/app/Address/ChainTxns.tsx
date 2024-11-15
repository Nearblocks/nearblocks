import { getRequest } from '@/utils/app/api';

import MultiChainTxns from './MultiChainTxns';

const MultiChainTransactions = async ({ id, searchParams }: any) => {
  const [data, count] = await Promise.all([
    getRequest(`chain-abstraction/${id}/txns`, searchParams),
    getRequest(`chain-abstraction/${id}/txns/count`, searchParams),
  ]);

  return (
    <MultiChainTxns
      count={count?.txns?.[0]?.count}
      cursor={data?.cursor}
      error={!data || data === null}
      txns={data?.txns}
    />
  );
};

export default MultiChainTransactions;
