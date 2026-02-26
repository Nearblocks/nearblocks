import { ErrorSuspense } from '@/components/error-suspense';
import { TokenTransfers } from '@/components/tokens/token/transfers';
import {
  fetchFTContractTxnCount,
  fetchFTContractTxns,
} from '@/data/tokens/contract';

type Props = PageProps<'/[lang]/tokens/[token]'>;

const TokenPage = async ({ params, searchParams }: Props) => {
  const [{ token }, filters] = await Promise.all([params, searchParams]);
  const ftsPromise = fetchFTContractTxns(token, filters);
  const ftCountPromise = fetchFTContractTxnCount(token, filters);

  return (
    <ErrorSuspense fallback={<TokenTransfers loading />}>
      <TokenTransfers ftCountPromise={ftCountPromise} ftsPromise={ftsPromise} />
    </ErrorSuspense>
  );
};

export default TokenPage;
