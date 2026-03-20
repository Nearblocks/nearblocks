import type { Metadata } from 'next';

import { ErrorSuspense } from '@/components/error-suspense';
import { NftHeader } from '@/components/nft-tokens/token/header';
import { NftOverview } from '@/components/nft-tokens/token/token/overview';
import { NftTransfers } from '@/components/nft-tokens/token/token/transfers';
import {
  fetchNFTContract,
  fetchNFTToken,
  fetchNFTTokenTxnCount,
  fetchNFTTokenTxns,
} from '@/data/nft-tokens/contract';
import { hasLocale, translator } from '@/locales/dictionaries';

type Props = PageProps<'/[lang]/nft-tokens/[cid]/tokens/[tid]'>;

export const generateMetadata = async ({
  params,
}: Props): Promise<Metadata> => {
  const { cid, lang, tid } = await params;
  const locale = hasLocale(lang) ? lang : 'en';
  const t = await translator(locale, 'nfts');

  try {
    const [contractData, tokenData] = await Promise.all([
      fetchNFTContract(cid),
      fetchNFTToken(cid, tid),
    ]);
    const name = tokenData.data?.title ?? tid;
    const contract = contractData.data?.name
      ? `${contractData.data.name}${
          contractData.data.symbol ? ` (${contractData.data.symbol})` : ''
        }`
      : cid;

    return {
      alternates: { canonical: `/nft-tokens/${cid}/tokens/${tid}` },
      description: t('tidMeta.description', { contract, name }),
      title: t('tidMeta.title', { contract, name }),
    };
  } catch {
    return {
      alternates: { canonical: `/nft-tokens/${cid}/tokens/${tid}` },
      description: t('tidMeta.description', { contract: cid, name: tid }),
      title: t('tidMeta.title', { contract: cid, name: tid }),
    };
  }
};

const TokenDetailPage = async ({ params, searchParams }: Props) => {
  const [{ cid, tid }, filters] = await Promise.all([params, searchParams]);
  const tokenPromise = fetchNFTToken(cid, tid);
  const contractPromise = fetchNFTContract(cid);
  const txnsPromise = fetchNFTTokenTxns(cid, tid, filters);
  const txnCountPromise = fetchNFTTokenTxnCount(cid, tid, filters);

  return (
    <>
      <NftHeader
        cid={cid}
        contractPromise={contractPromise}
        tokenPromise={tokenPromise}
      />
      <ErrorSuspense fallback={<NftOverview cid={cid} loading />}>
        <NftOverview
          cid={cid}
          contractPromise={contractPromise}
          tokenPromise={tokenPromise}
        />
      </ErrorSuspense>
      <ErrorSuspense fallback={<NftTransfers loading />}>
        <NftTransfers
          txnCountPromise={txnCountPromise}
          txnsPromise={txnsPromise}
        />
      </ErrorSuspense>
    </>
  );
};

export default TokenDetailPage;
