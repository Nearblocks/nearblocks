export const runtime = 'edge';

import { Suspense } from 'react';

import AccountTabs from '@/components/app/Address/AccountTabs';
import Balance from '@/components/app/Address/Balance';
import BalanceSkeleton from '@/components/app/skeleton/address/balance';
import TabSkeletion from '@/components/app/skeleton/address/tab';

export default async function AddressIndex({
  params: { id, locale },
  searchParams,
}: {
  params: { id: string; locale: string };
  searchParams: { cursor?: string; order: string; p?: string; tab: string };
}) {
  return (
    <>
      <Suspense fallback={<BalanceSkeleton />}>
        <Balance id={id} />
      </Suspense>

      <div className="py-6"></div>

      <Suspense fallback={<TabSkeletion />}>
        <AccountTabs id={id} locale={locale} searchParams={searchParams} />
      </Suspense>
    </>
  );
}

export const revalidate = 20;
