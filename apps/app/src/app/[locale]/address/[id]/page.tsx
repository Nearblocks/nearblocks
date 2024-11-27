export const runtime = 'edge';

export const revalidate = 60;

import { Suspense } from 'react';

import AccountTabs from '@/components/app/Address/AccountTabs';
import Balance from '@/components/app/Address/Balance';
import BalanceSkeleton from '@/components/app/skeleton/address/balance';
import TabSkeletion from '@/components/app/skeleton/address/tab';

export default async function AddressIndex(props: {
  params: Promise<{ id: string; locale: string }>;
  searchParams: Promise<{
    cursor?: string;
    order: string;
    p?: string;
    tab: string;
  }>;
}) {
  const searchParams = await props.searchParams;
  const params = await props.params;

  const { id, locale } = params;

  return (
    <>
      <Suspense fallback={<BalanceSkeleton />}>
        <Balance id={id} />
      </Suspense>

      <div className="py-3"></div>

      <Suspense fallback={<TabSkeletion />}>
        <AccountTabs id={id} locale={locale} searchParams={searchParams} />
      </Suspense>
    </>
  );
}
