import { Delegators } from '@/components/validators/node/delegators';

type Props = PageProps<'/[lang]/validators/[node]'>;

const NodeDelegatorsPage = async ({ params }: Props) => {
  const { node } = await params;

  return <Delegators node={node} />;
};

export default NodeDelegatorsPage;
