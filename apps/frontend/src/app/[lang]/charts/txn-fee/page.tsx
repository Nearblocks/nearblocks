import type { Metadata } from 'next';

import { TxnFeeChart } from '@/components/charts/charts';
import { ErrorSuspense } from '@/components/error-suspense';
import { fetchDailyStats } from '@/data/charts';
import { hasLocale, translator } from '@/locales/dictionaries';

type Props = PageProps<'/[lang]/charts/txn-fee'>;

export const generateMetadata = async ({
  params,
}: Props): Promise<Metadata> => {
  const { lang } = await params;
  const locale = hasLocale(lang) ? lang : 'en';
  const t = await translator(locale, 'charts');
  return {
    alternates: { canonical: '/charts/txn-fee' },
    description: t('txnFee.meta.description'),
    title: t('txnFee.meta.title'),
  };
};

const TxnFeePage = async ({ params }: Props) => {
  const { lang } = await params;
  const locale = hasLocale(lang) ? lang : 'en';
  const t = await translator(locale, 'charts');
  const statsPromise = fetchDailyStats();

  return (
    <>
      <h1 className="text-headline-lg mb-6">{t('txnFee.heading')}</h1>
      <ErrorSuspense fallback={<TxnFeeChart loading />}>
        <TxnFeeChart statsPromise={statsPromise} />
      </ErrorSuspense>
    </>
  );
};

export default TxnFeePage;
