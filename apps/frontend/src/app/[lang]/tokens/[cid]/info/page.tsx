import { ErrorSuspense } from '@/components/error-suspense';
import { TokenInfo } from '@/components/tokens/token/info';
import { fetchFTContract } from '@/data/tokens/contract';

type Props = PageProps<'/[lang]/tokens/[cid]/info'>;

const InfoPage = async ({ params }: Props) => {
  const { cid } = await params;
  const contractPromise = fetchFTContract(cid);

  return (
    <ErrorSuspense fallback={<TokenInfo loading />}>
      <TokenInfo contractPromise={contractPromise} />
    </ErrorSuspense>
  );
};

export default InfoPage;
