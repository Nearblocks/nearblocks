import { getRequest } from '@/app/utils/api';
import NFTTransactionActions from './NFTTxnsActions';

const NFTTransactions = async ({ id, searchParams }: any) => {
  const [data, count] = await Promise.all([
    getRequest(`account/${id}/nft-txns`, searchParams),
    getRequest(`account/${id}/nft-txns/count`, searchParams),
  ]);

  return (
    <>
      <NFTTransactionActions
        id={id}
        txns={data?.txns}
        count={count?.txns?.[0]?.count}
        error={!data || data === null}
        cursor={data?.cursor}
      />
    </>
  );
};
export default NFTTransactions;
