import TokenTxnsSkeleton from '@/components/app/skeleton/ft/Tokentxns';
import Transfers from '@/components/app/Tokens/FTTransfers';
import { getTranslations } from 'next-intl/server';
import { Suspense } from 'react';

export default async function TokenTxns({
  searchParams,
  params: { locale },
}: {
  searchParams: any;
  params: { locale: string };
}) {
  const t = await getTranslations({ locale });

  return (
    <section>
      <div className="bg-hero-pattern dark:bg-hero-pattern-dark h-72">
        <div className="container mx-auto px-3">
          <h1 className="mb-4 pt-8 sm:!text-2xl text-xl text-white dark:text-neargray-10 font-medium">
            {t ? t('fts.heading') : 'Token Transfers'}
          </h1>
        </div>
      </div>
      <div className="container mx-auto px-3 -mt-48 ">
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
