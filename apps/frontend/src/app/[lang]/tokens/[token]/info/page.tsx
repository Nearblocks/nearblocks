import { ErrorSuspense } from '@/components/error-suspense';
import { TokenInfo } from '@/components/tokens/token/info';
import { fetchFTContract } from '@/data/tokens/contract';

type Props = PageProps<'/[lang]/tokens/[token]/info'>;

const InfoPage = async ({ params }: Props) => {
  const { token } = await params;
  const contractPromise = fetchFTContract(token);

  return (
    <ErrorSuspense fallback={<TokenInfo loading />}>
      <TokenInfo contractPromise={contractPromise} />
    </ErrorSuspense>
  );
};

export default InfoPage;
