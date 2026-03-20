import type { Metadata } from 'next';

import { ErrorSuspense } from '@/components/error-suspense';

export const generateMetadata = async ({
  params,
}: Props): Promise<Metadata> => {
  const { cid, lang } = await params;
  const locale = hasLocale(lang) ? lang : 'en';
  const t = await translator(locale, 'nfts');

  try {
    const contract = await fetchNFTContract(cid);
    const name = contract.data?.name
      ? `${contract.data.name}${
          contract.data.symbol ? ` (${contract.data.symbol})` : ''
        }`
      : cid;

    return {
      alternates: { canonical: `/nft-tokens/${cid}` },
      description: t('cidMeta.description', { name }),
      title: t('cidMeta.title', { name }),
    };
  } catch {
    return {
      alternates: { canonical: `/nft-tokens/${cid}` },
      description: t('cidMeta.description', { name: cid }),
      title: t('cidMeta.title', { name: cid }),
    };
  }
};
import { ActiveLink } from '@/components/link';
import { NftTokenHeader } from '@/components/nft-tokens/token/header';
import { Overview } from '@/components/nft-tokens/token/overview';
import { Profile } from '@/components/nft-tokens/token/profile';
import { TabLink, TabLinks } from '@/components/tab-links';
import {
  fetchNFTContract,
  fetchNFTContractHolderCount,
  fetchNFTContractTxnCount,
} from '@/data/nft-tokens/contract';
import { hasLocale, translator } from '@/locales/dictionaries';
import { ScrollArea, ScrollBar } from '@/ui/scroll-area';

type Props = LayoutProps<'/[lang]/nft-tokens/[cid]'>;

const NftTokenLayout = async ({ children, params }: Props) => {
  const { cid, lang } = await params;
  const locale = hasLocale(lang) ? lang : 'en';
  const t = await translator(locale, 'nfts');
  const contractPromise = fetchNFTContract(cid);
  const holderCountPromise = fetchNFTContractHolderCount(cid);
  const txCountPromise = fetchNFTContractTxnCount(cid, {});

  return (
    <>
      <h1 className="text-body-xl text-muted-foreground flex flex-wrap items-center gap-2">
        {t('contract.label')}{' '}
        <ErrorSuspense fallback={<NftTokenHeader cid={cid} loading />}>
          <NftTokenHeader cid={cid} contractPromise={contractPromise} />
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
            <ActiveLink exact href={`/nft-tokens/${cid}`}>
              {t('contract.transfers')}
            </ActiveLink>
          </TabLink>
          <TabLink asChild>
            <ActiveLink href={`/nft-tokens/${cid}/holders`}>
              {t('contract.holders')}
            </ActiveLink>
          </TabLink>
          <TabLink asChild>
            <ActiveLink href={`/nft-tokens/${cid}/tokens`}>
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

export default NftTokenLayout;
