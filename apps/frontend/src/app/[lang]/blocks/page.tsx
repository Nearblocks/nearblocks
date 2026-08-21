import { Metadata } from 'next';

import { Blocks } from '@/components/blocks';
import { ErrorSuspense } from '@/components/error-suspense';
import { PageHeading } from '@/components/page-heading';
import { fetchBlockCount, fetchBlocks, fetchBlockStats } from '@/data/blocks';
import { holdNav } from '@/lib/hold-nav';
import { queryRobots } from '@/lib/metadata';
import { hasLocale, translator } from '@/locales/dictionaries';

type Props = PageProps<'/[lang]/blocks'>;

export const generateMetadata = async ({
  params,
  searchParams,
}: Props): Promise<Metadata> => {
  const { lang } = await params;
  const filters = await searchParams;
  const locale = hasLocale(lang) ? lang : 'en';
  const t = await translator(locale, 'blocks');

  return {
    ...queryRobots(filters),
    alternates: { canonical: '/blocks' },
    description: t('meta.description'),
    title: t('meta.title'),
  };
};

const BlocksPage = async ({ params, searchParams }: Props) => {
  const { lang } = await params;
  const filters = await searchParams;
  const locale = hasLocale(lang) ? lang : 'en';
  const t = await translator(locale, 'blocks');
  const blocksPromise = fetchBlocks(filters);
  const blockCountPromise = fetchBlockCount();
  const blockStatsPromise = fetchBlockStats();
  await holdNav();

  return (
    <>
      <PageHeading apiTag="blocks" title={t('heading')} />
      <ErrorSuspense fallback={<Blocks loading />}>
        <Blocks
          blockCountPromise={blockCountPromise}
          blocksPromise={blocksPromise}
          blockStatsPromise={blockStatsPromise}
        />
      </ErrorSuspense>
    </>
  );
};

export default BlocksPage;
