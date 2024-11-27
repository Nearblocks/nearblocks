import { getRequest } from '@/utils/app/api';

import NFTTransactionActions from './NFTTxnsActions';

const NFTTransactions = async ({ id, searchParams }: any) => {
  const options: RequestInit = {
    next: { revalidate: 10 },
  };
  const [data, count] = await Promise.all([
    getRequest(`account/${id}/nft-txns`, searchParams, options),
    getRequest(`account/${id}/nft-txns/count`, searchParams, options),
  ]);

  return (
    <>
      <NFTTransactionActions
        count={count?.txns?.[0]?.count}
        cursor={data?.cursor}
        error={!data || data === null}
        id={id}
        txns={data?.txns}
      />
    </>
  );
};
export default NFTTransactions;
