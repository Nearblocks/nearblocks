import { ErrorSuspense } from '@/components/error-suspense';
import { MtFtHolders } from '@/components/mt-tokens/fts/holders';
import {
  fetchMTToken,
  fetchMTTokenHolderCount,
  fetchMTTokenHolders,
} from '@/data/mt-tokens/contract';
import { decodeToken } from '@/lib/utils';

type Props = {
  params: Promise<{ cid: string; lang: string; tid: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const FtTokenHoldersPage = async ({ params, searchParams }: Props) => {
  const [{ cid, tid: rawTid }, filters] = await Promise.all([
    params,
    searchParams,
  ]);
  const tid = decodeToken(rawTid);
  const holdersPromise = fetchMTTokenHolders(cid, tid, filters);
  const holderCountPromise = fetchMTTokenHolderCount(cid, tid);
  const tokenPromise = fetchMTToken(cid, tid);

  return (
    <ErrorSuspense fallback={<MtFtHolders loading />}>
      <MtFtHolders
        holderCountPromise={holderCountPromise}
        holdersPromise={holdersPromise}
        tokenPromise={tokenPromise}
      />
    </ErrorSuspense>
  );
};

export default FtTokenHoldersPage;
