import { ErrorSuspense } from '@/components/error-suspense';
import { TokenHolders } from '@/components/tokens/token/holders';
import {
  fetchFTContract,
  fetchFTContractHolderCount,
  fetchFTContractHolders,
} from '@/data/tokens/contract';

type Props = PageProps<'/[lang]/tokens/[cid]/holders'>;

const HoldersPage = async ({ params, searchParams }: Props) => {
  const [{ cid }, filters] = await Promise.all([params, searchParams]);
  const holdersPromise = fetchFTContractHolders(cid, filters);
  const holderCountPromise = fetchFTContractHolderCount(cid);
  const contractPromise = fetchFTContract(cid);

  return (
    <ErrorSuspense fallback={<TokenHolders loading />}>
      <TokenHolders
        contractPromise={contractPromise}
        holderCountPromise={holderCountPromise}
        holdersPromise={holdersPromise}
      />
    </ErrorSuspense>
  );
};

export default HoldersPage;
