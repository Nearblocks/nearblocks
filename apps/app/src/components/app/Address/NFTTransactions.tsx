import { getRequestBeta } from '@/utils/app/api';

import NFTTransactionActions from '@/components/app/Address/NFTTxnsActions';

const NFTTransactions = async ({ id, searchParams }: any) => {
  const data = getRequestBeta(`v3/accounts/${id}/nft-txns`, searchParams);
  const count = getRequestBeta(
    `v3/accounts/${id}/nft-txns/count`,
    searchParams,
  );

  return <NFTTransactionActions dataPromise={data} countPromise={count} />;
};
export default NFTTransactions;
