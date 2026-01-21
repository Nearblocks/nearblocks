import { notFound } from 'next/navigation';

import { Info } from '@/components/address/info';
import { Overview } from '@/components/address/overview';
import { AccountQr } from '@/components/address/qr';
import { Validate } from '@/components/address/validate';
import { Copy } from '@/components/copy';
import { ErrorSuspense } from '@/components/error-suspense';
import { ActiveLink } from '@/components/link';
import { RpcSelector } from '@/components/rpc';
import { TabBadge, TabLink } from '@/components/tab-links';
import { TabLinks } from '@/components/tab-links';
import {
  fetchAccount,
  fetchBalance,
  fetchDeployments,
  fetchTokenCache,
  fetchTokens,
} from '@/data/address';
import { fetchStats } from '@/data/layout';
import { getDictionary, hasLocale } from '@/locales/dictionaries';
import { LocaleProvider } from '@/providers/locale';
import { ScrollArea, ScrollBar } from '@/ui/scroll-area';

type Props = LayoutProps<'/[lang]/address/[address]'>;

const AddressLayout = async ({ children, params }: Props) => {
  const { address, lang } = await params;
  const statsPromise = fetchStats();
  const accountPromise = fetchAccount(address);
  const balancePromise = fetchBalance(address);
  const deploymentsPromise = fetchDeployments(address);
  const tokensPromise = fetchTokens(address);
  const tokenCachePromise = fetchTokenCache(address);

  if (!hasLocale(lang)) notFound();

  const dictionary = await getDictionary(lang, ['address']);

  return (
    <LocaleProvider dictionary={dictionary} locale={lang}>
      <main className="flex flex-1 flex-col pt-6 pb-10">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap items-center justify-between gap-2 wrap-anywhere">
            <div>
              <h1 className="text-body-xl text-muted-foreground flex flex-wrap items-center gap-2">
                Near Account: <span className="text-foreground">{address}</span>{' '}
                <Copy text={address} />
                <AccountQr address={address} />
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <RpcSelector />
              <Validate address={address} />
            </div>
          </div>
          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            <ErrorSuspense fallback={<Overview loading />}>
              <Overview
                balancePromise={balancePromise}
                statsPromise={statsPromise}
                tokenCachePromise={tokenCachePromise}
                tokensPromise={tokensPromise}
              />
            </ErrorSuspense>
            <ErrorSuspense fallback={<Info loading />}>
              <Info
                accountPromise={accountPromise}
                balancePromise={balancePromise}
                deploymentsPromise={deploymentsPromise}
              />
            </ErrorSuspense>
          </div>
          <ScrollArea className="mt-10 mb-2 w-full whitespace-nowrap">
            <TabLinks>
              <TabLink asChild>
                <ActiveLink href={`/address/${address}`}>
                  Transactions
                </ActiveLink>
              </TabLink>
              <TabLink asChild>
                <ActiveLink href={`/address/${address}/receipts`}>
                  Receipts
                </ActiveLink>
              </TabLink>
              <TabLink asChild>
                <ActiveLink href={`/address/${address}/fts`}>
                  Token Txns
                </ActiveLink>
              </TabLink>
              <TabLink asChild>
                <ActiveLink href={`/address/${address}/nfts`}>
                  NFT Txns
                </ActiveLink>
              </TabLink>
              <TabLink asChild>
                <ActiveLink href={`/address/${address}/mts`}>
                  Multi Token Txns
                  <TabBadge variant="teal">NEW</TabBadge>
                </ActiveLink>
              </TabLink>
              <TabLink asChild>
                <ActiveLink href={`/address/${address}/staking`}>
                  Staking Txns
                </ActiveLink>
              </TabLink>
              <TabLink asChild>
                <ActiveLink href={`/address/${address}/keys`}>
                  Access Keys
                </ActiveLink>
              </TabLink>
              <TabLink asChild>
                <ActiveLink href={`/address/${address}/analytics`}>
                  Analytics
                  <TabBadge variant="teal">NEW</TabBadge>
                </ActiveLink>
              </TabLink>
              {/* <TabLink asChild>
                <ActiveLink href={`/address/${address}/assets`}>
                  Assets
                  <TabBadge variant="teal">NEW</TabBadge>
                </ActiveLink>
              </TabLink> */}
              <TabLink asChild>
                <ActiveLink href={`/address/${address}/contract`}>
                  Contract
                </ActiveLink>
              </TabLink>
            </TabLinks>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
          {children}
        </div>
      </main>
    </LocaleProvider>
  );
};

export default AddressLayout;
