import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { AccountAlerts } from '@/components/address/alerts';
import { ContractTab } from '@/components/address/contract/tab';
import { Info } from '@/components/address/info';
import { Overview } from '@/components/address/overview';
import { AccountQr } from '@/components/address/qr';
import { Validate } from '@/components/address/validate';
import { Copy } from '@/components/copy';
import { ErrorSuspense } from '@/components/error-suspense';
import { ActiveLink } from '@/components/link';
import { PageHeading } from '@/components/page-heading';
import { RpcSelector } from '@/components/rpc';
import { TabBadge, TabLink } from '@/components/tab-links';
import { TabLinks } from '@/components/tab-links';
import {
  fetchAccount,
  fetchBalance,
  fetchMTTokens,
  fetchTokens,
} from '@/data/address';
import { fetchContract, fetchDeployments } from '@/data/address/contract';
import { fetchStats } from '@/data/layout';
import { fetchSpamTokens } from '@/data/spam-tokens';
import { getDictionary, hasLocale, translator } from '@/locales/dictionaries';
import { LocaleProvider } from '@/providers/locale';
import { ScrollArea, ScrollBar } from '@/ui/scroll-area';
import { Skeleton } from '@/ui/skeleton';

type Props = LayoutProps<'/[lang]/address/[address]'>;

export const generateMetadata = async ({
  params,
}: Props): Promise<Metadata> => {
  const { address, lang } = await params;
  const locale = hasLocale(lang) ? lang : 'en';
  const t = await translator(locale, 'address');

  return {
    alternates: { canonical: `/address/${address}` },
    description: t('meta.description', { address }),
    title: t('meta.title', { address }),
  };
};

const AddressLayout = async ({ children, params }: Props) => {
  const { address, lang } = await params;
  const statsPromise = fetchStats();
  const accountPromise = fetchAccount(address);
  const balancePromise = fetchBalance(address);
  const contractPromise = fetchContract(address);
  const deploymentsPromise = fetchDeployments(address);
  const tokensPromise = fetchTokens(address);
  const mtTokensPromise = fetchMTTokens(address);
  const spamPatterns = await fetchSpamTokens();

  if (!hasLocale(lang)) notFound();

  const dictionary = await getDictionary(lang, ['address']);
  const t = await translator(lang, 'address');

  return (
    <LocaleProvider dictionary={dictionary} locale={lang}>
      <main className="flex flex-1 flex-col pt-4 pb-10">
        <div className="container mx-auto px-4">
          <PageHeading
            apiTag="accounts"
            title={
              <span className="flex min-w-0 flex-wrap items-center gap-2">
                <span className="text-muted-foreground">{t('heading')}</span>
                <span className="break-all">{address}</span>
                <Copy text={address} />
                <AccountQr address={address} />
              </span>
            }
          >
            <div className="flex items-center gap-2">
              <RpcSelector />
              <Validate address={address} />
            </div>
          </PageHeading>
          <ErrorSuspense fallback={null}>
            <AccountAlerts
              accountPromise={accountPromise}
              contractPromise={contractPromise}
            />
          </ErrorSuspense>
          <div className="grid gap-4 lg:grid-cols-2">
            <ErrorSuspense fallback={<Overview loading />}>
              <Overview
                balancePromise={balancePromise}
                mtTokensPromise={mtTokensPromise}
                spamPatterns={spamPatterns}
                statsPromise={statsPromise}
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
          <ScrollArea className="mt-10 mb-3 w-full whitespace-nowrap">
            <TabLinks>
              <TabLink asChild>
                <ActiveLink href={`/address/${address}`}>
                  {t('tabs.transactions')}
                </ActiveLink>
              </TabLink>
              <TabLink asChild>
                <ActiveLink href={`/address/${address}/receipts`}>
                  {t('tabs.receipts')}
                </ActiveLink>
              </TabLink>
              <TabLink asChild>
                <ActiveLink href={`/address/${address}/tokens`}>
                  {t('tabs.tokenTxns')}
                </ActiveLink>
              </TabLink>
              <TabLink asChild>
                <ActiveLink href={`/address/${address}/nft-tokens`}>
                  {t('tabs.nftTxns')}
                </ActiveLink>
              </TabLink>
              <TabLink asChild>
                <ActiveLink href={`/address/${address}/mt-tokens`}>
                  {t('tabs.multiTokenTxns')}
                  <TabBadge variant="teal">NEW</TabBadge>
                </ActiveLink>
              </TabLink>
              <TabLink asChild>
                <ActiveLink href={`/address/${address}/staking`}>
                  {t('tabs.stakingTxns')}
                  <TabBadge variant="teal">NEW</TabBadge>
                </ActiveLink>
              </TabLink>
              <TabLink asChild>
                <ActiveLink exact={false} href={`/address/${address}/assets`}>
                  {t('tabs.assets')}
                  <TabBadge variant="teal">NEW</TabBadge>
                </ActiveLink>
              </TabLink>
              <TabLink asChild>
                <ActiveLink
                  exact={false}
                  href={`/address/${address}/analytics`}
                >
                  {t('tabs.analytics')}
                  <TabBadge variant="teal">NEW</TabBadge>
                </ActiveLink>
              </TabLink>
              <TabLink asChild>
                <ActiveLink href={`/address/${address}/keys`}>
                  {t('tabs.accessKeys')}
                </ActiveLink>
              </TabLink>
              {address.includes('.') && (
                <TabLink asChild>
                  <ActiveLink href={`/address/${address}/subaccounts`}>
                    {t('tabs.subAccounts')}
                    <TabBadge variant="teal">NEW</TabBadge>
                  </ActiveLink>
                </TabLink>
              )}
              <ErrorSuspense fallback={<Skeleton className="w-20" />}>
                <ContractTab
                  address={address}
                  contractPromise={contractPromise}
                />
              </ErrorSuspense>
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
