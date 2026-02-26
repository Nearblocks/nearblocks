import { ErrorSuspense } from '@/components/error-suspense';
import { NftTokenTransfers } from '@/components/nft-tokens/token/transfers';
import {
  fetchNFTContractTxnCount,
  fetchNFTContractTxns,
} from '@/data/nft-tokens/contract';

type Props = PageProps<'/[lang]/nft-tokens/[token]'>;

const NftTokenPage = async ({ params, searchParams }: Props) => {
  const [{ token }, filters] = await Promise.all([params, searchParams]);
  const nftsPromise = fetchNFTContractTxns(token, filters);
  const nftCountPromise = fetchNFTContractTxnCount(token, filters);

  return (
    <ErrorSuspense fallback={<NftTokenTransfers loading />}>
      <NftTokenTransfers
        nftCountPromise={nftCountPromise}
        nftsPromise={nftsPromise}
      />
    </ErrorSuspense>
  );
};

export default NftTokenPage;
