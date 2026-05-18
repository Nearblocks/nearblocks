import { FileX } from 'lucide-react';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { searchReceipts, searchTxns } from '@/actions/search';
import { EmptyBox } from '@/components/empty';
import { Card } from '@/ui/card';

type Props = PageProps<'/[lang]/hash/[receipt]'>;

export const generateMetadata = async (): Promise<Metadata> => ({
  alternates: { canonical: '/' },
  robots: { index: false },
  title: 'Receipt lookup',
});

const HashPage = async ({ params }: Props) => {
  const { receipt } = await params;

  const receipts = await searchReceipts(receipt);
  const txnHash = receipts[0]?.transaction_hash;
  if (txnHash) {
    redirect(`/txns/${txnHash}`);
  }

  const txns = await searchTxns(receipt);
  const directTxn = txns[0]?.transaction_hash;
  if (directTxn) {
    redirect(`/txns/${directTxn}`);
  }

  return (
    <main className="container mx-auto flex flex-1 flex-col px-4 py-10">
      <Card className="p-6">
        <EmptyBox
          description={`Could not locate a transaction for receipt: ${receipt}`}
          icon={<FileX />}
          title="Receipt not found"
        />
      </Card>
    </main>
  );
};

export default HashPage;
