import { ErrorSuspense } from '@/components/error-suspense';
import { NftTokens } from '@/components/nft-tokens/token/token';
import {
  fetchNFTContract,
  fetchNFTContractTokenCount,
  fetchNFTContractTokens,
} from '@/data/nft-tokens/contract';
import { holdNav } from '@/lib/hold-nav';

type Props = PageProps<'/[lang]/nft-tokens/[cid]/tokens'>;

const TokensPage = async ({ params, searchParams }: Props) => {
  const [{ cid }, filters] = await Promise.all([params, searchParams]);
  const tokensPromise = fetchNFTContractTokens(cid, {
    ...filters,
    limit: '24',
  });
  const tokenCountPromise = fetchNFTContractTokenCount(cid);
  const contractPromise = fetchNFTContract(cid);
  await holdNav();

  return (
    <ErrorSuspense fallback={<NftTokens loading />}>
      <NftTokens
        contractPromise={contractPromise}
        tokenCountPromise={tokenCountPromise}
        tokensPromise={tokensPromise}
      />
    </ErrorSuspense>
  );
};

export default TokensPage;
