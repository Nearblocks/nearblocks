import { FTTxns } from '@/components/address/fts';
import { ErrorSuspense } from '@/components/error-suspense';
import { fetchFTTxnCount, fetchFTTxns } from '@/data/address/fts';

type Props = PageProps<'/[lang]/address/[address]/tokens'>;

const FTTxnsPage = async ({ params, searchParams }: Props) => {
  const [{ address }, filters] = await Promise.all([params, searchParams]);
  const ftsPromise = fetchFTTxns(address, filters);
  const ftCountPromise = fetchFTTxnCount(address, filters);

  return (
    <ErrorSuspense fallback={<FTTxns loading />}>
      <FTTxns ftCountPromise={ftCountPromise} ftsPromise={ftsPromise} />
    </ErrorSuspense>
  );
};

export default FTTxnsPage;
