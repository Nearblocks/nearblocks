import { ErrorSuspense } from '@/components/error-suspense';
import { TokenTransfers } from '@/components/tokens/token/transfers';
import {
  fetchFTContractTxnCount,
  fetchFTContractTxns,
} from '@/data/tokens/contract';
import { holdNav } from '@/lib/hold-nav';

type Props = PageProps<'/[lang]/tokens/[cid]'>;

const TokenPage = async ({ params, searchParams }: Props) => {
  const [{ cid }, raw] = await Promise.all([params, searchParams]);
  const filters = { ...raw, affected: raw.account ?? raw.affected };
  const txnsPromise = fetchFTContractTxns(cid, filters);
  const txnCountPromise = fetchFTContractTxnCount(cid, filters);
  await holdNav();

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
