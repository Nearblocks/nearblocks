import { Spinner } from '@/components/lib/Spinner';
import dynamic from 'next/dynamic';

const ExplorerSelector = dynamic(
  () => import('../components/ExplorerSelector'),
  {
    loading: () => <Spinner />,
    ssr: false,
  },
);
const HomePage = () => {
  return <ExplorerSelector />;
};

export default HomePage;
