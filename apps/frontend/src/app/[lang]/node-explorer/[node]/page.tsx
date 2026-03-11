import { NodeDetails } from '@/components/node-explorer/node-details';
import { RpcSelector } from '@/components/rpc';

type Props = PageProps<'/[lang]/node-explorer/[node]'>;

const NodeDetailsPage = async ({ params }: Props) => {
  const { node } = await params;

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-headline-lg">Near Validator</h1>
        <RpcSelector />
      </div>
      <NodeDetails node={node} />
    </>
  );
};

export default NodeDetailsPage;
