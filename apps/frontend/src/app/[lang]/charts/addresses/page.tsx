import type { Metadata } from 'next';

import { AddressesChart } from '@/components/charts/charts';
import { ErrorSuspense } from '@/components/error-suspense';
import { PageHeading } from '@/components/page-heading';
import { fetchAddressStats } from '@/data/charts';
import { hasLocale, translator } from '@/locales/dictionaries';

type Props = PageProps<'/[lang]/charts/addresses'>;

export const generateMetadata = async ({
  params,
}: Props): Promise<Metadata> => {
  const { lang } = await params;
  const locale = hasLocale(lang) ? lang : 'en';
  const t = await translator(locale, 'charts');

  return {
    alternates: { canonical: '/charts/addresses' },
    description: t('addresses.meta.description'),
    title: t('addresses.meta.title'),
  };
};

const AddressesPage = async ({ params }: Props) => {
  const { lang } = await params;
  const locale = hasLocale(lang) ? lang : 'en';
  const t = await translator(locale, 'charts');
  const statsPromise = fetchAddressStats();

  return (
    <>
      <PageHeading apiTag="" title={t('addresses.heading')} />
      <ErrorSuspense fallback={<AddressesChart loading />}>
        <AddressesChart statsPromise={statsPromise} />
      </ErrorSuspense>
    </>
  );
};

export default AddressesPage;
