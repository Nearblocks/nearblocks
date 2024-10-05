import { NextIntlClientProvider } from 'next-intl';
import Layout from '@/components/app/Layouts';
import { getRequest } from '@/utils/app/api';
import {
  getLocale,
  getMessages,
  unstable_setRequestLocale,
} from 'next-intl/server';

export default async function ProviderLayout({
  children,
}: {
  children: React.ReactNode;
  params: any;
}) {
  const locale = await getLocale();
  const messages = await getMessages({ locale });
  unstable_setRequestLocale(locale);

  const [stats, blocks] = await Promise.all([
    getRequest(`stats`),
    getRequest(`blocks/latest?limit=1`),
  ]);

  const handleFilterAndKeyword = async (
    keyword: string,
    filter: string,
    returnPath: any,
  ) => {
    'use server';

    if (keyword.includes('.')) {
      keyword = keyword.toLowerCase();
    }

    const res = await getRequest(`search${filter}?keyword=${keyword}`);

    const data = {
      blocks: [],
      txns: [],
      accounts: [],
      receipts: [],
    };

    if (res?.blocks?.length) {
      if (returnPath) {
        return { type: 'block', path: res.blocks[0].block_hash };
      }
      data.blocks = res.blocks;
    }

    if (res?.txns?.length) {
      if (returnPath) {
        return { type: 'txn', path: res.txns[0].transaction_hash };
      }
      data.txns = res.txns;
    }

    if (res?.receipts?.length) {
      if (returnPath) {
        return {
          type: 'txn',
          path: res.receipts[0].originated_from_transaction_hash,
        };
      }
      data.receipts = res.receipts;
    }

    if (res?.accounts?.length) {
      if (returnPath) {
        return { type: 'address', path: res.accounts[0].account_id };
      }
      data.accounts = res.accounts;
    }

    return returnPath ? null : data;
  };
  return (
    <>
      <NextIntlClientProvider messages={messages}>
        <Layout
          stats={stats}
          blocks={blocks}
          handleFilterAndKeyword={handleFilterAndKeyword}
        >
          {children}
        </Layout>
      </NextIntlClientProvider>
    </>
  );
}
