import { getRequest } from '@/app/utils/api';
import TokenTxnsActions from './TokenTxnsActions';

const TokenTransactions = async ({ id, queryParams }: any) => {
  const [data, count] = await Promise.all([
    getRequest(`account/${id}/ft-txns`, queryParams),
    getRequest(`account/${id}/ft-txns/count`, queryParams),
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
