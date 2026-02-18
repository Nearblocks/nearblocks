import { Blocks } from '@/components/blocks';
import { ErrorSuspense } from '@/components/error-suspense';
import { fetchBlockCount, fetchBlocks } from '@/data/blocks';

type Props = PageProps<'/[lang]/blocks'>;

const BlocksPage = async ({ searchParams }: Props) => {
  const filters = await searchParams;
  const blocksPromise = fetchBlocks(filters);
  const blockCountPromise = fetchBlockCount();

  return (
    <ErrorSuspense fallback={<Blocks loading />}>
      <Blocks
        blockCountPromise={blockCountPromise}
        blocksPromise={blocksPromise}
      />
    </ErrorSuspense>
  );
};

export default BlocksPage;
