import { ErrorSuspense } from '@/components/error-suspense';
import { Enhanced } from '@/components/txns/txn/enhanced';
import { fetchTxnReceipts } from '@/data/txns';

type Props = PageProps<'/[lang]/txns/[tid]/enhanced'>;

const EnhancedPage = async ({ params }: Props) => {
  const { tid } = await params;
  const receiptsPromise = fetchTxnReceipts(tid);

  return (
    <ErrorSuspense fallback={<Enhanced loading />}>
      <Enhanced receiptsPromise={receiptsPromise} tid={tid} />
    </ErrorSuspense>
  );
};

export default EnhancedPage;
