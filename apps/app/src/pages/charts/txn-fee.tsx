import Layout from '@/components/Layouts';
import { VmComponent } from '@/components/vm/VmComponent';
import { useBosComponents } from '@/hooks/useBosComponents';
import { networkId } from '@/utils/config';
import { ReactElement } from 'react';

const TxnFeeChart = () => {
  const components = useBosComponents();

  return (
    <VmComponent
      src={components?.charts}
      props={{ chartTypes: 'txn-fee', poweredBy: false, network: networkId }}
    />
  );
};

TxnFeeChart.getLayout = (page: ReactElement) => <Layout>{page}</Layout>;

export default TxnFeeChart;
