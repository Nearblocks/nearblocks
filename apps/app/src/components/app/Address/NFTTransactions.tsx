import { getRequest } from '@/utils/app/api';

import NFTTransactionActions from '@/components/app/Address/NFTTxnsActions';

const NFTTransactions = async ({ id, searchParams }: any) => {
  const data = getRequest(`v1/account/${id}/nft-txns`, searchParams);
  const count = getRequest(`v1/account/${id}/nft-txns/count`, searchParams);

  return <NFTTransactionActions dataPromise={data} countPromise={count} />;
};
export default NFTTransactions;
