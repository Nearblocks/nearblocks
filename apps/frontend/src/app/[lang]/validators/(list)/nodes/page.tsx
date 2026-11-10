import type { Metadata } from 'next';

import { ErrorSuspense } from '@/components/error-suspense';
import { NodesMap } from '@/components/nodes/nodes-map';
import { fetchNodeStats } from '@/data/nodes';
import { holdNav } from '@/lib/hold-nav';
import { hasLocale, translator } from '@/locales/dictionaries';

type Props = PageProps<'/[lang]/validators/nodes'>;

export const generateMetadata = async ({
  params,
}: Props): Promise<Metadata> => {
  const { lang } = await params;
  const locale = hasLocale(lang) ? lang : 'en';
  const t = await translator(locale, 'validators');

  return {
    alternates: { canonical: '/validators/nodes' },
    description: t('nodesMap.meta.description'),
    title: t('nodesMap.meta.title'),
  };
};

const NodesPage = async () => {
  const statsPromise = fetchNodeStats();
  await holdNav();

  return (
    <ErrorSuspense fallback={<NodesMap loading />}>
      <NodesMap statsPromise={statsPromise} />
    </ErrorSuspense>
  );
};

export default NodesPage;
