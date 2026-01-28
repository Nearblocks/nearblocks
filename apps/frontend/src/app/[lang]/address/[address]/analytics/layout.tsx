import { ActiveLink } from '@/components/link';
import { TabLink } from '@/components/tab-links';
import { TabLinks } from '@/components/tab-links';
import { Card, CardContent } from '@/ui/card';
import { ScrollArea, ScrollBar } from '@/ui/scroll-area';

type Props = LayoutProps<'/[lang]/address/[address]/analytics'>;

const AnalyticsLayout = async ({ children, params }: Props) => {
  const { address } = await params;

  return (
    <Card>
      <CardContent className="text-body-sm p-3">
        <ScrollArea className="mb-2 w-full whitespace-nowrap">
          <TabLinks>
            <TabLink asChild>
              <ActiveLink href={`/address/${address}/analytics`}>
                Overview
              </ActiveLink>
            </TabLink>
            <TabLink asChild>
              <ActiveLink href={`/address/${address}/analytics/balance`}>
                Balance
              </ActiveLink>
            </TabLink>
            <TabLink asChild>
              <ActiveLink href={`/address/${address}/analytics/txns`}>
                Transactions
              </ActiveLink>
            </TabLink>
            <TabLink asChild>
              <ActiveLink href={`/address/${address}/analytics/near`}>
                Near Transfers
              </ActiveLink>
            </TabLink>
            <TabLink asChild>
              <ActiveLink href={`/address/${address}/analytics/tokens`}>
                Token Transfers
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
