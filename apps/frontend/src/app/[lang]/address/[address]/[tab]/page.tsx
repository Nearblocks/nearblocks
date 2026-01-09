import { notFound } from 'next/navigation';

import { FTTxns } from '@/components/address/fts';
import { Keys } from '@/components/address/keys';
import { NFTTxns } from '@/components/address/nfts';
import { Receipts } from '@/components/address/receipts';
import { ErrorSuspense } from '@/components/error-suspense';
import { fetchFTTxnCount, fetchFTTxns } from '@/data/address/fts';
import { fetchKeyCount, fetchKeys } from '@/data/address/keys';
import { fetchNFTTxnCount, fetchNFTTxns } from '@/data/address/nfts';
import { fetchReceiptCount, fetchReceipts } from '@/data/address/receipts';

type Props = PageProps<'/[lang]/address/[address]/[tab]'>;

const tabs = [
  'receipts',
  'txns',
  'fts',
  'nfts',
  'keys',
  'assets',
  'contract',
] as const;
type TabType = (typeof tabs)[number];

const Tab = async ({ params, searchParams }: Props) => {
  const [{ address, tab }, filters] = await Promise.all([params, searchParams]);
  const receiptsPromise = fetchReceipts(address, filters);
  const receiptCountPromise = fetchReceiptCount(address, filters);
  const ftsPromise = fetchFTTxns(address, filters);
  const ftCountPromise = fetchFTTxnCount(address, filters);
  const nftsPromise = fetchNFTTxns(address, filters);
  const nftCountPromise = fetchNFTTxnCount(address, filters);
  const keysPromise = fetchKeys(address, filters);
  const keyCountPromise = fetchKeyCount(address);

  if (!tab || !tabs.includes(tab as TabType)) {
    notFound();
  }

  switch (tab as TabType) {
    case 'receipts':
      return (
        <ErrorSuspense fallback={<Receipts loading />}>
          <Receipts
            receiptCountPromise={receiptCountPromise}
            receiptsPromise={receiptsPromise}
          />
        </ErrorSuspense>
      );
    case 'fts':
      return (
        <ErrorSuspense fallback={<FTTxns loading />}>
          <FTTxns ftCountPromise={ftCountPromise} ftsPromise={ftsPromise} />
        </ErrorSuspense>
      );
    case 'nfts':
      return (
        <ErrorSuspense fallback={<NFTTxns loading />}>
          <NFTTxns
            nftCountPromise={nftCountPromise}
            nftsPromise={nftsPromise}
          />
        </ErrorSuspense>
      );
    case 'keys':
      return (
        <ErrorSuspense fallback={<Keys loading />}>
          <Keys keyCountPromise={keyCountPromise} keysPromise={keysPromise} />
        </ErrorSuspense>
      );
    default:
      notFound();
  }
};

export default Tab;
