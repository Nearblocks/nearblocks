import { redirect } from 'next/navigation';

import { SubAccounts } from '@/components/address/subaccounts';
import { ErrorSuspense } from '@/components/error-suspense';
import {
  fetchSubAccountCount,
  fetchSubAccounts,
} from '@/data/address/subaccounts';
import { holdNav } from '@/lib/hold-nav';

type Props = PageProps<'/[lang]/address/[address]/subaccounts'>;

const SubAccountsPage = async ({ params, searchParams }: Props) => {
  const [{ address }, filters] = await Promise.all([params, searchParams]);

  if (!address.includes('.')) return redirect(`/address/${address}`);

  const subAccountsPromise = fetchSubAccounts(address, filters);
  const subAccountCountPromise = fetchSubAccountCount(address);
  await holdNav();

  return (
    <ErrorSuspense fallback={<SubAccounts loading />}>
      <SubAccounts
        subAccountCountPromise={subAccountCountPromise}
        subAccountsPromise={subAccountsPromise}
      />
    </ErrorSuspense>
  );
};

export default SubAccountsPage;
