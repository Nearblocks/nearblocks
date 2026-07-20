import type { Metadata } from 'next';

import { ErrorSuspense } from '@/components/error-suspense';
import { ActiveLink } from '@/components/link';
import { MtTokenHeader } from '@/components/mt-tokens/contract/header';
import { Overview } from '@/components/mt-tokens/contract/overview';
import { Profile } from '@/components/mt-tokens/contract/profile';
import { TabLink, TabLinks } from '@/components/tab-links';
import {
  fetchMTContractTokenCount,
  fetchMTContractTxnCount,
} from '@/data/mt-tokens/contract';
import { holdNav } from '@/lib/hold-nav';
import { hasLocale, translator } from '@/locales/dictionaries';
import { ScrollArea, ScrollBar } from '@/ui/scroll-area';

type Props = LayoutProps<'/[lang]/mt-tokens/[cid]'>;

export const generateMetadata = async ({
  params,
}: Props): Promise<Metadata> => {
  const { cid, lang } = await params;
  const locale = hasLocale(lang) ? lang : 'en';
  const t = await translator(locale, 'mts');

  return {
    alternates: { canonical: `/mt-tokens/${cid}` },
    description: t('cidMeta.description', { name: cid }),
    title: t('cidMeta.title', { name: cid }),
  };
};

const MtTokenLayout = async ({ children, params }: Props) => {
  const { cid, lang } = await params;
  const locale = hasLocale(lang) ? lang : 'en';
  const t = await translator(locale, 'mts');
  const tokenCountPromise = fetchMTContractTokenCount(cid);
  const txCountPromise = fetchMTContractTxnCount(cid, {});
  await holdNav();

  return (
    <>
      <h1 className="text-body-xl text-muted-foreground flex flex-wrap items-center gap-2">
        {t('contract.label')} <MtTokenHeader cid={cid} />
      </h1>
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <ErrorSuspense fallback={<Overview loading />}>
          <Overview
            tokenCountPromise={tokenCountPromise}
            txCountPromise={txCountPromise}
          />
        </ErrorSuspense>
        <Profile cid={cid} />
      </div>
      <ScrollArea className="mt-10 mb-3 w-full whitespace-nowrap">
        <TabLinks>
          <TabLink asChild>
            <ActiveLink exact href={`/mt-tokens/${cid}`}>
              {t('contract.transfers')}
            </ActiveLink>
          </TabLink>
          <TabLink asChild>
            <ActiveLink exact={false} href={`/mt-tokens/${cid}/inventory`}>
              {t('contract.inventory')}
            </ActiveLink>
          </TabLink>
        </TabLinks>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
      {children}
    </>
  );
};

export default MtTokenLayout;
