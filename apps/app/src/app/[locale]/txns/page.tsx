import { getTranslations } from 'next-intl/server';
import { Suspense } from 'react';

import ListSkeletion from '@/components/app/skeleton/txns/List';
import List from '@/components/app/Transactions/List';

export default async function TransactionList(props: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    cursor?: string;
    from?: string;
    method?: string;
    order: string;
    page?: string;
    to?: string;
  }>;
}) {
  const searchParams = await props.searchParams;
  const params = await props.params;

  const { locale } = params;
  const { cursor, page, ...rest } = searchParams;

  const t = await getTranslations({ locale });

  return (
    <>
      <div className="bg-hero-pattern dark:bg-hero-pattern-dark h-72">
        <div className="container-xxl mx-auto px-5">
          <h1
            className="mb-4 pt-8 sm:!text-2xl text-xl text-white font-medium"
            suppressHydrationWarning={true}
          >
            {t('txnsHeading') || 'Latest Near Protocol Transactions'}
          </h1>
        </div>
      </div>
      <div className="container-xxl mx-auto px-5 -mt-48">
        <div className="relative block lg:flex lg:space-x-2">
          <div className=" w-full">
            <Suspense fallback={<ListSkeletion />} key={JSON.stringify(rest)}>
              <List searchParams={searchParams} />
            </Suspense>
          </div>
        </div>
      </div>
      <div className="py-8"></div>
    </>
  );
}
