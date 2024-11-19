import { getRequest } from '@/utils/app/api';

import MultiChainTxns from '../ChainAbstraction/MultiChainTxns';

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
      isTab={true}
      tab={'multichaintxns'}
      txns={data?.txns}
    />
  );
};

export default MultiChainTransactions;
