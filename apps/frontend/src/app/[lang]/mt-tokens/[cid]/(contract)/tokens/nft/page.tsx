import { ErrorSuspense } from '@/components/error-suspense';
import { MtNftTokenList } from '@/components/mt-tokens/contract/tokens/nft';
import {
  fetchMTContractTokenCount,
  fetchMTContractTokens,
} from '@/data/mt-tokens/contract';

type Props = PageProps<'/[lang]/mt-tokens/[cid]/tokens/nft'>;

const NftTokensPage = async ({ params, searchParams }: Props) => {
  const [{ cid }, filters] = await Promise.all([params, searchParams]);
  const tokensPromise = fetchMTContractTokens(cid, {
    ...filters,
    limit: '24',
    type: 'nft',
  });
  const tokenCountPromise = fetchMTContractTokenCount(cid, { type: 'nft' });

  return (
    <ErrorSuspense fallback={<MtNftTokenList cid={cid} loading />}>
      <MtNftTokenList
        cid={cid}
        tokenCountPromise={tokenCountPromise}
        tokensPromise={tokensPromise}
      />
    </ErrorSuspense>
  );
};

export default NftTokensPage;
