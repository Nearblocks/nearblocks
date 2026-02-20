import { ErrorSuspense } from '@/components/error-suspense';
import { Txns } from '@/components/txns';
import { fetchTxnCount, fetchTxns } from '@/data/txns';

type Props = PageProps<'/[lang]/txns'>;

const TxnsPage = async ({ searchParams }: Props) => {
  const filters = await searchParams;
  const txnsPromise = fetchTxns(filters);
  const txnCountPromise = fetchTxnCount(filters);

  return (
    <>
      <h1 className="text-headline-lg mb-6">
        Latest Near Protocol Transactions
      </h1>
      <ErrorSuspense fallback={<Txns loading />}>
        <Txns txnCountPromise={txnCountPromise} txnsPromise={txnsPromise} />
      </ErrorSuspense>
    </>
  );
};

export default TxnsPage;
