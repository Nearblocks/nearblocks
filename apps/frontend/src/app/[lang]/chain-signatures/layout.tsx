import { notFound } from 'next/navigation';

import { Overview } from '@/components/chain-signatures/overview';
import { ErrorSuspense } from '@/components/error-suspense';
import { ActiveLink } from '@/components/link';
import { PageHeading } from '@/components/page-heading';
import { TabLink, TabLinks } from '@/components/tab-links';
import { fetchMpcs, fetchSignerTotalStats } from '@/data/chain-signatures';
import { holdNav } from '@/lib/hold-nav';
import { getDictionary, hasLocale, translator } from '@/locales/dictionaries';
import { LocaleProvider } from '@/providers/locale';
import { ScrollArea, ScrollBar } from '@/ui/scroll-area';

type Props = LayoutProps<'/[lang]/chain-signatures'>;

const ChainSignaturesLayout = async ({ children, params }: Props) => {
  const { lang } = await params;

  if (!hasLocale(lang)) notFound();

  const dictionary = await getDictionary(lang, ['chainSignatures']);
  const t = await translator(lang, 'chainSignatures');

  const mpcsPromise = fetchMpcs();
  const totalStatsPromise = fetchSignerTotalStats();
  await holdNav();

  return (
    <LocaleProvider dictionary={dictionary} locale={lang}>
      <main className="flex flex-1 flex-col pt-4 pb-10">
        <div className="container mx-auto px-4">
          <PageHeading apiTag="multichain" title={t('title')} />
          <ErrorSuspense fallback={<Overview loading />}>
            <Overview
              mpcsPromise={mpcsPromise}
              totalStatsPromise={totalStatsPromise}
            />
          </ErrorSuspense>
          <ScrollArea className="mt-6 mb-3 w-full whitespace-nowrap">
            <TabLinks>
              <TabLink asChild>
                <ActiveLink exact href="/chain-signatures">
                  {t('tabs.operators')}
                </ActiveLink>
              </TabLink>
              <TabLink asChild>
                <ActiveLink exact={false} href="/chain-signatures/analytics">
                  {t('tabs.analytics')}
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

export default ChainSignaturesLayout;
