import { ErrorSuspense } from '@/components/error-suspense';
import { ActiveLink } from '@/components/link';
import { TabLink, TabLinks } from '@/components/tab-links';
import { NftTokenHeader } from '@/components/nft-tokens/token/header';
import { Overview } from '@/components/nft-tokens/token/overview';
import { Profile } from '@/components/nft-tokens/token/profile';
import {
  fetchNFTContract,
  fetchNFTContractHolderCount,
  fetchNFTContractTxnCount,
} from '@/data/nft-tokens/contract';
import { ScrollArea, ScrollBar } from '@/ui/scroll-area';

type Props = LayoutProps<'/[lang]/nft-tokens/[token]'>;

const NftTokenLayout = async ({ children, params }: Props) => {
  const { token } = await params;
  const contractPromise = fetchNFTContract(token);
  const holderCountPromise = fetchNFTContractHolderCount(token);
  const txCountPromise = fetchNFTContractTxnCount(token, {});

  return (
    <>
      <h1 className="text-body-xl text-muted-foreground flex flex-wrap items-center gap-2">
        NFT Token:{' '}
        <ErrorSuspense fallback={<NftTokenHeader loading token={token} />}>
          <NftTokenHeader contractPromise={contractPromise} token={token} />
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
        <ErrorSuspense fallback={<Profile loading token={token} />}>
          <Profile contractPromise={contractPromise} token={token} />
        </ErrorSuspense>
      </div>
      <ScrollArea className="mt-10 mb-3 w-full whitespace-nowrap">
        <TabLinks>
          <TabLink asChild>
            <ActiveLink exact href={`/nft-tokens/${token}`}>
              Transfers
            </ActiveLink>
          </TabLink>
          <TabLink asChild>
            <ActiveLink href={`/nft-tokens/${token}/holders`}>
              Holders
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
