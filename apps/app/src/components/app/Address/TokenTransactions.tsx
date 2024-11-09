import { getRequest } from '@/utils/app/api';

import TokenTxnsActions from './TokenTxnsActions';

const TokenTransactions = async ({ id, searchParams }: any) => {
  const [data, count] = await Promise.all([
    getRequest(`account/${id}/ft-txns`, searchParams),
    getRequest(`account/${id}/ft-txns/count`, searchParams),
  ]);

  return (
    <TokenTxnsActions
      count={count?.txns?.[0]?.count}
      cursor={data?.cursor}
      error={!data || data === null}
      id={id}
      txns={data?.txns}
    />
  );
};

export default TokenTransactions;
