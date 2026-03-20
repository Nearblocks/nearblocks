import type { Metadata } from 'next';

import { TxnVolumeChart } from '@/components/charts/charts';
import { ErrorSuspense } from '@/components/error-suspense';
import { fetchDailyStats } from '@/data/charts';
import { hasLocale, translator } from '@/locales/dictionaries';

type Props = PageProps<'/[lang]/charts/txn-volume'>;

export const generateMetadata = async ({
  params,
}: Props): Promise<Metadata> => {
  const { lang } = await params;
  const locale = hasLocale(lang) ? lang : 'en';
  const t = await translator(locale, 'charts');
  return {
    alternates: { canonical: '/charts/txn-volume' },
    description: t('txnVolume.meta.description'),
    title: t('txnVolume.meta.title'),
  };
};

const TxnVolumePage = async ({ params }: Props) => {
  const { lang } = await params;
  const locale = hasLocale(lang) ? lang : 'en';
  const t = await translator(locale, 'charts');
  const statsPromise = fetchDailyStats();

  return (
    <>
      <h1 className="text-headline-lg mb-6">{t('txnVolume.heading')}</h1>
      <ErrorSuspense fallback={<TxnVolumeChart loading />}>
        <TxnVolumeChart statsPromise={statsPromise} />
      </ErrorSuspense>
    </>
  );
};

export default TxnVolumePage;
