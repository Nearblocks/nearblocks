import { ErrorSuspense } from '@/components/error-suspense';
import { NftTokenHolders } from '@/components/nft-tokens/token/holders';
import {
  fetchNFTContract,
  fetchNFTContractHolderCount,
  fetchNFTContractHolders,
} from '@/data/nft-tokens/contract';

type Props = PageProps<'/[lang]/nft-tokens/[token]/holders'>;

const HoldersPage = async ({ params, searchParams }: Props) => {
  const [{ token }, filters] = await Promise.all([params, searchParams]);
  const holdersPromise = fetchNFTContractHolders(token, filters);
  const holderCountPromise = fetchNFTContractHolderCount(token);
  const contractPromise = fetchNFTContract(token);

  return (
    <ErrorSuspense fallback={<NftTokenHolders loading />}>
      <NftTokenHolders
        contractPromise={contractPromise}
        holderCountPromise={holderCountPromise}
        holdersPromise={holdersPromise}
      />
    </ErrorSuspense>
  );
};

export default HoldersPage;
