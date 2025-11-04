import { getRequest } from '@/utils/app/api';
import InfoCard from '../../common/InfoCard';
import TxnsHeatmap from './HeatMap';

const AnalyticsOverview = async () => {
  const data = await getRequest('v1/charts');

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
        <InfoCard
          title="Transaction Count"
          value="3,539"
          footerText="Since Wed 21, Jun 2023"
          showTooltip="Transaction Count"
        />
        <InfoCard
          title="Transaction Count"
          value="3,539"
          footerText="Since Wed 21, Jun 2023"
        />
        <InfoCard
          title="Transaction Count"
          value="3,539"
          footerText="Since Wed 21, Jun 2023"
        />
        <InfoCard
          title="Transaction Count"
          value="3,539"
          footerText="Since Wed 21, Jun 2023"
        />
      </div>
      <TxnsHeatmap
        data={data?.charts}
        startDate="2024-01-01"
        endDate="2024-12-31"
      />
    </>
  );
};

export default AnalyticsOverview;
