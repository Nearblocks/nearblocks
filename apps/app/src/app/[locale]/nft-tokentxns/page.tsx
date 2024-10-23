import TransfersList from '@/components/app/Tokens/NFTTransfers';
import { getTranslations } from 'next-intl/server';

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
        <div className="container mx-auto px-3">
          <h1 className="mb-4 pt-8 sm:!text-2xl text-xl text-white dark:text-neargray-10">
            {t ? t('nfts.heading') : 'Non-Fungible Token Transfers'}
          </h1>
        </div>
      </div>
      <div className="container mx-auto px-3 -mt-48 ">
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
