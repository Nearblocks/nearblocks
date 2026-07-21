import type { Metadata } from 'next';

import { IntentsVolumeChart } from '@/components/charts/intents-volume';
import { ErrorSuspense } from '@/components/error-suspense';
import { PageHeading } from '@/components/page-heading';
import { fetchIntentsVolumeStats } from '@/data/charts';
import { holdNav } from '@/lib/hold-nav';
import { hasLocale, translator } from '@/locales/dictionaries';

type Props = PageProps<'/[lang]/charts/intents-volume'>;

export const generateMetadata = async ({
  params,
}: Props): Promise<Metadata> => {
  const { lang } = await params;
  const locale = hasLocale(lang) ? lang : 'en';
  const t = await translator(locale, 'charts');

  return {
    alternates: { canonical: '/charts/intents-volume' },
    description: t('intentsVolume.meta.description'),
    title: t('intentsVolume.meta.title'),
  };
};

const IntentsVolumePage = async ({ params }: Props) => {
  const { lang } = await params;
  const locale = hasLocale(lang) ? lang : 'en';
  const t = await translator(locale, 'charts');
  const statsPromise = fetchIntentsVolumeStats();
  await holdNav();

  return (
    <>
      <PageHeading apiTag="" title={t('intentsVolume.heading')} />
      <ErrorSuspense fallback={<IntentsVolumeChart loading />}>
        <IntentsVolumeChart statsPromise={statsPromise} />
      </ErrorSuspense>
    </>
  );
};

export default IntentsVolumePage;
