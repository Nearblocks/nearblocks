import { ErrorSuspense } from '@/components/error-suspense';
import { TokenFaq } from '@/components/tokens/token/faq';
import { fetchDeployments } from '@/data/address/contract';
import {
  fetchFTContract,
  fetchFTContractHolderCount,
  fetchFTContractTxnCount,
} from '@/data/tokens/contract';

type Props = PageProps<'/[lang]/tokens/[token]/faq'>;

const FaqPage = async ({ params }: Props) => {
  const { token } = await params;
  const contractPromise = fetchFTContract(token);
  const deploymentsPromise = fetchDeployments(token);
  const txCountPromise = fetchFTContractTxnCount(token, {});
  const holderCountPromise = fetchFTContractHolderCount(token);

  return (
    <ErrorSuspense fallback={<TokenFaq loading />}>
      <TokenFaq
        contractPromise={contractPromise}
        deploymentsPromise={deploymentsPromise}
        holderCountPromise={holderCountPromise}
        txCountPromise={txCountPromise}
      />
    </ErrorSuspense>
  );
};

export default FaqPage;
