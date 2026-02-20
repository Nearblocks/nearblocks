import { ActiveLink } from '@/components/link';
import { TabLink } from '@/components/tab-links';
import { TabLinks } from '@/components/tab-links';
import { ScrollArea, ScrollBar } from '@/ui/scroll-area';

type Props = LayoutProps<'/[lang]/txns/[txn]'>;

const TxnLayout = async ({ children, params }: Props) => {
  const { txn } = await params;

  return (
    <div className="container mx-auto px-4">
      <h1 className="text-headline-lg mb-6">
        Transaction{' '}
        <span className="text-muted-foreground text-headline-base">#{txn}</span>
      </h1>
      <ScrollArea className="mb-3 w-full whitespace-nowrap">
        <TabLinks>
          <TabLink asChild>
            <ActiveLink href={`/txns/${txn}`}>Overview</ActiveLink>
          </TabLink>
          <TabLink asChild>
            <ActiveLink href={`/txns/${txn}/execution`}>
              Execution Plan
            </ActiveLink>
          </TabLink>
          {/* <TabLink asChild>
              <ActiveLink href={`/txns/${txn}/enhanced`}>
                Enhanced Plan
              </ActiveLink>
            </TabLink>
            <TabLink asChild>
              <ActiveLink href={`/txns/${txn}/tree`}>Tree Plan</ActiveLink>
            </TabLink> */}
          <TabLink asChild>
            <ActiveLink href={`/txns/${txn}/receipts`}>
              Receipts Summary
            </ActiveLink>
          </TabLink>
        </TabLinks>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
      {children}
    </div>
  );
};

export default TxnLayout;
