import React from 'react';

import useAuth from '@/hooks/app/useAuth';
import { localFormat } from '@/utils/app/libs';

import Skeleton from '../../skeleton/common/Skeleton';

type Props = {
  campaignId?: string;
  isTextHide?: boolean;
  statsMutate?: () => void;
};

const AdImpressions = ({ campaignId, isTextHide }: Props) => {
  const { data, loading } = useAuth('advertiser/campaigns/stats');
  const { data: campaignStats, loading: campaignDataLoading } = useAuth(
    campaignId ? `campaigns/${campaignId}/current-month-stats` : '',
  );

  const { data: campaignOverAllStats, loading: campaignOverAllDataLoading } =
    useAuth(campaignId ? `campaigns/${campaignId}/total-stats` : '');

  let totalImpression = +data?.totalImpression ? +data?.totalImpression : '0';
  let totalClicks = +data?.totalClicks ? +data?.totalClicks : '0';
  let totalSpent = +data?.totalSpent / 100 ? +data?.totalSpent / 100 : '$0';

  return (
    <>
      {!isTextHide ? (
        <div className="flex flex-wrap md:!flex-nowrap gap-4">
          <div className="w-full bg-white dark:bg-black-600 dark:text-neargray-10 border soft-shadow rounded-xl px-8">
            <h1 className="text-xl mt-8 text-black dark:text-neargray-10">
              Total Impressions
              {!isTextHide ? (
                <p className="text-sm">[current Month]</p>
              ) : (
                <p className="text-sm">[Overall]</p>
              )}
            </h1>
            {!loading ? (
              <div className="mt-4 mb-8 text-3xl text-gray-500 dark:text-neargray-10">
                {campaignId ? (
                  !campaignDataLoading ? (
                    localFormat(campaignStats?.totalImpression)
                  ) : (
                    <Skeleton className="w-10 h-9 mt-4 mb-8" />
                  )
                ) : (
                  localFormat(totalImpression.toString())
                )}
              </div>
            ) : (
              <Skeleton className="w-10 h-9 mt-4 mb-8" />
            )}
          </div>
          <div className="w-full bg-white dark:bg-black-600 dark:text-neargray-10 border soft-shadow rounded-xl px-8">
            <h1 className="text-xl mt-8 text-black dark:text-neargray-10">
              Total Clicks{' '}
              {!isTextHide ? (
                <p className="text-sm">[current Month]</p>
              ) : (
                <p className="text-sm">[Overall]</p>
              )}
            </h1>
            {!loading ? (
              <div className="mt-4 mb-8 text-3xl text-gray-500 dark:text-neargray-10">
                {campaignId ? (
                  !campaignDataLoading ? (
                    localFormat(campaignStats?.totalClicks)
                  ) : (
                    <Skeleton className="w-10 h-9 mt-4 mb-8" />
                  )
                ) : (
                  localFormat(totalClicks.toString())
                )}
              </div>
            ) : (
              <Skeleton className="w-10 h-9 mt-4 mb-8" />
            )}
          </div>
          <div className="w-full bg-white dark:bg-black-600 border soft-shadow rounded-xl px-8">
            <h1 className="text-xl mt-8 text-black dark:text-neargray-10">
              Active Subscription{' '}
            </h1>
            {!loading ? (
              <div
                className={`${
                  !isTextHide ? 'mt-8' : 'mt-4'
                } mb-8 text-3xl text-gray-500 dark:text-neargray-10`}
              >
                {campaignId ? (
                  !campaignDataLoading ? (
                    campaignStats?.activeSubscription?.toLocaleString('en-US', {
                      currency: 'USD',
                      style: 'currency',
                    })
                  ) : (
                    <Skeleton
                      className={`w-10 h-9 ${
                        !isTextHide ? 'mt-8' : 'mt-4'
                      } mb-8`}
                    />
                  )
                ) : (
                  totalSpent?.toLocaleString('en-US', {
                    currency: 'USD',
                    style: 'currency',
                  })
                )}
              </div>
            ) : (
              <Skeleton
                className={`w-10 h-9 ${!isTextHide ? 'mt-8' : 'mt-4'} mb-8`}
              />
            )}
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap md:!flex-nowrap gap-4">
          <div className="w-full bg-white dark:bg-black-600 dark:text-neargray-10 border soft-shadow rounded-xl px-8">
            <h1 className="text-xl mt-8 text-black dark:text-neargray-10">
              Total Impressions{' '}
              {!isTextHide ? (
                <p className="text-sm">[current Month]</p>
              ) : (
                <p className="text-sm">[Overall]</p>
              )}
            </h1>
            {!loading ? (
              <div className="mt-4 mb-8 text-3xl text-gray-500 dark:text-neargray-10">
                {campaignId ? (
                  !campaignOverAllDataLoading ? (
                    localFormat(campaignOverAllStats?.totalImpression)
                  ) : (
                    <Skeleton className="w-10 h-9 mt-4 mb-8" />
                  )
                ) : (
                  localFormat(totalImpression.toString())
                )}
              </div>
            ) : (
              <Skeleton className="w-10 h-9 mt-4 mb-8" />
            )}
          </div>
          <div className="w-full bg-white dark:bg-black-600 dark:text-neargray-10 border soft-shadow rounded-xl px-8">
            <h1 className="text-xl mt-8 text-black dark:text-neargray-10">
              Total Clicks{' '}
              {!isTextHide ? (
                <p className="text-sm">[current Month]</p>
              ) : (
                <p className="text-sm">[Overall]</p>
              )}
            </h1>
            {!loading ? (
              <div className="mt-4 mb-8 text-3xl text-gray-500 dark:text-neargray-10">
                {campaignId ? (
                  !campaignOverAllDataLoading ? (
                    localFormat(campaignOverAllStats?.totalClicks)
                  ) : (
                    <Skeleton className="w-10 h-9 mt-4 mb-8" />
                  )
                ) : (
                  localFormat(totalClicks.toString())
                )}
              </div>
            ) : (
              <Skeleton className="w-10 h-9 mt-4 mb-8" />
            )}
          </div>
          <div className="w-full bg-white dark:bg-black-600 border soft-shadow rounded-xl px-8">
            <h1 className="text-xl mt-8 text-black dark:text-neargray-10">
              Active Subscription{' '}
            </h1>
            {!loading ? (
              <div
                className={`${
                  !isTextHide ? 'mt-8' : 'mt-4'
                } mb-8 text-3xl text-gray-500 dark:text-neargray-10`}
              >
                {campaignId ? (
                  !campaignOverAllDataLoading ? (
                    campaignOverAllStats?.activeSubscription?.toLocaleString(
                      'en-US',
                      {
                        currency: 'USD',
                        style: 'currency',
                      },
                    )
                  ) : (
                    <Skeleton
                      className={`w-10 h-9 ${
                        !isTextHide ? 'mt-8' : 'mt-4'
                      } mb-8`}
                    />
                  )
                ) : (
                  totalSpent?.toLocaleString('en-US', {
                    currency: 'USD',
                    style: 'currency',
                  })
                )}
              </div>
            ) : (
              <Skeleton
                className={`w-10 h-9 ${!isTextHide ? 'mt-8' : 'mt-4'} mb-8`}
              />
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default AdImpressions;
