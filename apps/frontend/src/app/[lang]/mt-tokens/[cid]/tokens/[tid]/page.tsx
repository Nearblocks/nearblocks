import { ErrorSuspense } from '@/components/error-suspense';
import { MtFtTransfers } from '@/components/mt-tokens/fts/transfers';
import {
  fetchMTTokenTxnCount,
  fetchMTTokenTxns,
} from '@/data/mt-tokens/contract';
import { holdNav } from '@/lib/hold-nav';
import { decodeToken } from '@/lib/utils';

type Props = {
  params: Promise<{ cid: string; lang: string; tid: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const FtTokenTransfersPage = async ({ params, searchParams }: Props) => {
  const [{ cid, tid: rawTid }, raw] = await Promise.all([params, searchParams]);
  const tid = decodeToken(rawTid);
  const filters = { ...raw, affected: raw.account ?? raw.affected };
  const txnsPromise = fetchMTTokenTxns(cid, tid, filters);
  const txnCountPromise = fetchMTTokenTxnCount(cid, tid, filters);
  await holdNav();

  return (
    <ErrorSuspense fallback={<MtFtTransfers loading />}>
      <MtFtTransfers
        txnCountPromise={txnCountPromise}
        txnsPromise={txnsPromise}
      />
    </ErrorSuspense>
  );
};

export default FtTokenTransfersPage;
