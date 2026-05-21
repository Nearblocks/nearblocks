import { ActiveLink } from '@/components/link';
import { TabLink, TabLinks } from '@/components/tab-links';
import { hasLocale, translator } from '@/locales/dictionaries';
import { Card, CardContent } from '@/ui/card';
import { ScrollArea, ScrollBar } from '@/ui/scroll-area';

type Props = LayoutProps<'/[lang]/mt-tokens/[cid]/tokens'>;

const TokensLayout = async ({ children, params }: Props) => {
  const { cid, lang } = await params;
  const locale = hasLocale(lang) ? lang : 'en';
  const t = await translator(locale, 'mts');

  return (
    <Card>
      <CardContent className="text-body-sm p-3">
        <ScrollArea className="mb-3 w-full whitespace-nowrap">
          <TabLinks>
            <TabLink asChild>
              <ActiveLink exact href={`/mt-tokens/${cid}/tokens`}>
                {t('inventory.ftTab')}
              </ActiveLink>
            </TabLink>
            <TabLink asChild>
              <ActiveLink href={`/mt-tokens/${cid}/tokens/nft`}>
                {t('inventory.nftTab')}
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

export default TokensLayout;
