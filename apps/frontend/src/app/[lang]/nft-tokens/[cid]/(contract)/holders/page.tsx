import { ErrorSuspense } from '@/components/error-suspense';
import { NftTokenHolders } from '@/components/nft-tokens/token/holders';
import {
  fetchNFTContract,
  fetchNFTContractHolderCount,
  fetchNFTContractHolders,
} from '@/data/nft-tokens/contract';
import { holdNav } from '@/lib/hold-nav';

type Props = PageProps<'/[lang]/nft-tokens/[cid]/holders'>;

const HoldersPage = async ({ params, searchParams }: Props) => {
  const [{ cid }, filters] = await Promise.all([params, searchParams]);
  const holdersPromise = fetchNFTContractHolders(cid, filters);
  const holderCountPromise = fetchNFTContractHolderCount(cid);
  const contractPromise = fetchNFTContract(cid);
  await holdNav();

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
