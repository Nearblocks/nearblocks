import { redirect } from 'next/navigation';

import { Contract } from '@/components/address/contract';
import { ErrorSuspense } from '@/components/error-suspense';
import { fetchAccount } from '@/data/address';
import { fetchContract, fetchDeployments } from '@/data/address/contract';

type Props = PageProps<'/[lang]/address/[address]/contract'>;

const ContractPage = async ({ params }: Props) => {
  const { address } = await params;
  const contract = await fetchContract(address);
  const accountPromise = fetchAccount(address);
  const deploymentsPromise = fetchDeployments(address);

  if (!contract) return redirect(`/address/${address}`);

  return (
    <ErrorSuspense fallback={<Contract loading />}>
      <Contract
        accountPromise={accountPromise}
        contract={contract}
        deploymentsPromise={deploymentsPromise}
      />
    </ErrorSuspense>
  );
};

export default ContractPage;
