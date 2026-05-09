import AccountTabs from '@/components/app/Address/AccountTabs';
import { AddressRpcProvider } from '@/components/app/common/AddressRpcProvider';
import Balance from '@/components/app/Address/Balance';
import { getRequest } from '@/utils/app/api';

export default async function AddressIndex(props: {
  params: Promise<{ id: string; locale: string }>;
  searchParams: Promise<{
    cursor?: string;
    event: string;
    from: string;
    involved: string;
    method: string;
    order: string;
    page?: string;
    tab: string;
    to: string;
  }>;
}) {
  const searchParams = await props.searchParams;
  const params = await props.params;

  const { id: address } = params;
  const id = address?.toLowerCase();
  const contractPromise = getRequest(`v1/account/${id}/contract`);
  const contractMetaPromise = contractPromise.then((data: any) => {
    if (data?.contract?.[0]?.code_base64) {
      return {
        ...data,
        contract: [{ ...data.contract[0], code_base64: '1' }],
      };
    }
    return data;
  });

  return (
    <AddressRpcProvider contractPromise={contractMetaPromise} accountId={id}>
      <Balance id={id} />
      <div className="py-2"></div>
      <AccountTabs
        id={id}
        searchParams={searchParams}
        contractPromise={contractPromise}
      />
    </AddressRpcProvider>
  );
}
