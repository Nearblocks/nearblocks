import { redirect } from 'next/navigation';

import { ContractCode } from '@/components/address/contract/code';
import { fetchContract } from '@/data/address/contract';

type Props = PageProps<'/[lang]/address/[address]/contract/code'>;

const CodePage = async ({ params }: Props) => {
  const { address } = await params;
  const contract = await fetchContract(address);

  if (!contract) return redirect(`/address/${address}`);

  return <ContractCode contract={contract} />;
};

export default CodePage;
