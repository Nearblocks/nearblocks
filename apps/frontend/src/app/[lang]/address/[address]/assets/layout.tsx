import { ActiveLink } from '@/components/link';
import { TabLink, TabLinks } from '@/components/tab-links';
import { hasLocale, translator } from '@/locales/dictionaries';
import { Card, CardContent } from '@/ui/card';
import { ScrollArea, ScrollBar } from '@/ui/scroll-area';

type Props = LayoutProps<'/[lang]/address/[address]/assets'>;

const AssetsLayout = async ({ children, params }: Props) => {
  const { address, lang } = await params;
  const locale = hasLocale(lang) ? lang : 'en';
  const t = await translator(locale, 'address');

  return (
    <Card>
      <CardContent className="text-body-sm p-3">
        <ScrollArea className="mb-3 w-full whitespace-nowrap">
          <TabLinks>
            <TabLink asChild>
              <ActiveLink href={`/address/${address}/assets`}>
                {t('assets.tabs.tokens')}
              </ActiveLink>
            </TabLink>
            <TabLink asChild>
              <ActiveLink exact={false} href={`/address/${address}/assets/mts`}>
                {t('assets.tabs.mts')}
              </ActiveLink>
            </TabLink>
            <TabLink asChild>
              <ActiveLink href={`/address/${address}/assets/nfts`}>
                {t('assets.tabs.nfts')}
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

export default AssetsLayout;
