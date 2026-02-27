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
import { ScrollArea, ScrollBar } from '@/ui/scroll-area';

type Props = LayoutProps<'/[lang]/tokens/[cid]'>;

const TokenLayout = async ({ children, params }: Props) => {
  const { cid } = await params;
  const contractPromise = fetchFTContract(cid);
  const holderCountPromise = fetchFTContractHolderCount(cid);
  const txCountPromise = fetchFTContractTxnCount(cid, {});

  return (
    <>
      <h1 className="text-body-xl text-muted-foreground flex flex-wrap items-center gap-2">
        Token:{' '}
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
              Transfers
            </ActiveLink>
          </TabLink>
          <TabLink asChild>
            <ActiveLink href={`/tokens/${cid}/holders`}>Holders</ActiveLink>
          </TabLink>
          <TabLink asChild>
            <ActiveLink href={`/tokens/${cid}/info`}>Information</ActiveLink>
          </TabLink>
          <TabLink asChild>
            <ActiveLink href={`/tokens/${cid}/faq`}>FAQ</ActiveLink>
          </TabLink>
        </TabLinks>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
      {children}
    </>
  );
};

export default TokenLayout;
