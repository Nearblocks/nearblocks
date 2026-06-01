'use client';

import { use } from 'react';

import { ActiveLink } from '@/components/link';
import { TabLink, TabLinks } from '@/components/tab-links';
import { useLocale } from '@/hooks/use-locale';
import { Card, CardContent } from '@/ui/card';
import { ScrollArea, ScrollBar } from '@/ui/scroll-area';

type Props = LayoutProps<'/[lang]/mt-tokens/[cid]/tokens/ft/[tid]/analytics'>;

const AnalyticsLayout = ({ children, params }: Props) => {
  const { cid, tid } = use(params);
  const { t } = useLocale('mts');

  const base = `/mt-tokens/${cid}/tokens/ft/${tid}/analytics`;

  return (
    <Card>
      <CardContent className="text-body-sm p-3">
        <ScrollArea className="mb-3 w-full whitespace-nowrap">
          <TabLinks>
            <TabLink asChild>
              <ActiveLink exact href={base}>
                {t('analytics.tabs.overview')}
              </ActiveLink>
            </TabLink>
            <TabLink asChild>
              <ActiveLink href={`${base}/transfers`}>
                {t('analytics.tabs.transfers')}
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
