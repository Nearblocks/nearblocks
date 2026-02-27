import { ErrorSuspense } from '@/components/error-suspense';
import { ReceiptsSummary } from '@/components/txns/txn/receipts';
import { fetchTxnReceipts } from '@/data/txns';

type Props = PageProps<'/[lang]/txns/[tid]/receipts'>;

const ReceiptsPage = async ({ params }: Props) => {
  const { tid } = await params;
  const receiptsPromise = fetchTxnReceipts(tid);

  return (
    <ErrorSuspense fallback={<ReceiptsSummary loading />}>
      <ReceiptsSummary receiptsPromise={receiptsPromise} />
    </ErrorSuspense>
  );
};

export default ReceiptsPage;
