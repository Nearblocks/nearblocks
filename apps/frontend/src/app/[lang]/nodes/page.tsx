import { Metadata } from 'next';

import { ErrorSuspense } from '@/components/error-suspense';
import { NodesMap } from '@/components/nodes/nodes-map';
import { PageHeading } from '@/components/page-heading';
import { fetchNodeStats } from '@/data/nodes';
import { holdNav } from '@/lib/hold-nav';
import { hasLocale, translator } from '@/locales/dictionaries';

type Props = PageProps<'/[lang]/nodes'>;

// Unlisted preview: not linked from the site and kept out of search engines.
export const generateMetadata = async ({
  params,
}: Props): Promise<Metadata> => {
  const { lang } = await params;
  const locale = hasLocale(lang) ? lang : 'en';
  const t = await translator(locale, 'validators');
  return {
    robots: { follow: false, index: false },
    title: t('nodesMap.title'),
  };
};

const NodesPage = async ({ params }: Props) => {
  const { lang } = await params;
  const locale = hasLocale(lang) ? lang : 'en';
  const t = await translator(locale, 'validators');
  const statsPromise = fetchNodeStats();
  await holdNav();

  return (
    <>
      <PageHeading title={t('nodesMap.title')} />
      <ErrorSuspense fallback={<NodesMap loading />}>
        <NodesMap statsPromise={statsPromise} />
      </ErrorSuspense>
    </>
  );
};

export default NodesPage;
