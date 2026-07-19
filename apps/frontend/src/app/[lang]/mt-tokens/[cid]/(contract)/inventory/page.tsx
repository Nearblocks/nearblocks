import { ErrorSuspense } from '@/components/error-suspense';
import { MtFtTokenList } from '@/components/mt-tokens/contract/tokens/ft';
import {
  fetchMTContractTokenCount,
  fetchMTContractTokens,
} from '@/data/mt-tokens/contract';
import { holdNav } from '@/lib/hold-nav';

type Props = PageProps<'/[lang]/mt-tokens/[cid]/inventory'>;

const FtTokensPage = async ({ params, searchParams }: Props) => {
  const [{ cid }, filters] = await Promise.all([params, searchParams]);
  const tokensPromise = fetchMTContractTokens(cid, {
    ...filters,
    limit: '36',
    type: 'ft',
  });
  const tokenCountPromise = fetchMTContractTokenCount(cid, { type: 'ft' });
  await holdNav();

  return (
    <ErrorSuspense fallback={<MtFtTokenList cid={cid} loading />}>
      <MtFtTokenList
        cid={cid}
        tokenCountPromise={tokenCountPromise}
        tokensPromise={tokensPromise}
      />
    </ErrorSuspense>
  );
};

export default FtTokensPage;
