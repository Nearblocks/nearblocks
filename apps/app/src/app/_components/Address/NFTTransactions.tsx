import { getRequest } from '@/app/utils/api';
import TransactionActions from './TransactionActions';

const NFTTransactions = async ({ id, queryParams }: any) => {
  const [data, count] = await Promise.all([
    getRequest(`account/${id}/nft-txns`, queryParams),
    getRequest(`account/${id}/nft-txns/count`, queryParams),
  ]);

  return (
    <>
      <TransactionActions
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
