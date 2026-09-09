import { ErrorSuspense } from '@/components/error-suspense';
import { Overview } from '@/components/txns/txn';
import { Actions } from '@/components/txns/txn/actions';
import { fetchStats } from '@/data/layout';
import { fetchSpamTokens } from '@/data/spam-tokens';
import { fetchTxnDetail } from '@/data/txns';
import { holdNav } from '@/lib/hold-nav';

type Props = PageProps<'/[lang]/txns/[tid]'>;

const TxnPage = async ({ params }: Props) => {
  const { tid } = await params;
  const detailPromise = fetchTxnDetail(tid);
  const txnPromise = detailPromise.then((detail) => detail?.txn ?? null);
  const txnFTsPromise = detailPromise.then((detail) => detail?.fts ?? []);
  const txnMTsPromise = detailPromise.then((detail) => detail?.mts ?? []);
  const txnNFTsPromise = detailPromise.then((detail) => detail?.nfts ?? []);
  const txnReceiptsPromise = detailPromise.then(
    (detail) => detail?.receipts ?? null,
  );
  const statsPromise = fetchStats();
  const spamPatterns = await fetchSpamTokens();
  await holdNav();

  return (
    <div className="flex flex-col gap-4">
      <ErrorSuspense fallback={<Actions loading />}>
        <Actions
          ftsPromise={txnFTsPromise}
          mtsPromise={txnMTsPromise}
          receiptsPromise={txnReceiptsPromise}
          txnPromise={txnPromise}
        />
      </ErrorSuspense>
      <ErrorSuspense fallback={<Overview loading />}>
        <Overview
          receiptsPromise={txnReceiptsPromise}
          spamPatterns={spamPatterns}
          statsPromise={statsPromise}
          txnFTsPromise={txnFTsPromise}
          txnMTsPromise={txnMTsPromise}
          txnNFTsPromise={txnNFTsPromise}
          txnPromise={txnPromise}
        />
      </ErrorSuspense>
    </div>
  );
};

export default TxnPage;
