import { ErrorSuspense } from '@/components/error-suspense';
import { TokenFaq } from '@/components/tokens/token/faq';
import { fetchDeployments } from '@/data/address/contract';
import {
  fetchFTContract,
  fetchFTContractHolderCount,
  fetchFTContractTxnCount,
} from '@/data/tokens/contract';

type Props = PageProps<'/[lang]/tokens/[cid]/faq'>;

const FaqPage = async ({ params }: Props) => {
  const { cid } = await params;
  const contractPromise = fetchFTContract(cid);
  const deploymentsPromise = fetchDeployments(cid);
  const txnCountPromise = fetchFTContractTxnCount(cid, {});
  const holderCountPromise = fetchFTContractHolderCount(cid);

  return (
    <ErrorSuspense fallback={<TokenFaq loading />}>
      <TokenFaq
        contractPromise={contractPromise}
        deploymentsPromise={deploymentsPromise}
        holderCountPromise={holderCountPromise}
        txnCountPromise={txnCountPromise}
      />
    </ErrorSuspense>
  );
};

export default FaqPage;
