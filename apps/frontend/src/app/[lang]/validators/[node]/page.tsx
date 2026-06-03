import type { Metadata } from 'next';

import { Copy } from '@/components/copy';
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
      <PageHeading
        apiTag="staking"
        title={
          <span className="flex min-w-0 flex-wrap items-center gap-2">
            <span className="text-muted-foreground">{t('nodeTitle')}:</span>
            <span className="break-all">{node}</span>
            <Copy text={node} />
          </span>
        }
      >
        <RpcSelector />
      </PageHeading>
      <NodeDetails node={node} />
    </>
  );
};

export default NodeDetailsPage;
