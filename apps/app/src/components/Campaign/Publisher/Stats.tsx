import React from 'react';
import useAuth from '@/hooks/useAuth';
import { localFormat } from '@/utils/libs';
import Skeleton from '@/components/skeleton/common/Skeleton';

type Props = {
  campaignId?: string | string[];
  isTextHide?: boolean;
};

const AdImpressions = ({ campaignId, isTextHide }: Props) => {
  const { data, loading } = useAuth('publisher/stats');
  const { data: campaignStats, loading: campaignDataLoading } = useAuth(
    campaignId ? `campaign/${campaignId}/stats` : '',
  );

  const { data: campaignOverAllStats, loading: campaignOverAllDataLoading } =
    useAuth(campaignId ? `campaign/${campaignId}/overall-stats` : '');

  let totalImpression = +data?.totalImpression ? +data?.totalImpression : '0';
  let totalClicks = +data?.totalClicks ? +data?.totalClicks : '0';
  let totalAds = +data?.totalAds ? +data?.totalAds : '0';

  return (
    <>
      {!isTextHide ? (
        <div className="flex-wrap md:!flex-nowrap flex gap-4">
          <div className="w-full bg-white dark:bg-black-600 border soft-shadow rounded-xl px-8">
            <h1 className="text-xl mt-8 text-black dark:text-neargray-10">
              {campaignId ? 'Active Subscription' : 'Total Campaigns'}
              {!isTextHide ? (
                <p className="text-sm">[current Month]</p>
              ) : (
                <p className="text-sm">[Overall]</p>
              )}
            </h1>
            {!loading ? (
              <p className="mt-4 mb-8 text-3xl text-gray-500 dark:text-neargray-10">
                {campaignId ? (
                  !campaignDataLoading ? (
                    campaignStats?.activeSubscription.toLocaleString('en-US', {
                      style: 'currency',
                      currency: 'USD',
                    })
                  ) : (
                    <Skeleton className="w-10 h-8 mt-4 mb-8" />
                  )
                ) : (
                  localFormat(totalAds.toString())
                )}
              </p>
            ) : (
              <Skeleton className="w-10 h-8 mt-4 mb-8" />
            )}
          </div>
          <div className="w-full bg-white dark:bg-black-600 border soft-shadow rounded-xl px-8">
            <h1 className="text-xl mt-8 text-black dark:text-neargray-10">
              Total Impressions
              {!isTextHide ? (
                <p className="text-sm">[current Month]</p>
              ) : (
                <p className="text-sm">[Overall]</p>
              )}
            </h1>
            {!loading ? (
              <p className="mt-4 mb-8 text-3xl text-gray-500 dark:text-neargray-10">
                {campaignId ? (
                  !campaignDataLoading ? (
                    localFormat(campaignStats?.totalImpression)
                  ) : (
                    <Skeleton className="w-10 h-8 mt-4 mb-8" />
                  )
                ) : (
                  localFormat(totalImpression.toString())
                )}
              </p>
            ) : (
              <Skeleton className="w-10 h-6 mt-4 mb-8" />
            )}
          </div>
          <div className="w-full bg-white dark:bg-black-600 border soft-shadow rounded-xl px-8">
            <h1 className="text-xl mt-8 text-black dark:text-neargray-10">
              Total Clicks
            </h1>
            {!loading ? (
              <p className="mt-4 mb-8 text-3xl text-gray-500 dark:text-neargray-10">
                {campaignId ? (
                  !campaignDataLoading ? (
                    localFormat(campaignStats?.totalClicks)
                  ) : (
                    <Skeleton className="w-10 h-8 mt-4 mb-8" />
                  )
                ) : (
                  localFormat(totalClicks.toString())
                )}
              </p>
            ) : (
              <Skeleton className="w-10 h-6 mt-4 mb-8" />
            )}
          </div>
        </div>
      ) : (
        <div className="flex-wrap md:!flex-nowrap flex gap-4">
          <div className="w-full bg-white dark:bg-black-600 border soft-shadow rounded-xl px-8">
            <h1 className="text-xl mt-8 text-black dark:text-neargray-10">
              Total Impressions
              {!isTextHide ? (
                <p className="text-sm">[current Month]</p>
              ) : (
                <p className="text-sm">[Overall]</p>
              )}
            </h1>
            {!loading ? (
              <p className="mt-4 mb-8 text-3xl text-gray-500 dark:text-neargray-10">
                {campaignId ? (
                  !campaignOverAllDataLoading ? (
                    localFormat(campaignOverAllStats?.totalImpression)
                  ) : (
                    <Skeleton className="w-10 h-8 mt-4 mb-8" />
                  )
                ) : (
                  localFormat(totalImpression.toString())
                )}
              </p>
            ) : (
              <Skeleton className="w-10 h-6 mt-4 mb-8" />
            )}
          </div>
          <div className="w-full bg-white dark:bg-black-600 border soft-shadow rounded-xl px-8">
            <h1 className="text-xl mt-8 text-black dark:text-neargray-10">
              Total Clicks
            </h1>
            {!loading ? (
              <p className="mt-4 mb-8 text-3xl text-gray-500 dark:text-neargray-10">
                {campaignId ? (
                  !campaignOverAllDataLoading ? (
                    localFormat(campaignOverAllStats?.totalClicks)
                  ) : (
                    <Skeleton className="w-10 h-8 mt-4 mb-8" />
                  )
                ) : (
                  localFormat(totalClicks.toString())
                )}
              </p>
            ) : (
              <Skeleton className="w-10 h-6 mt-4 mb-8" />
            )}
          </div>
          <div className="w-full bg-white dark:bg-black-600 border soft-shadow rounded-xl px-8">
            <h1 className="text-xl mt-8 text-black dark:text-neargray-10">
              {campaignId ? 'Active Subscription' : 'Total Campaigns'}
              {!isTextHide ? (
                <p className="text-sm">[current Month]</p>
              ) : (
                !campaignId && <p className="text-sm">[Overall]</p>
              )}
            </h1>
            {!loading ? (
              <p className="mt-4 mb-8 text-3xl text-gray-500 dark:text-neargray-10">
                {campaignId ? (
                  !campaignOverAllDataLoading ? (
                    campaignOverAllStats?.activeSubscription.toLocaleString(
                      'en-US',
                      {
                        style: 'currency',
                        currency: 'USD',
                      },
                    )
                  ) : (
                    <Skeleton className="w-10 h-8 mt-4 mb-8" />
                  )
                ) : (
                  localFormat(totalAds.toString())
                )}
              </p>
            ) : (
              <Skeleton className="w-10 h-8 mt-4 mb-8" />
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default AdImpressions;
