import { cookies } from 'next/headers';

import Header from '@/components/app/Layouts/Header';
import { getRequest } from '@/utils/app/api';

export default async function Template({
  children,
}: {
  children: React.ReactNode;
}) {
  const theme = (await cookies()).get('theme')?.value || 'light';
  const [stats, blocks] = await Promise.all([
    getRequest(`stats`),
    getRequest(`blocks/latest`, { limit: 1 }),
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
      accounts: [],
      blocks: [],
      receipts: [],
      txns: [],
    };

    if (res?.blocks?.length) {
      if (returnPath) {
        return { path: res.blocks[0].block_hash, type: 'block' };
      }
      data.blocks = res.blocks;
    }

    if (res?.txns?.length) {
      if (returnPath) {
        return { path: res.txns[0].transaction_hash, type: 'txn' };
      }
      data.txns = res.txns;
    }

    if (res?.receipts?.length) {
      if (returnPath) {
        return {
          path: res.receipts[0].originated_from_transaction_hash,
          type: 'txn',
        };
      }
      data.receipts = res.receipts;
    }

    if (res?.accounts?.length) {
      if (returnPath) {
        return { path: res.accounts[0].account_id, type: 'address' };
      }
      data.accounts = res.accounts;
    }

    return returnPath ? null : data;
  };
  return (
    <>
      <Header
        block={blocks}
        handleFilterAndKeyword={handleFilterAndKeyword}
        stats={stats}
        theme={theme}
      />
      {children}
    </>
  );
}
