import { Overview } from '@/components/blocks/overview';
import { ErrorSuspense } from '@/components/error-suspense';
import { fetchBlock } from '@/data/blocks';

type Props = PageProps<'/[lang]/blocks/[bid]'>;

const BlockPage = async ({ params }: Props) => {
  const { bid } = await params;
  const blockPromise = fetchBlock(bid);

  return (
    <>
      <h1 className="text-headline-lg mb-6">
        Block{' '}
        <span className="text-muted-foreground text-headline-base">#{bid}</span>
      </h1>
      <ErrorSuspense fallback={<Overview loading />}>
        <Overview blockPromise={blockPromise} />
      </ErrorSuspense>
    </>
  );
};

export default BlockPage;
