import { ErrorSuspense } from '@/components/error-suspense';
import { Tokens } from '@/components/tokens';
import { fetchTokenCount, fetchTokens } from '@/data/tokens';

type Props = PageProps<'/[lang]/tokens'>;

const TokensPage = async ({ searchParams }: Props) => {
  const filters = await searchParams;
  const tokensPromise = fetchTokens(filters);
  const tokenCountPromise = fetchTokenCount(filters);

  return (
    <>
      <h1 className="text-headline-lg mb-6">Token Tracker (NEP-141)</h1>
      <ErrorSuspense fallback={<Tokens loading />}>
        <Tokens
          tokenCountPromise={tokenCountPromise}
          tokensPromise={tokensPromise}
        />
      </ErrorSuspense>
    </>
  );
};

export default TokensPage;
