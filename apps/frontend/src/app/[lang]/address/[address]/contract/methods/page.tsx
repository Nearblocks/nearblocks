import { redirect } from 'next/navigation';

import { ContractMethods } from '@/components/address/contract/methods';
import { ErrorSuspense } from '@/components/error-suspense';
import { fetchContract, fetchSchema } from '@/data/address/contract';

type Props = PageProps<'/[lang]/address/[address]/contract/methods'>;

const MethodsPage = async ({ params }: Props) => {
  const { address } = await params;
  const contract = await fetchContract(address);
  const schemaPromise = fetchSchema(address);

  if (!contract) return redirect(`/address/${address}`);

  return (
    <ErrorSuspense fallback={<ContractMethods loading />}>
      <ContractMethods methodsPromise={schemaPromise} />
    </ErrorSuspense>
  );
};

export default MethodsPage;
