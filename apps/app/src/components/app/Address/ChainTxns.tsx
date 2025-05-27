import { getRequest } from '@/utils/app/api';

import MultiChainTxns from '@/components/app/ChainAbstraction/MultiChainTxns';

const MultiChainTransactions = async ({ id, searchParams }: any) => {
  const [data, count] = await Promise.all([
    getRequest(`v1/chain-abstraction/${id}/txns`, searchParams),
    getRequest(`v1/chain-abstraction/${id}/txns/count`, searchParams),
  ]);

  if (data.message === 'Error') {
    throw new Error(`Server Error : ${data.error}`);
  }

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
