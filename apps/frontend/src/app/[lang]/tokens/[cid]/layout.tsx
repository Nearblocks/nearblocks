import type { Metadata } from 'next';

import { ErrorSuspense } from '@/components/error-suspense';
import { SpamAlert } from '@/components/tokens/spam-alert';
import { TokenHeader } from '@/components/tokens/token/header';
import { HolderFilter } from '@/components/tokens/token/holder-filter';
import { Overview } from '@/components/tokens/token/overview';
import { Profile } from '@/components/tokens/token/profile';
import { TokenTabLinks } from '@/components/tokens/token/tab-links';
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
      <ErrorSuspense fallback={null}>
        <SpamAlert
          after={t('spam.after')}
          before={t('spam.before')}
          cid={cid}
          linkLabel={t('spam.linkLabel')}
        />
      </ErrorSuspense>
      <div className="mt-6 mb-10 grid gap-4 lg:grid-cols-2">
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
      <ErrorSuspense fallback={null}>
        <HolderFilter cid={cid} contractPromise={contractPromise} />
      </ErrorSuspense>
      <ScrollArea className="mb-3 w-full whitespace-nowrap">
        <TokenTabLinks
          analytics={t('tabs.analytics')}
          cid={cid}
          faq={t('tabs.faq')}
          holders={t('tabs.holders')}
          info={t('tabs.info')}
          transfers={t('tabs.transfers')}
        />
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
      {children}
    </>
  );
};

export default TokenLayout;
