import type { Metadata } from 'next';

import { ErrorSuspense } from '@/components/error-suspense';
import { MtTokenTransfers } from '@/components/mt-tokens/transfers';
import { PageHeading } from '@/components/page-heading';
import {
  fetchNearIntentsTxnCount,
  fetchNearIntentsTxns,
} from '@/data/near-intents';
import { hasLocale, translator } from '@/locales/dictionaries';

type Props = PageProps<'/[lang]/near-intents'>;

export const generateMetadata = async ({
  params,
}: Props): Promise<Metadata> => {
  const { lang } = await params;
  const locale = hasLocale(lang) ? lang : 'en';
  const t = await translator(locale, 'mts');

  return {
    alternates: { canonical: '/near-intents' },
    description: t('nearIntents.meta.description'),
    title: t('nearIntents.meta.title'),
  };
};

const NearIntentsPage = async ({ params, searchParams }: Props) => {
  const { lang } = await params;
  const locale = hasLocale(lang) ? lang : 'en';
  const t = await translator(locale, 'mts');
  const filters = await searchParams;

  const txnsPromise = fetchNearIntentsTxns(filters);
  const txnCountPromise = fetchNearIntentsTxnCount(filters);

  return (
    <>
      <PageHeading apiTag="mts" title={t('nearIntents.heading')} />
      <ErrorSuspense fallback={<MtTokenTransfers loading />}>
        <MtTokenTransfers
          txnCountPromise={txnCountPromise}
          txnsPromise={txnsPromise}
        />
      </ErrorSuspense>
    </>
  );
};

export default NearIntentsPage;
