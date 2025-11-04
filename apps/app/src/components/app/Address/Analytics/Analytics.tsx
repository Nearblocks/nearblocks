import AnalyticsTabActions from './AnalyticsTabActions';
import AnalyticsOverview from './Overview';
import AnalyticsBalance from './Balance';

const Analytics = async () => {
  const tabPanels = [
    <AnalyticsOverview key="overview" />,
    <AnalyticsBalance key="balance" />,
    <div key="transactions">Content for Transactions</div>,
    <div key="txns-fees">Content for Txns Fees</div>,
    <div key="token-transfers">Content for Token Transfers</div>,
  ];

  return <AnalyticsTabActions tabPanels={tabPanels} />;
};
export default Analytics;
