import { notFound } from 'next/navigation';

import { ActiveLink } from '@/components/link';
import { TabLink } from '@/components/tab-links';
import { TabLinks } from '@/components/tab-links';
import { getDictionary, hasLocale } from '@/locales/dictionaries';
import { LocaleProvider } from '@/providers/locale';
import { ScrollArea, ScrollBar } from '@/ui/scroll-area';

type Props = LayoutProps<'/[lang]/txns/[txn]'>;

const TxnLayout = async ({ children, params }: Props) => {
  const { lang, txn } = await params;

  if (!hasLocale(lang)) notFound();

  const dictionary = await getDictionary(lang, ['txns']);

  return (
    <LocaleProvider dictionary={dictionary} locale={lang}>
      <main className="flex flex-1 flex-col pt-6 pb-10">
        <div className="container mx-auto px-4">
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
              <TabLink asChild>
                <ActiveLink href={`/txns/${txn}/enhanced`}>
                  Enhanced Plan
                </ActiveLink>
              </TabLink>
              <TabLink asChild>
                <ActiveLink href={`/txns/${txn}/tree`}>Tree Plan</ActiveLink>
              </TabLink>
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
      </main>
    </LocaleProvider>
  );
};

export default TxnLayout;
