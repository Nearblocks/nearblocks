import { getRequest } from '@/utils/app/api';

import TokenTxnsActions from '@/components/app/Address/TokenTxnsActions';

const TokenTransactions = async ({ id, searchParams }: any) => {
  const options: RequestInit = {
    next: { revalidate: 10 },
  };
  const [data, count] = await Promise.all([
    getRequest(`v1/account/${id}/ft-txns`, searchParams, options),
    getRequest(`v1/account/${id}/ft-txns/count`, searchParams, options),
  ]);

  if (data.message === 'Error') {
    throw new Error(`Server Error : ${data.error}`);
  }

  return (
    <TokenTxnsActions
      count={count?.txns?.[0]?.count}
      cursor={data?.cursor}
      error={!data || data === null}
      txns={data?.txns}
    />
  );
};

export default TokenTransactions;
