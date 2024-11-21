'use client';
import Stats from '@/components/app/Campaign/Advertiser/Stats';
import Chart from '@/components/app/Campaign/Chart';
import CampaignStats from '@/components/app/Campaign/Publisher/Stats';
import UserLayout from '@/components/app/Layouts/UserLayout';

import withAuth from '../stores/withAuth';

const CampaignChart = ({
  campaignId,
  userRole,
}: {
  campaignId?: string;
  userRole?: string;
}) => {
  return (
    <>
      <UserLayout role={userRole} title="Chart">
        <>
          {userRole === 'advertiser' ? (
            <Stats campaignId={campaignId} isTextHide={true} />
          ) : (
            <CampaignStats campaignId={campaignId} isTextHide={true} />
          )}
          <div className="mt-8">
            <div className="container-xxl mx-auto">
              <div className="block bg-white dark:bg-black-600 border soft-shadow rounded-xl overflow-hidden mb-10">
                <Chart campaignId={campaignId} />
              </div>
            </div>
          </div>
        </>
      </UserLayout>
    </>
  );
};

export default withAuth(CampaignChart);
