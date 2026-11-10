import { ActiveLink } from '@/components/link';
import { PageHeading } from '@/components/page-heading';
import { RpcSelector } from '@/components/rpc';
import { TabLink, TabLinks } from '@/components/tab-links';
import { hasLocale, translator } from '@/locales/dictionaries';
import { ScrollArea, ScrollBar } from '@/ui/scroll-area';

type Props = LayoutProps<'/[lang]/validators'>;

// Validators | Nodes tabs. A route group so validator detail pages keep their own
// layout without these tabs.
const ValidatorsListLayout = async ({ children, params }: Props) => {
  const { lang } = await params;
  const locale = hasLocale(lang) ? lang : 'en';
  const t = await translator(locale, 'validators');

  return (
    <>
      <PageHeading apiTag="staking" title={t('title')}>
        <RpcSelector />
      </PageHeading>
      <ScrollArea className="mb-4 w-full whitespace-nowrap">
        <TabLinks>
          <TabLink asChild>
            <ActiveLink exact href="/validators">
              {t('tabs.validators')}
            </ActiveLink>
          </TabLink>
          <TabLink asChild>
            <ActiveLink exact={false} href="/validators/nodes">
              {t('tabs.nodes')}
            </ActiveLink>
          </TabLink>
        </TabLinks>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
      {children}
    </>
  );
};

export default ValidatorsListLayout;
