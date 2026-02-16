import { ErrorSuspense } from '@/components/error-suspense';
import { Execution } from '@/components/txns/txn/execution';
import { fetchTxnReceipts } from '@/data/txns';

type Props = PageProps<'/[lang]/txns/[txn]/execution'>;

const ExecutionPage = async ({ params }: Props) => {
  const { txn } = await params;
  const receiptsPromise = fetchTxnReceipts(txn);

  return (
    <ErrorSuspense fallback={<Execution loading />}>
      <Execution receiptsPromise={receiptsPromise} txnHash={txn} />
    </ErrorSuspense>
  );
};

export default ExecutionPage;
