import { ErrorSuspense } from '@/components/error-suspense';
import { TokenTransfers } from '@/components/tokens/token/transfers';
import {
  fetchFTContractTxnCount,
  fetchFTContractTxns,
} from '@/data/tokens/contract';

type Props = PageProps<'/[lang]/tokens/[cid]'>;

const TokenPage = async ({ params, searchParams }: Props) => {
  const [{ cid }, filters] = await Promise.all([params, searchParams]);
  const txnsPromise = fetchFTContractTxns(cid, filters);
  const txnCountPromise = fetchFTContractTxnCount(cid, filters);

  return (
    <ErrorSuspense fallback={<TokenTransfers loading />}>
      <TokenTransfers
        txnCountPromise={txnCountPromise}
        txnsPromise={txnsPromise}
      />
    </ErrorSuspense>
  );
};

export default TokenPage;
