import { ErrorSuspense } from '@/components/error-suspense';
import { Txns } from '@/components/txns';
import { fetchTxnCount, fetchTxns } from '@/data/txns';

type Props = PageProps<'/[lang]/txns'>;

const TxnsPage = async ({ searchParams }: Props) => {
  const filters = await searchParams;
  const txnsPromise = fetchTxns(filters);
  const txnCountPromise = fetchTxnCount(filters);

  return (
    <ErrorSuspense fallback={<Txns loading />}>
      <Txns txnCountPromise={txnCountPromise} txnsPromise={txnsPromise} />
    </ErrorSuspense>
  );
};

export default TxnsPage;
