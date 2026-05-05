import { Metadata } from 'next';

import { Receipts as AddressReceipts } from '@/components/address/receipts';
import { ErrorSuspense } from '@/components/error-suspense';
import { Receipts } from '@/components/receipts';
import {
  fetchReceiptCount as fetchAddressReceiptCount,
  fetchReceipts as fetchAddressReceipts,
} from '@/data/address/receipts';
import { fetchReceiptCount, fetchReceipts } from '@/data/receipts';
import { hasLocale, translator } from '@/locales/dictionaries';

type Props = PageProps<'/[lang]/receipts'>;

export const generateMetadata = async ({
  params,
}: Props): Promise<Metadata> => {
  const { lang } = await params;
  const locale = hasLocale(lang) ? lang : 'en';
  const t = await translator(locale, 'receipts');

  return {
    alternates: { canonical: '/receipts' },
    description: t('meta.description'),
    title: t('meta.title'),
  };
};

const ReceiptsPage = async ({ params, searchParams }: Props) => {
  const { lang } = await params;
  const locale = hasLocale(lang) ? lang : 'en';
  const t = await translator(locale, 'receipts');
  const filters = await searchParams;
  const account =
    typeof filters.account === 'string' ? filters.account : undefined;

  if (account) {
    const receiptsPromise = fetchAddressReceipts(account, filters);
    const receiptCountPromise = fetchAddressReceiptCount(account, filters);

    return (
      <>
        <h1 className="text-headline-lg mb-4">{t('title')}</h1>
        <ErrorSuspense fallback={<AddressReceipts loading />}>
          <AddressReceipts
            address={account}
            basePath="/receipts"
            receiptCountPromise={receiptCountPromise}
            receiptsPromise={receiptsPromise}
          />
        </ErrorSuspense>
      </>
    );
  }

  const receiptsPromise = fetchReceipts(filters);
  const receiptCountPromise = fetchReceiptCount(filters);

  return (
    <>
      <h1 className="text-headline-lg mb-4">{t('title')}</h1>
      <ErrorSuspense fallback={<Receipts loading />}>
        <Receipts
          receiptCountPromise={receiptCountPromise}
          receiptsPromise={receiptsPromise}
        />
      </ErrorSuspense>
    </>
  );
};

export default ReceiptsPage;
