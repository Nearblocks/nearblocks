import { ErrorSuspense } from '@/components/error-suspense';
import { Overview } from '@/components/txns/txn';
import { Actions } from '@/components/txns/txn/actions';
import { fetchStats } from '@/data/layout';
import {
  fetchTxn,
  fetchTxnFTs,
  fetchTxnNFTs,
  // fetchTxnReceipts,
} from '@/data/txns';

type Props = PageProps<'/[lang]/txns/[txn]'>;

const TxnPage = async ({ params }: Props) => {
  const { txn } = await params;
  const txnPromise = fetchTxn(txn);
  const txnFTsPromise = fetchTxnFTs(txn);
  const txnNFTsPromise = fetchTxnNFTs(txn);
  // const txnReceiptsPromise = fetchTxnReceipts(txn);
  const statsPromise = fetchStats();

  return (
    <div className="flex flex-col gap-4">
      <ErrorSuspense fallback={<Actions loading />}>
        <Actions txnPromise={txnPromise} />
      </ErrorSuspense>
      <ErrorSuspense fallback={<Overview loading />}>
        <Overview
          statsPromise={statsPromise}
          txnFTsPromise={txnFTsPromise}
          txnNFTsPromise={txnNFTsPromise}
          txnPromise={txnPromise}
        />
      </ErrorSuspense>
    </div>
  );
};

export default TxnPage;
