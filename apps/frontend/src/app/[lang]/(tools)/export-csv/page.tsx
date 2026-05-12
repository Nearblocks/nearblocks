import type { Metadata } from 'next';

import { ExportType } from 'nb-types';

import { ExportCsvForm } from '@/components/tools/export-csv/form';
import { hasLocale, translator } from '@/locales/dictionaries';

type Props = {
  params: Promise<{ lang: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export const generateMetadata = async ({
  params,
}: Props): Promise<Metadata> => {
  const { lang } = await params;
  const locale = hasLocale(lang) ? lang : 'en';
  const t = await translator(locale, 'tools');

  return {
    alternates: { canonical: '/export-csv' },
    description: t('export.subtitle'),
    title: t('export.title'),
  };
};

const ExportCsvPage = async ({ searchParams }: Props) => {
  const filters = await searchParams;
  const account =
    typeof filters.account === 'string' ? filters.account : undefined;
  const rawType = typeof filters.type === 'string' ? filters.type : undefined;
  const type =
    rawType && (Object.values(ExportType) as string[]).includes(rawType)
      ? (rawType as ExportType)
      : undefined;

  return (
    <div>
      <ExportCsvForm defaultAccount={account} defaultType={type} />
    </div>
  );
};

export default ExportCsvPage;
