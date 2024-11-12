export const runtime = 'edge';

import { getTranslations } from 'next-intl/server';
import { Suspense } from 'react';

import ListSkeletion from '@/components/app/skeleton/txns/List';
import List from '@/components/app/Transactions/List';

export default async function TransactionList({
  params: { locale },
  searchParams,
}: {
  params: { locale: string };
  searchParams: { cursor?: string; order: string; p?: string };
}) {
  const t = await getTranslations({ locale });

  return (
    <>
      <div className="bg-hero-pattern dark:bg-hero-pattern-dark h-72">
        <div className="container mx-auto px-3">
          <h1
            className="mb-4 pt-8 sm:!text-2xl text-xl text-white font-medium"
            suppressHydrationWarning={true}
          >
            {t('txnsHeading') || 'Latest Near Protocol Transactions'}
          </h1>
        </div>
      </div>
      <div className="container mx-auto px-3 -mt-48">
        <div className="relative block lg:flex lg:space-x-2">
          <div className=" w-full">
            <Suspense fallback={<ListSkeletion />}>
              <List searchParams={searchParams} />
            </Suspense>
          </div>
        </div>
      </div>
      <div className="py-8"></div>
    </>
  );
}

export const revalidate = 10;
