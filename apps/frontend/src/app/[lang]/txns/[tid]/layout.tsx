import type { Metadata } from 'next';

import { ActiveLink } from '@/components/link';
import { TabLink } from '@/components/tab-links';
import { TabLinks } from '@/components/tab-links';
import { hasLocale, translator } from '@/locales/dictionaries';
import { ScrollArea, ScrollBar } from '@/ui/scroll-area';

type Props = LayoutProps<'/[lang]/txns/[tid]'>;

export const generateMetadata = async ({
  params,
}: Props): Promise<Metadata> => {
  const { lang, tid } = await params;
  const locale = hasLocale(lang) ? lang : 'en';
  const t = await translator(locale, 'txns');

  return {
    alternates: { canonical: `/txns/${tid}` },
    description: t('tidMeta.description', { tid }),
    title: t('tidMeta.title', { tid }),
  };
};

const TxnLayout = async ({ children, params }: Props) => {
  const { lang, tid } = await params;
  const locale = hasLocale(lang) ? lang : 'en';
  const t = await translator(locale, 'txns');

  return (
    <>
      <h1 className="text-headline-lg mb-6">
        {t('tid.title')}{' '}
        <span className="text-muted-foreground text-headline-base">#{tid}</span>
      </h1>
      <ScrollArea className="mb-3 w-full whitespace-nowrap">
        <TabLinks>
          <TabLink asChild>
            <ActiveLink href={`/txns/${tid}`}>{t('tid.overview')}</ActiveLink>
          </TabLink>
          <TabLink asChild>
            <ActiveLink href={`/txns/${tid}/execution`}>
              {t('tid.execution')}
            </ActiveLink>
          </TabLink>
          <TabLink asChild>
            <ActiveLink href={`/txns/${tid}/receipts`}>
              {t('tid.receipts')}
            </ActiveLink>
          </TabLink>
        </TabLinks>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
      {children}
    </>
  );
};

export default TxnLayout;
