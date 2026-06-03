import type { Metadata } from 'next';

import { ErrorSuspense } from '@/components/error-suspense';
import { MtFtTransfers } from '@/components/mt-tokens/token/ft-transfers';
import { MtNftOverview } from '@/components/mt-tokens/token/nft-overview';
import {
  fetchMTToken,
  fetchMTTokenTxnCount,
  fetchMTTokenTxns,
} from '@/data/mt-tokens/contract';
import { decodeToken } from '@/lib/utils';
import { hasLocale, translator } from '@/locales/dictionaries';
import { Card, CardContent } from '@/ui/card';

type Props = {
  params: Promise<{ cid: string; lang: string; tid: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
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
    const name = tokenData.data?.title ?? tokenData.data?.token ?? tid;

    return {
      alternates: {
        canonical: `/mt-tokens/${cid}/tokens/nft/${tid}`,
      },
      description: t('tidMeta.description', { contract: cid, name }),
      title: t('tidMeta.title', { contract: cid, name }),
    };
  } catch {
    return {
      alternates: {
        canonical: `/mt-tokens/${cid}/tokens/nft/${tid}`,
      },
      description: t('tidMeta.description', { contract: cid, name: tid }),
      title: t('tidMeta.title', { contract: cid, name: tid }),
    };
  }
};

const NftTokenDetailPage = async ({ params, searchParams }: Props) => {
  const [{ cid, tid: rawTid }, filters] = await Promise.all([
    params,
    searchParams,
  ]);
  const tid = decodeToken(rawTid);
  const tokenPromise = fetchMTToken(cid, tid);
  const txnsPromise = fetchMTTokenTxns(cid, tid, filters);
  const txnCountPromise = fetchMTTokenTxnCount(cid, tid, filters);

  return (
    <>
      <ErrorSuspense fallback={<MtNftOverview cid={cid} loading />}>
        <MtNftOverview cid={cid} tokenPromise={tokenPromise} />
      </ErrorSuspense>
      <Card className="mt-10">
        <CardContent className="text-body-sm p-0">
          <ErrorSuspense fallback={<MtFtTransfers loading />}>
            <MtFtTransfers
              txnCountPromise={txnCountPromise}
              txnsPromise={txnsPromise}
            />
          </ErrorSuspense>
        </CardContent>
      </Card>
    </>
  );
};

export default NftTokenDetailPage;
