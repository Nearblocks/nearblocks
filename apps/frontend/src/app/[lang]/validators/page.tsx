import { Metadata } from 'next';

import { ErrorSuspense } from '@/components/error-suspense';
import { PageHeading } from '@/components/page-heading';
import { RpcSelector } from '@/components/rpc';
import { Validators } from '@/components/validators';
import { fetchBlocks } from '@/data/home';
import { fetchStats } from '@/data/layout';
import { fetchValidators } from '@/data/validators';
import { hasLocale, translator } from '@/locales/dictionaries';

type Props = PageProps<'/[lang]/validators'>;

export const generateMetadata = async ({
  params,
}: Props): Promise<Metadata> => {
  const { lang } = await params;
  const locale = hasLocale(lang) ? lang : 'en';
  const t = await translator(locale, 'validators');

  return {
    alternates: { canonical: '/validators' },
    description: t('meta.description'),
    title: t('meta.title'),
  };
};

const ValidatorsPage = async ({ params, searchParams }: Props) => {
  const { lang } = await params;
  const locale = hasLocale(lang) ? lang : 'en';
  const t = await translator(locale, 'validators');
  const filters = await searchParams;
  const validatorsPromise = fetchValidators(filters);
  const statsPromise = fetchStats();
  const latestBlocksPromise = fetchBlocks();

  return (
    <>
      <PageHeading apiTag="staking" title={t('title')}>
        <RpcSelector />
      </PageHeading>
      <ErrorSuspense fallback={<Validators loading />}>
        <Validators
          latestBlocksPromise={latestBlocksPromise}
          statsPromise={statsPromise}
          validatorsPromise={validatorsPromise}
        />
      </ErrorSuspense>
    </>
  );
};

export default ValidatorsPage;
