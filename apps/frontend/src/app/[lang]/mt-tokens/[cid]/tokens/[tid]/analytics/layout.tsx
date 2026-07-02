'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { use } from 'react';

import { ActiveLink, Link } from '@/components/link';
import { TabLink, TabLinks } from '@/components/tab-links';
import { useLocale } from '@/hooks/use-locale';
import { decodeToken, encodeToken } from '@/lib/utils';
import { Card, CardContent } from '@/ui/card';
import { ScrollArea, ScrollBar } from '@/ui/scroll-area';

type Props = LayoutProps<'/[lang]/mt-tokens/[cid]/tokens/[tid]/analytics'>;

const AnalyticsLayout = ({ children, params }: Props) => {
  const { cid, tid: rawTid } = use(params);
  const tid = decodeToken(rawTid);
  const { t } = useLocale('mts');
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const account = searchParams.get('account');

  const base = `/mt-tokens/${cid}/tokens/${encodeToken(tid)}/analytics`;
  const transfersPath = `${base}/transfers`;
  const transfersActive =
    pathname === transfersPath || pathname.endsWith('/analytics/transfers');

  return (
    <Card>
      <CardContent className="text-body-sm p-3">
        <ScrollArea className="mb-3 w-full whitespace-nowrap">
          <TabLinks>
            {!account && (
              <TabLink asChild>
                <ActiveLink exact href={base}>
                  {t('analytics.tabs.overview')}
                </ActiveLink>
              </TabLink>
            )}
            <TabLink asChild>
              <Link
                data-active={transfersActive}
                href={`${transfersPath}${account ? `?account=${account}` : ''}`}
              >
                {t('analytics.tabs.transfers')}
              </Link>
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
