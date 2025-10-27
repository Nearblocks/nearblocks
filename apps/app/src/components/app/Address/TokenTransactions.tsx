import { getRequestBeta } from '@/utils/app/api';

import TokenTxnsActions from '@/components/app/Address/TokenTxnsActions';

const TokenTransactions = async ({ id, searchParams }: any) => {
  const data = getRequestBeta(`v3/accounts/${id}/ft-txns`, searchParams);
  const count = getRequestBeta(`v3/accounts/${id}/ft-txns/count`, searchParams);
  return <TokenTxnsActions dataPromise={data} countPromise={count} />;
};

export default TokenTransactions;
