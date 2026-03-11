import { ErrorSuspense } from '@/components/error-suspense';
import { NodeExplorer } from '@/components/node-explorer';
import { RpcSelector } from '@/components/rpc';
import { fetchBlocks } from '@/data/home';
import { fetchStats } from '@/data/layout';
import { fetchValidators } from '@/data/node-explorer';

type Props = PageProps<'/[lang]/node-explorer'>;

const NodeExplorerPage = async ({ searchParams }: Props) => {
  const params = await searchParams;
  const validatorsPromise = fetchValidators(params);
  const statsPromise = fetchStats();
  const latestBlocksPromise = fetchBlocks();

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-headline-lg">NEAR Protocol Validator Explorer</h1>
        <RpcSelector />
      </div>
      <ErrorSuspense fallback={<NodeExplorer loading />}>
        <NodeExplorer
          latestBlocksPromise={latestBlocksPromise}
          statsPromise={statsPromise}
          validatorsPromise={validatorsPromise}
        />
      </ErrorSuspense>
    </>
  );
};

export default NodeExplorerPage;
