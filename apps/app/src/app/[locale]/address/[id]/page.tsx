import { Suspense } from 'react';

import AccountTabs from '@/components/app/Address/AccountTabs';
import TabSkeletion from '@/components/app/skeleton/address/tab';

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

  const { cursor, page, ...rest } = searchParams;

  return (
    <>
      <Suspense fallback={<TabSkeletion />} key={JSON.stringify(rest)}>
        <AccountTabs id={id} searchParams={searchParams} />
      </Suspense>
    </>
  );
}
