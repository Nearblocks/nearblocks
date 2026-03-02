import { ErrorSuspense } from '@/components/error-suspense';
import { NftHeader } from '@/components/nft-tokens/token/header';
import { NftOverview } from '@/components/nft-tokens/token/token/overview';
import { NftTransfers } from '@/components/nft-tokens/token/token/transfers';
import {
  fetchNFTContract,
  fetchNFTToken,
  fetchNFTTokenTxnCount,
  fetchNFTTokenTxns,
} from '@/data/nft-tokens/contract';

type Props = PageProps<'/[lang]/nft-tokens/[cid]/tokens/[tid]'>;

const TokenDetailPage = async ({ params, searchParams }: Props) => {
  const [{ cid, tid }, filters] = await Promise.all([params, searchParams]);
  const tokenPromise = fetchNFTToken(cid, tid);
  const contractPromise = fetchNFTContract(cid);
  const txnsPromise = fetchNFTTokenTxns(cid, tid, filters);
  const txnCountPromise = fetchNFTTokenTxnCount(cid, tid, filters);

  return (
    <>
      <NftHeader
        cid={cid}
        contractPromise={contractPromise}
        tokenPromise={tokenPromise}
      />
      <ErrorSuspense fallback={<NftOverview cid={cid} loading />}>
        <NftOverview
          cid={cid}
          contractPromise={contractPromise}
          tokenPromise={tokenPromise}
        />
      </ErrorSuspense>
      <ErrorSuspense fallback={<NftTransfers loading />}>
        <NftTransfers
          txnCountPromise={txnCountPromise}
          txnsPromise={txnsPromise}
        />
      </ErrorSuspense>
    </>
  );
};

export default TokenDetailPage;
