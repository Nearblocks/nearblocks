import type { Metadata } from 'next';

import { ErrorSuspense } from '@/components/error-suspense';
import { ActiveLink } from '@/components/link';
import { TabLink, TabLinks } from '@/components/tab-links';
import { TokenHeader } from '@/components/tokens/token/header';
import { Overview } from '@/components/tokens/token/overview';
import { Profile } from '@/components/tokens/token/profile';
import {
  fetchFTContract,
  fetchFTContractHolderCount,
  fetchFTContractTxnCount,
} from '@/data/tokens/contract';
import { hasLocale, translator } from '@/locales/dictionaries';
import { ScrollArea, ScrollBar } from '@/ui/scroll-area';

type Props = LayoutProps<'/[lang]/tokens/[cid]'>;

export const generateMetadata = async ({
  params,
}: Props): Promise<Metadata> => {
  const { cid, lang } = await params;
  const locale = hasLocale(lang) ? lang : 'en';
  const t = await translator(locale, 'fts');

  try {
    const contract = await fetchFTContract(cid);
    const name = contract.data?.name
      ? `${contract.data.name}${
          contract.data.symbol ? ` (${contract.data.symbol})` : ''
        }`
      : cid;

    return {
      alternates: { canonical: `/tokens/${cid}` },
      description: t('cidMeta.description', { name }),
      title: t('cidMeta.title', { name }),
    };
  } catch {
    return {
      alternates: { canonical: `/tokens/${cid}` },
      description: t('cidMeta.description', { name: cid }),
      title: t('cidMeta.title', { name: cid }),
    };
  }
};

const TokenLayout = async ({ children, params }: Props) => {
  const { cid, lang } = await params;
  const locale = hasLocale(lang) ? lang : 'en';
  const t = await translator(locale, 'fts');
  const contractPromise = fetchFTContract(cid);
  const holderCountPromise = fetchFTContractHolderCount(cid);
  const txCountPromise = fetchFTContractTxnCount(cid, {});

  return (
    <>
      <h1 className="text-body-xl text-muted-foreground flex flex-wrap items-center gap-2">
        {t('tokenLabel')}{' '}
        <ErrorSuspense fallback={<TokenHeader cid={cid} loading />}>
          <TokenHeader cid={cid} contractPromise={contractPromise} />
        </ErrorSuspense>
      </h1>
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <ErrorSuspense fallback={<Overview loading />}>
          <Overview
            contractPromise={contractPromise}
            holderCountPromise={holderCountPromise}
            txCountPromise={txCountPromise}
          />
        </ErrorSuspense>
        <ErrorSuspense fallback={<Profile cid={cid} loading />}>
          <Profile cid={cid} contractPromise={contractPromise} />
        </ErrorSuspense>
      </div>
      <ScrollArea className="mt-10 mb-3 w-full whitespace-nowrap">
        <TabLinks>
          <TabLink asChild>
            <ActiveLink exact href={`/tokens/${cid}`}>
              {t('tabs.transfers')}
            </ActiveLink>
          </TabLink>
          <TabLink asChild>
            <ActiveLink href={`/tokens/${cid}/holders`}>
              {t('tabs.holders')}
            </ActiveLink>
          </TabLink>
          <TabLink asChild>
            <ActiveLink href={`/tokens/${cid}/info`}>
              {t('tabs.info')}
            </ActiveLink>
          </TabLink>
          <TabLink asChild>
            <ActiveLink href={`/tokens/${cid}/faq`}>{t('tabs.faq')}</ActiveLink>
          </TabLink>
        </TabLinks>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
      {children}
    </>
  );
};

export default TokenLayout;
