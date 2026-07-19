import { ErrorSuspense } from '@/components/error-suspense';
import { Tree } from '@/components/txns/txn/tree';
import { fetchStats } from '@/data/layout';
import { fetchTxnReceipts } from '@/data/txns';
import { holdNav } from '@/lib/hold-nav';

type Props = PageProps<'/[lang]/txns/[tid]/tree'>;

const TreePage = async ({ params }: Props) => {
  const { tid } = await params;
  const receiptsPromise = fetchTxnReceipts(tid);
  const statsPromise = fetchStats();
  await holdNav();

  return (
    <ErrorSuspense fallback={<Tree loading />}>
      <Tree
        receiptsPromise={receiptsPromise}
        statsPromise={statsPromise}
        tid={tid}
      />
    </ErrorSuspense>
  );
};

export default TreePage;
