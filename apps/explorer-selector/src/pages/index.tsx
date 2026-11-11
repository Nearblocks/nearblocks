import ExplorerSelector from '@/components/ExplorerSelector';
import { networkProps, NetworkProps } from '@/utils/config';

export const getServerSideProps = networkProps;

const HomePage = ({ network }: NetworkProps) => {
  return <ExplorerSelector network={network} />;
};

export default HomePage;
