import { ActiveLink } from '@/components/link';
import { TabLink } from '@/components/tab-links';
import { TabLinks } from '@/components/tab-links';
import { Card, CardContent } from '@/ui/card';
import { ScrollArea, ScrollBar } from '@/ui/scroll-area';

type Props = LayoutProps<'/[lang]/address/[address]/contract'>;

const ContractLayout = async ({ children, params }: Props) => {
  const { address } = await params;

  return (
    <Card>
      <CardContent className="text-body-sm p-3">
        <ScrollArea className="mb-3 w-full whitespace-nowrap">
          <TabLinks>
            <TabLink asChild>
              <ActiveLink href={`/address/${address}/contract`}>
                Overview
              </ActiveLink>
            </TabLink>
            <TabLink asChild>
              <ActiveLink href={`/address/${address}/contract/code`}>
                Contract Code
              </ActiveLink>
            </TabLink>
            <TabLink asChild>
              <ActiveLink href={`/address/${address}/contract/methods`}>
                Contract Methods
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
