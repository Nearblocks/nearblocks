'use client';
import React from 'react';

import Listing from '@/components/app/Campaign/Advertiser/Listing';
import Stats from '@/components/app/Campaign/Advertiser/Stats';
import CampaignListing from '@/components/app/Campaign/Publisher/Listing';
import CampaignStats from '@/components/app/Campaign/Publisher/Stats';
import UserLayout from '@/components/app/Layouts/UserLayout';
import useAuth from '@/hooks/app/useAuth';

import withAuth from '../stores/withAuth';

const CampaignPage = ({ userRole }: { userRole?: string }) => {
  const { mutate: statsMutate } = useAuth('advertiser/stats');
  return (
    <>
      {userRole === 'advertiser' ? (
        <UserLayout role={userRole} title="My Campaigns">
          <div>
            <Stats statsMutate={statsMutate} />
          </div>
          <div className="my-campaigns">
            <div className="mt-8">
              <div>
                <Listing statsMutate={statsMutate} />
              </div>
            </div>
          </div>
        </UserLayout>
      ) : (
        <UserLayout role={userRole} title="Campaigns">
          <div>
            <CampaignStats />
          </div>
          <div className="campaigns">
            <div className="mt-8">
              <div>
                <CampaignListing />
              </div>
            </div>
          </div>
        </UserLayout>
      )}
    </>
  );
};

export default withAuth(CampaignPage);
