export const runtime = 'edge';

import { getTranslations } from 'next-intl/server';

import TransfersList from '@/components/app/Tokens/NFTTransfers';

export default async function NFTTokentxns({
  params: { locale },
  searchParams,
}: {
  params: { locale: string };
  searchParams: any;
}) {
  const t = await getTranslations({ locale });

  return (
    <section>
      <div className="bg-hero-pattern dark:bg-hero-pattern-dark h-72">
        <div className="container-xxl mx-auto px-5">
          <h1 className="mb-4 pt-8 sm:!text-2xl text-xl text-white dark:text-neargray-10 font-medium">
            {t ? t('nfts.heading') : 'Non-Fungible Token Transfers'}
          </h1>
        </div>
      </div>
      <div className="container-xxl mx-auto px-5 -mt-48 ">
        <div className="relative block lg:flex lg:space-x-2">
          <div className="w-full ">
            <TransfersList searchParams={searchParams} />
          </div>
        </div>
      </div>
      <div className="py-8"></div>
    </section>
  );
}
