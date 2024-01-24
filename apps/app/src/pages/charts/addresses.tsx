import Layout from '@/components/Layouts';
import { VmComponent } from '@/components/vm/VmComponent';
import { useBosComponents } from '@/hooks/useBosComponents';
import { networkId } from '@/utils/config';
import { ReactElement } from 'react';

const AddressesChart = () => {
  const components = useBosComponents();

  return (
    <VmComponent
      src={components?.charts}
      props={{ chartTypes: 'addresses', poweredBy: false, network: networkId }}
    />
  );
};

AddressesChart.getLayout = (page: ReactElement) => <Layout>{page}</Layout>;

export default AddressesChart;
