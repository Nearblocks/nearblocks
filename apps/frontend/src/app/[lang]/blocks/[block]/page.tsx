import { Overview } from '@/components/blocks/overview';
import { ErrorSuspense } from '@/components/error-suspense';
import { fetchBlock } from '@/data/blocks';

type Props = PageProps<'/[lang]/blocks/[block]'>;

const BlockPage = async ({ params }: Props) => {
  const { block } = await params;
  const blockPromise = fetchBlock(block);

  return (
    <div className="flex flex-col gap-4">
      <ErrorSuspense fallback={<Overview loading />}>
        <Overview blockPromise={blockPromise} />
      </ErrorSuspense>
    </div>
  );
};

export default BlockPage;
