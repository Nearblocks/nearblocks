import { Spinner } from '@/components/lib/Spinner';
import dynamic from 'next/dynamic';
const ExplorerSelector = dynamic(
  () => import('../components/ExplorerSelector'),
  {
    ssr: false,
    loading: () => <Spinner />,
  },
);
const ExplorerPage = () => {
  return <ExplorerSelector />;
};

export default ExplorerPage;
