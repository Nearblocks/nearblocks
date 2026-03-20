import { ActiveLink } from '@/components/link';
import { TabLink } from '@/components/tab-links';
import { TabLinks } from '@/components/tab-links';
import { hasLocale, translator } from '@/locales/dictionaries';
import { Card, CardContent } from '@/ui/card';
import { ScrollArea, ScrollBar } from '@/ui/scroll-area';

type Props = LayoutProps<'/[lang]/address/[address]/contract'>;

const ContractLayout = async ({ children, params }: Props) => {
  const { address, lang } = await params;
  const locale = hasLocale(lang) ? lang : 'en';
  const t = await translator(locale, 'address');

  return (
    <Card>
      <CardContent className="text-body-sm p-3">
        <ScrollArea className="mb-3 w-full whitespace-nowrap">
          <TabLinks>
            <TabLink asChild>
              <ActiveLink href={`/address/${address}/contract`}>
                {t('contract.tabs.overview')}
              </ActiveLink>
            </TabLink>
            <TabLink asChild>
              <ActiveLink href={`/address/${address}/contract/code`}>
                {t('contract.tabs.code')}
              </ActiveLink>
            </TabLink>
            <TabLink asChild>
              <ActiveLink href={`/address/${address}/contract/methods`}>
                {t('contract.tabs.methods')}
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

export default ContractLayout;
