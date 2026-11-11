import ExplorerSelector from '@/components/ExplorerSelector';
import { networkProps, NetworkProps } from '@/utils/config';

export const getServerSideProps = networkProps;

const ExplorerPage = ({ network }: NetworkProps) => {
  return <ExplorerSelector network={network} />;
};

export default ExplorerPage;
