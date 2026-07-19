import type { Metadata } from 'next';

import { ErrorSuspense } from '@/components/error-suspense';
import { MtFtHeader } from '@/components/mt-tokens/fts/header';
import { MtFtHolderFilter } from '@/components/mt-tokens/fts/holder-filter';
import { MtFtOverview } from '@/components/mt-tokens/fts/overview';
import { MtFtProfile } from '@/components/mt-tokens/fts/profile';
import { MtFtTabLinks } from '@/components/mt-tokens/fts/tab-links';
import {
  fetchMTToken,
  fetchMTTokenHolderCount,
  fetchMTTokenTxnCount,
} from '@/data/mt-tokens/contract';
import { holdNav } from '@/lib/hold-nav';
import { decodeToken } from '@/lib/utils';
import { hasLocale, translator } from '@/locales/dictionaries';
import { ScrollArea, ScrollBar } from '@/ui/scroll-area';

type Props = {
  children: React.ReactNode;
  params: Promise<{ cid: string; lang: string; tid: string }>;
};

export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ cid: string; lang: string; tid: string }>;
}): Promise<Metadata> => {
  const { cid, lang, tid: rawTid } = await params;
  const tid = decodeToken(rawTid);
  const locale = hasLocale(lang) ? lang : 'en';
  const t = await translator(locale, 'mts');

  try {
    const tokenData = await fetchMTToken(cid, tid);
    const name = tokenData.data?.name ?? tokenData.data?.token ?? tid;

    return {
      alternates: {
        canonical: `/mt-tokens/${cid}/tokens/${tid}`,
      },
      description: t('tidMeta.description', { contract: cid, name }),
      title: t('tidMeta.title', { contract: cid, name }),
    };
  } catch {
    return {
      alternates: {
        canonical: `/mt-tokens/${cid}/tokens/${tid}`,
      },
      description: t('tidMeta.description', { contract: cid, name: tid }),
      title: t('tidMeta.title', { contract: cid, name: tid }),
    };
  }
};

const FtTokenLayout = async ({ children, params }: Props) => {
  const { cid, lang, tid: rawTid } = await params;
  const tid = decodeToken(rawTid);
  const locale = hasLocale(lang) ? lang : 'en';
  const t = await translator(locale, 'mts');
  const tokenPromise = fetchMTToken(cid, tid);
  const txnCountPromise = fetchMTTokenTxnCount(cid, tid, {});
  const holderCountPromise = fetchMTTokenHolderCount(cid, tid);
  await holdNav();

  return (
    <>
      <h1 className="text-body-xl text-muted-foreground flex flex-wrap items-center gap-2">
        {t('token.label')}{' '}
        <ErrorSuspense fallback={<MtFtHeader cid={cid} loading tid={tid} />}>
          <MtFtHeader cid={cid} tid={tid} tokenPromise={tokenPromise} />
        </ErrorSuspense>
      </h1>
      <div className="mt-6 mb-10 grid gap-4 lg:grid-cols-2">
        <ErrorSuspense fallback={<MtFtOverview loading />}>
          <MtFtOverview
            holderCountPromise={holderCountPromise}
            tokenPromise={tokenPromise}
            txnCountPromise={txnCountPromise}
          />
        </ErrorSuspense>
        <MtFtProfile cid={cid} tid={tid} />
      </div>
      <ErrorSuspense fallback={null}>
        <MtFtHolderFilter cid={cid} tid={tid} tokenPromise={tokenPromise} />
      </ErrorSuspense>
      <ScrollArea className="mb-3 w-full whitespace-nowrap">
        <MtFtTabLinks
          analytics={t('token.analyticsTab')}
          cid={cid}
          holders={t('token.ftHoldersTab')}
          tid={tid}
          transfers={t('token.ftTransfersTab')}
        />
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
      {children}
    </>
  );
};

export default FtTokenLayout;
