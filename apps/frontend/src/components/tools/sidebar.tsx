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
        </TabLinks>
        <ScrollBar className="md:hidden" orientation="horizontal" />
      </ScrollArea>
    </nav>
  );
};
