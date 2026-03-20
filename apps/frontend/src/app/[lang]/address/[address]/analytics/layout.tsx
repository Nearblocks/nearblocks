import { ActiveLink } from '@/components/link';
import { TabLink } from '@/components/tab-links';
import { TabLinks } from '@/components/tab-links';
import { hasLocale, translator } from '@/locales/dictionaries';
import { Card, CardContent } from '@/ui/card';
import { ScrollArea, ScrollBar } from '@/ui/scroll-area';

type Props = LayoutProps<'/[lang]/address/[address]/analytics'>;

const AnalyticsLayout = async ({ children, params }: Props) => {
  const { address, lang } = await params;
  const locale = hasLocale(lang) ? lang : 'en';
  const t = await translator(locale, 'address');

  return (
    <Card>
      <CardContent className="text-body-sm p-3">
        <ScrollArea className="mb-3 w-full whitespace-nowrap">
          <TabLinks>
            <TabLink asChild>
              <ActiveLink href={`/address/${address}/analytics`}>
                {t('analytics.tabs.overview')}
              </ActiveLink>
            </TabLink>
            <TabLink asChild>
              <ActiveLink href={`/address/${address}/analytics/balance`}>
                {t('analytics.tabs.balance')}
              </ActiveLink>
            </TabLink>
            <TabLink asChild>
              <ActiveLink href={`/address/${address}/analytics/txns`}>
                {t('analytics.tabs.txns')}
              </ActiveLink>
            </TabLink>
            <TabLink asChild>
              <ActiveLink href={`/address/${address}/analytics/near`}>
                {t('analytics.tabs.near')}
              </ActiveLink>
            </TabLink>
            <TabLink asChild>
              <ActiveLink href={`/address/${address}/analytics/tokens`}>
                {t('analytics.tabs.tokens')}
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

export default AnalyticsLayout;
