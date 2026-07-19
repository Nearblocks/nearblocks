import { ErrorSuspense } from '@/components/error-suspense';
import { ReceiptsSummary } from '@/components/txns/txn/receipts';
import { fetchTxnReceipts } from '@/data/txns';
import { holdNav } from '@/lib/hold-nav';

type Props = PageProps<'/[lang]/txns/[tid]/receipts'>;

const ReceiptsPage = async ({ params }: Props) => {
  const { tid } = await params;
  const receiptsPromise = fetchTxnReceipts(tid);
  await holdNav();

  return (
    <ErrorSuspense fallback={<ReceiptsSummary loading />}>
      <ReceiptsSummary receiptsPromise={receiptsPromise} />
    </ErrorSuspense>
  );
};

export default ReceiptsPage;
