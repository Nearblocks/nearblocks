import type { Metadata } from 'next';

import { PageHeading } from '@/components/page-heading';
import { RpcSelector } from '@/components/rpc';
import { NodeDetails } from '@/components/validators/details';
import { hasLocale, translator } from '@/locales/dictionaries';

type Props = PageProps<'/[lang]/validators/[node]'>;

export const generateMetadata = async ({
  params,
}: Props): Promise<Metadata> => {
  const { lang, node } = await params;
  const locale = hasLocale(lang) ? lang : 'en';
  const t = await translator(locale, 'validators');

  return {
    alternates: { canonical: `/validators/${node}` },
    description: t('nodeMeta.description', { node }),
    title: t('nodeMeta.title', { node }),
  };
};

const NodeDetailsPage = async ({ params }: Props) => {
  const { lang, node } = await params;
  const locale = hasLocale(lang) ? lang : 'en';
  const t = await translator(locale, 'validators');

  return (
    <>
      <PageHeading apiTag="staking" title={t('nodeTitle')}>
        <RpcSelector />
      </PageHeading>
      <NodeDetails node={node} />
    </>
  );
};

export default NodeDetailsPage;
