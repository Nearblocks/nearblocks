import type { Metadata } from 'next';

import { AddressesChart } from '@/components/charts/charts';
import { ErrorSuspense } from '@/components/error-suspense';
import { fetchDailyStats } from '@/data/charts';
import { hasLocale, translator } from '@/locales/dictionaries';

type Props = PageProps<'/[lang]/charts/addresses'>;

export const generateMetadata = async ({
  params,
}: Props): Promise<Metadata> => {
  const { lang } = await params;
  const locale = hasLocale(lang) ? lang : 'en';
  const t = await translator(locale, 'charts');

  return {
    alternates: { canonical: '/charts/addresses' },
    description: t('addresses.meta.description'),
    title: t('addresses.meta.title'),
  };
};

const AddressesPage = async ({ params }: Props) => {
  const { lang } = await params;
  const locale = hasLocale(lang) ? lang : 'en';
  const t = await translator(locale, 'charts');
  const statsPromise = fetchDailyStats();

  return (
    <>
      <h1 className="text-headline-lg mb-6">{t('addresses.heading')}</h1>
      <ErrorSuspense fallback={<AddressesChart loading />}>
        <AddressesChart statsPromise={statsPromise} />
      </ErrorSuspense>
    </>
  );
};

export default AddressesPage;
