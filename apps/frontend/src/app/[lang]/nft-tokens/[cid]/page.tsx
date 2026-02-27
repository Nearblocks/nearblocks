import { ErrorSuspense } from '@/components/error-suspense';
import { NftTokenTransfers } from '@/components/nft-tokens/token/transfers';
import {
  fetchNFTContractTxnCount,
  fetchNFTContractTxns,
} from '@/data/nft-tokens/contract';

type Props = PageProps<'/[lang]/nft-tokens/[cid]'>;

const NftTokenPage = async ({ params, searchParams }: Props) => {
  const [{ cid }, filters] = await Promise.all([params, searchParams]);
  const txnsPromise = fetchNFTContractTxns(cid, filters);
  const txnCountPromise = fetchNFTContractTxnCount(cid, filters);

  return (
    <ErrorSuspense fallback={<NftTokenTransfers loading />}>
      <NftTokenTransfers
        txnCountPromise={txnCountPromise}
        txnsPromise={txnsPromise}
      />
    </ErrorSuspense>
  );
};

export default NftTokenPage;
