import { getRequest } from '@/app/utils/api';
import TokenTxnsActions from './TokenTxnsActions';

const TokenTransactions = async ({ id, searchParams }: any) => {
  const [data, count] = await Promise.all([
    getRequest(`account/${id}/ft-txns`, searchParams),
    getRequest(`account/${id}/ft-txns/count`, searchParams),
  ]);

  return (
    <TokenTxnsActions
      id={id}
      txns={data?.txns}
      count={count?.txns?.[0]?.count}
      error={!data || data === null}
      cursor={data?.cursor}
    />
  );
};

export default TokenTransactions;
