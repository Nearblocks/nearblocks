'use client';
import React from 'react';

import Stats from '@/components/app/Campaign/Advertiser/Stats';
import BannerAdForm from '@/components/app/Campaign/BannerAdForm';
import CampaignStats from '@/components/app/Campaign/Publisher/Stats';
import TextAdForm from '@/components/app/Campaign/TextAdForm';
import UserLayout from '@/components/app/Layouts/UserLayout';
import CircularLoader from '@/components/app/skeleton/common/CircularLoader';
import useAuth from '@/hooks/app/useAuth';

import withAuth from '../stores/withAuth';

const CampaignEdit = ({
  campaignId,
  userRole,
}: {
  campaignId?: string;
  userRole?: string;
}) => {
  const { mutate } = useAuth('/campaigns/subscription-info');
  const {
    data: campaignData,
    loading,
    mutate: campaignMutate,
  } = useAuth(`/campaigns/${campaignId}`);

  return (
    <>
      <UserLayout role={userRole} title="Edit campaign type">
        <>
          <div>
            {userRole === 'advertiser' ? (
              <Stats campaignId={campaignId} />
            ) : (
              <CampaignStats campaignId={campaignId} />
            )}
          </div>
          <div className={` mt-8`}>
            {loading ? (
              <div className="h-1/2 flex items-center justify-center py-48">
                <CircularLoader />
              </div>
            ) : campaignData &&
              (campaignData?.data?.title === 'Text slots' ||
                campaignData?.data?.title === 'Placeholder Text Ad') ? (
              <TextAdForm
                campaignData={campaignData}
                campaignId={campaignId}
                campaignMutate={campaignMutate}
                loading={loading}
                mutate={mutate}
              />
            ) : (
              <BannerAdForm
                campaignData={campaignData}
                campaignId={campaignId}
                campaignMutate={campaignMutate}
                loading={loading}
                mutate={mutate}
              />
            )}
          </div>
        </>
      </UserLayout>
    </>
  );
};

export default withAuth(CampaignEdit);
