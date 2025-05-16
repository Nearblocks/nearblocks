import { getRequest } from '@/utils/app/api';

import TokenTxnsActions from '@/components/app/Address/TokenTxnsActions';

const TokenTransactions = async ({ id, searchParams }: any) => {
  const data = getRequest(`v1/account/${id}/ft-txns`, searchParams);
  const count = getRequest(`v1/account/${id}/ft-txns/count`, searchParams);

  return <TokenTxnsActions dataPromise={data} countPromise={count} />;
};

export default TokenTransactions;
