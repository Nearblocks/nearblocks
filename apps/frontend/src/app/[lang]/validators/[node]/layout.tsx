import type { Metadata } from 'next';

import { Copy } from '@/components/copy';
import { ErrorSuspense } from '@/components/error-suspense';
import { ActiveLink } from '@/components/link';
import { PageHeading } from '@/components/page-heading';
import { RpcSelector } from '@/components/rpc';
import { TabLink, TabLinks } from '@/components/tab-links';
import { Overview } from '@/components/validators/node/overview';
import { Uptime } from '@/components/validators/node/uptime';
import { fetchValidator } from '@/data/validators';
import { holdNav } from '@/lib/hold-nav';
import { hasLocale, translator } from '@/locales/dictionaries';
import { ScrollArea, ScrollBar } from '@/ui/scroll-area';

type Props = LayoutProps<'/[lang]/validators/[node]'>;

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

const NodeLayout = async ({ children, params }: Props) => {
  const { lang, node } = await params;
  const locale = hasLocale(lang) ? lang : 'en';
  const t = await translator(locale, 'validators');
  const validatorPromise = fetchValidator(node);
  await holdNav();

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

      <div className="grid gap-4 lg:grid-cols-2">
        <ErrorSuspense fallback={<Overview loading />}>
          <Overview validatorPromise={validatorPromise} />
        </ErrorSuspense>
        <Uptime node={node} />
      </div>

      <ScrollArea className="mt-10 mb-3 w-full whitespace-nowrap">
        <TabLinks>
          <TabLink asChild>
            <ActiveLink href={`/validators/${node}`}>
              {t('nodeDetails.tabs.delegators')}
            </ActiveLink>
          </TabLink>
          <TabLink asChild>
            <ActiveLink exact={false} href={`/validators/${node}/analytics`}>
              {t('nodeDetails.tabs.analytics')}
            </ActiveLink>
          </TabLink>
        </TabLinks>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>

      {children}
    </>
  );
};

export default NodeLayout;
