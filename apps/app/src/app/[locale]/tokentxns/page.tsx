export const runtime = 'edge';

import { getTranslations } from 'next-intl/server';
import { Suspense } from 'react';

import TokenTxnsSkeleton from '@/components/app/skeleton/ft/Tokentxns';
import Transfers from '@/components/app/Tokens/FTTransfers';

export default async function TokenTxns(props: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<any>;
}) {
  const searchParams = await props.searchParams;
  const params = await props.params;

  const { locale } = params;

  const t = await getTranslations({ locale });

  return (
    <section>
      <div className="bg-hero-pattern dark:bg-hero-pattern-dark h-72">
        <div className="container-xxl mx-auto px-5">
          <h1 className="mb-4 pt-8 sm:!text-2xl text-xl text-white dark:text-neargray-10 font-medium">
            {t ? t('fts.heading') : 'Token Transfers'}
          </h1>
        </div>
      </div>
      <div className="container-xxl mx-auto px-5 -mt-48 ">
        <div className="relative block lg:flex lg:space-x-2">
          <div className="w-full ">
            <Suspense fallback={<TokenTxnsSkeleton />}>
              <Transfers searchParams={searchParams} />
            </Suspense>
          </div>
        </div>
      </div>
      <div className="py-8"></div>
    </section>
  );
}
