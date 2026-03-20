import type { Metadata } from 'next';

import { PriceChart } from '@/components/charts/charts';
import { ErrorSuspense } from '@/components/error-suspense';
import { fetchDailyStats } from '@/data/charts';
import { hasLocale, translator } from '@/locales/dictionaries';

type Props = PageProps<'/[lang]/charts/near-price'>;

export const generateMetadata = async ({
  params,
}: Props): Promise<Metadata> => {
  const { lang } = await params;
  const locale = hasLocale(lang) ? lang : 'en';
  const t = await translator(locale, 'charts');
  return {
    alternates: { canonical: '/charts/near-price' },
    description: t('nearPrice.meta.description'),
    title: t('nearPrice.meta.title'),
  };
};

const NearPricePage = async ({ params }: Props) => {
  const { lang } = await params;
  const locale = hasLocale(lang) ? lang : 'en';
  const t = await translator(locale, 'charts');
  const statsPromise = fetchDailyStats();

  return (
    <>
      <h1 className="text-headline-lg mb-6">{t('nearPrice.heading')}</h1>
      <ErrorSuspense fallback={<PriceChart loading />}>
        <PriceChart statsPromise={statsPromise} />
      </ErrorSuspense>
    </>
  );
};

export default NearPricePage;
