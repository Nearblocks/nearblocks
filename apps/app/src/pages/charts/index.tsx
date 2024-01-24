import Layout from '@/components/Layouts';
import { VmComponent } from '@/components/vm/VmComponent';
import { useBosComponents } from '@/hooks/useBosComponents';
import { networkId } from '@/utils/config';
import { ReactElement } from 'react';

const Charts = () => {
  const components = useBosComponents();

  return (
    <VmComponent
      src={components?.charts}
      props={{ poweredBy: false, network: networkId }}
    />
  );
};

Charts.getLayout = (page: ReactElement) => <Layout>{page}</Layout>;

export default Charts;
