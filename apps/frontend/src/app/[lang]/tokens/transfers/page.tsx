import { ErrorSuspense } from '@/components/error-suspense';
import { TokenTransfers } from '@/components/tokens/transfers';
import { fetchFTTxnCount, fetchFTTxns } from '@/data/tokens';

type Props = PageProps<'/[lang]/tokens/transfers'>;

const TransfersPage = async ({ searchParams }: Props) => {
  const filters = await searchParams;
  const ftsPromise = fetchFTTxns(filters);
  const ftCountPromise = fetchFTTxnCount(filters);

  return (
    <>
      <h1 className="text-headline-lg mb-6">Token Transfers (NEP-141)</h1>
      <ErrorSuspense fallback={<TokenTransfers loading />}>
        <TokenTransfers
          ftCountPromise={ftCountPromise}
          ftsPromise={ftsPromise}
        />
      </ErrorSuspense>
    </>
  );
};

export default TransfersPage;
