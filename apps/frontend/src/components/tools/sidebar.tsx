'use client';

import { ActiveLink } from '@/components/link';
import { TabLink, TabLinks } from '@/components/tab-links';
import { useLocale } from '@/hooks/use-locale';
import { ScrollArea, ScrollBar } from '@/ui/scroll-area';

export const ToolsSidebar = () => {
  const { t } = useLocale('tools');

  return (
    <nav className="shrink-0 md:w-44">
      <h1 className="text-muted-foreground text-headline-lg mb-3 hidden md:block">
        {t('nav.tools')}
      </h1>
      <ScrollArea>
        <TabLinks className="md:h-auto md:w-full md:flex-col md:items-stretch md:gap-0.5">
          <TabLink asChild className="justify-start">
            <ActiveLink href="/export-csv">{t('nav.csvExport')}</ActiveLink>
          </TabLink>
          <TabLink asChild className="justify-start">
            <ActiveLink href="/account-balance">
              {t('nav.accountBalance')}
            </ActiveLink>
          </TabLink>
          <TabLink asChild className="justify-start">
            <ActiveLink href="/unit-converter">
              {t('nav.unitConverter')}
            </ActiveLink>
          </TabLink>
          <TabLink asChild className="justify-start">
            <ActiveLink href="/keypair">{t('nav.keypair')}</ActiveLink>
          </TabLink>
          <TabLink asChild className="justify-start">
            <ActiveLink href="/gas-converter">
              {t('nav.gasConverter')}
            </ActiveLink>
          </TabLink>
          <TabLink asChild className="justify-start">
            <ActiveLink href="/base64">{t('nav.base64')}</ActiveLink>
          </TabLink>
          <TabLink asChild className="justify-start">
            <ActiveLink href="/timestamp">{t('nav.timestamp')}</ActiveLink>
          </TabLink>
          <TabLink asChild className="justify-start">
            <ActiveLink href="/storage-cost">{t('nav.storageCost')}</ActiveLink>
          </TabLink>
          <TabLink asChild className="justify-start">
            <ActiveLink href="/shard-mapper">{t('nav.shardMapper')}</ActiveLink>
          </TabLink>
        </TabLinks>
        <ScrollBar className="md:hidden" orientation="horizontal" />
      </ScrollArea>
    </nav>
  );
};
