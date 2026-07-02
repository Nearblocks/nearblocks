import { ActiveLink } from '@/components/link';
import { TabLink, TabLinks } from '@/components/tab-links';
import { hasLocale, translator } from '@/locales/dictionaries';
import { Card, CardContent } from '@/ui/card';
import { ScrollArea, ScrollBar } from '@/ui/scroll-area';

type Props = LayoutProps<'/[lang]/chain-signatures/analytics'>;

const ChainSignaturesAnalyticsLayout = async ({ children, params }: Props) => {
  const { lang } = await params;
  const locale = hasLocale(lang) ? lang : 'en';
  const t = await translator(locale, 'chainSignatures');

  return (
    <Card>
      <CardContent className="text-body-sm p-3">
        <ScrollArea className="mb-3 w-full whitespace-nowrap">
          <TabLinks>
            <TabLink asChild>
              <ActiveLink exact href="/chain-signatures/analytics">
                {t('analytics.tabs.txns')}
              </ActiveLink>
            </TabLink>
            <TabLink asChild>
              <ActiveLink exact href="/chain-signatures/analytics/gas-burnt">
                {t('analytics.tabs.gasBurnt')}
              </ActiveLink>
            </TabLink>
          </TabLinks>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
        {children}
      </CardContent>
    </Card>
  );
};

export default ChainSignaturesAnalyticsLayout;
