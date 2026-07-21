import type { Metadata } from 'next';

import { ErrorSuspense } from '@/components/error-suspense';
import { MtTokenTransfers } from '@/components/mt-tokens/transfers';
import { PageHeading } from '@/components/page-heading';
import {
  fetchNearIntentsTxnCount,
  fetchNearIntentsTxns,
} from '@/data/near-intents';
import { holdNav } from '@/lib/hold-nav';
import { hasLocale, translator } from '@/locales/dictionaries';

type Props = PageProps<'/[lang]/near-intents/transfers'>;

export const generateMetadata = async ({
  params,
}: Props): Promise<Metadata> => {
  const { lang } = await params;
  const locale = hasLocale(lang) ? lang : 'en';
  const t = await translator(locale, 'mts');

  return {
    alternates: { canonical: '/near-intents/transfers' },
    description: t('nearIntents.transfers.meta.description'),
    title: t('nearIntents.transfers.meta.title'),
  };
};

const NearIntentsTransfersPage = async ({ params, searchParams }: Props) => {
  const { lang } = await params;
  const locale = hasLocale(lang) ? lang : 'en';
  const t = await translator(locale, 'mts');
  const filters = await searchParams;

  const txnsPromise = fetchNearIntentsTxns(filters);
  const txnCountPromise = fetchNearIntentsTxnCount(filters);
  await holdNav();

  return (
    <>
      <PageHeading apiTag="mts" title={t('nearIntents.transfers.heading')} />
      <ErrorSuspense fallback={<MtTokenTransfers loading />}>
        <MtTokenTransfers
          txnCountPromise={txnCountPromise}
          txnsPromise={txnsPromise}
        />
      </ErrorSuspense>
    </>
  );
};

export default NearIntentsTransfersPage;
