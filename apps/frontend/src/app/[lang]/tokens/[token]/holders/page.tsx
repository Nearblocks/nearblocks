import { ErrorSuspense } from '@/components/error-suspense';
import { TokenHolders } from '@/components/tokens/token/holders';
import {
  fetchFTContract,
  fetchFTContractHolderCount,
  fetchFTContractHolders,
} from '@/data/tokens/contract';

type Props = PageProps<'/[lang]/tokens/[token]/holders'>;

const HoldersPage = async ({ params, searchParams }: Props) => {
  const [{ token }, filters] = await Promise.all([params, searchParams]);
  const holdersPromise = fetchFTContractHolders(token, filters);
  const holderCountPromise = fetchFTContractHolderCount(token);
  const contractPromise = fetchFTContract(token);

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
