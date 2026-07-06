import { ActiveLink } from '@/components/link';
import { TabLink, TabLinks } from '@/components/tab-links';
import { hasLocale, translator } from '@/locales/dictionaries';
import { ScrollArea, ScrollBar } from '@/ui/scroll-area';

type Props = LayoutProps<'/[lang]/address/[address]/assets/mts'>;

const MTAssetsLayout = async ({ children, params }: Props) => {
  const { address, lang } = await params;
  const locale = hasLocale(lang) ? lang : 'en';
  const t = await translator(locale, 'address');

  return (
    <>
      <ScrollArea className="mb-3 w-full whitespace-nowrap">
        <TabLinks>
          <TabLink asChild>
            <ActiveLink href={`/address/${address}/assets/mts`}>
              {t('assets.tabs.tokens')}
            </ActiveLink>
          </TabLink>
          <TabLink asChild>
            <ActiveLink href={`/address/${address}/assets/mts/nfts`}>
              {t('assets.tabs.nfts')}
            </ActiveLink>
          </TabLink>
        </TabLinks>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
      {children}
    </>
  );
};

export default MTAssetsLayout;
