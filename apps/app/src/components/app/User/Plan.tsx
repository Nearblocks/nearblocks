'use client';
import dayjs from 'dayjs';
import React, { useEffect } from 'react';
import { useMemo, useState } from 'react';

import Arrow from '@/components/app/Icons/Arrow';
import Avatar from '@/components/app/Icons/Avatar';
import CircleTimer from '@/components/app/Icons/CircleTimer';
import Refresh from '@/components/app/Icons/Refresh';
import UserLayout from '@/components/app/Layouts/UserLayout';
import Skeleton from '@/components/app/skeleton/common/Skeleton';
import useAuth, { request } from '@/hooks/app/useAuth';
import { localFormat } from '@/utils/libs';

import FaCheckCircle from '../Icons/FaCheckCircle';
import FaRegTimesCircle from '../Icons/FaRegTimesCircle';
import withAuth from '../stores/withAuth';
import { useConfig } from '@/hooks/app/useConfig';

const Plan = ({ role, status }: { role?: string; status?: string }) => {
  const [loadingBilling, setLoadingBilling] = useState(false);
  const { data, error, loading, mutate } = useAuth('/users/me', {}, true);
  const { userApiURL: baseURL } = useConfig();

  useEffect(() => {
    if (!loading && data) {
      const timeoutId = setTimeout(() => {
        mutate();
      }, 1000);
      return () => clearTimeout(timeoutId);
    }
    return;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, data]);

  const rateLimit = useMemo(() => {
    const usage = data?.['rate-limit'];
    const limit = usage?.limit ? usage?.limit : 0;
    const consumed = usage?.consumed ? usage?.consumed : 0;
    const percentage =
      +limit === 0 || +consumed === 0 ? 0 : (consumed / limit) * 100;

    return { consumed, limit, percentage };
  }, [data]);

  const handleManageBilling = async () => {
    setLoadingBilling(true);

    try {
      const res = await request(baseURL).post(
        `advertiser/stripe/create-billing-session`,
      );
      if (res?.data && res?.data?.url) {
        window.location.href = res?.data?.url;
      }
    } catch (error) {
      console.error('Error redirecting to Stripe:', error);
    } finally {
      setLoadingBilling(false);
    }
  };
  return (
    <>
      <UserLayout role={role} title="Current Plan">
        <div className="w-full bg-white dark:bg-black-600 dark:text-neargray-10 rounded-xl soft-shadow h-fit mb-4">
          {status === 'cancelled' && (
            <div className="py-4 px-3 flex items-center text-sm text-orange-900/70 bg-orange-300/30 rounded-md dark:bg-orange-300/5 dark:text-orange-400">
              <FaRegTimesCircle />{' '}
              <span className="ml-2"> Order has been cancelled!</span>
            </div>
          )}
          {status === 'exists' && (
            <div className="py-4 flex px-3 items-center text-sm text-orange-900/70 bg-orange-300/30 rounded-md dark:bg-orange-300/5 dark:text-orange-400">
              <FaRegTimesCircle />{' '}
              <span className="ml-2">
                {' '}
                You have already subscribed this plan!
              </span>
            </div>
          )}
          {status === 'invalid' && (
            <div className="py-4 flex px-3 items-center text-sm text-orange-900/70 bg-orange-300/30 rounded-md dark:bg-orange-300/5 dark:text-orange-400">
              <FaRegTimesCircle /> <span className="ml-2"> Invalid plan!</span>
            </div>
          )}

          {status === 'success' && (
            <div className="py-4 flex px-3 items-center text-sm text-green-500 dark:text-green-50 bg-neargreen/5 rounded-md">
              <FaCheckCircle />{' '}
              <span className="ml-2 text-green-500 dark:text-green-50">
                {' '}
                Order has been Placed!
              </span>
            </div>
          )}

          {status === 'upgraded' && (
            <div className="py-4 flex px-3 items-center text-sm text-green-500 dark:text-green-50 bg-neargreen/5 rounded-md">
              <FaCheckCircle />{' '}
              <span className="ml-2 text-green-500 dark:text-green-50">
                {' '}
                Plan Upgraded!
              </span>
            </div>
          )}
          {status === 'downgraded' && (
            <div className="py-4 flex px-3 items-center text-sm text-green-500 dark:text-green-50 bg-neargreen/5 rounded-md">
              <FaCheckCircle />{' '}
              <span className="ml-2 text-green-500 dark:text-green-50">
                {' '}
                Plan Downgraded!
              </span>
            </div>
          )}
          <div className="border-b dark:border-black-200 px-5 py-5">
            <p className="text-nearblue-600 dark:text-neargray-10">
              Current API Plans
            </p>
          </div>
          <div className="gap-1 items-center">
            <p className="text-sm text-gray-600 dark:text-neargray-10 px-6 py-4 ">
              All members are on the Free plan by default. You can upgrade or
              downgrade your plan at any time.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-1 items-center px-6 py-4  border-b dark:border-black-200">
              <p className="text-gray-600 dark:text-neargray-10 text-xs flex items-center mb-2">
                <Avatar className="text-gray-600 dark:text-neargray-10" />{' '}
                <span className="ml-2">My API plan</span>
              </p>
              {loading || error ? (
                <div className="w-full md:w-1/5">
                  <Skeleton className="flex w-20 h-4" />
                </div>
              ) : (
                <p className="text-sm text-nearblue-600 dark:text-neargray-10 font-medium">
                  {data?.user?.plan?.title} API Plan
                </p>
              )}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-1 items-center px-6 py-4  border-b dark:border-black-200">
            <p className="text-gray-600 dark:text-neargray-10 text-xs flex items-center mb-2">
              <CircleTimer className="text-gray-600 dark:text-neargray-10" />{' '}
              <span className="ml-2">API calls per minute</span>
            </p>
            {loading || error ? (
              <div className="w-full  md:w-1/5">
                <Skeleton className="flex w-20 h-4" />
              </div>
            ) : (
              <p className="text-sm text-nearblue-600 dark:text-neargray-10 font-medium">
                {localFormat(data?.user?.plan?.limit_per_minute)} Calls
              </p>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-1 items-center px-6 py-4">
            <p className="text-gray-600 dark:text-neargray-10 text-xs flex items-center mb-2">
              <Refresh className="text-gray-600 dark:text-neargray-10" />{' '}
              <span className="ml-2">Monthly Quota</span>
            </p>
            {loading || error ? (
              <div className="w-full">
                <Skeleton className="flex w-full h-8" />
              </div>
            ) : (
              <div>
                <div className="w-full bg-gray-200 dark:bg-neargray-50 h-2 rounded-full">
                  <div
                    className="bg-green-500 dark:bg-green-250 h-2 rounded-full"
                    style={{ width: rateLimit.percentage + '%' }}
                  ></div>
                </div>

                <div className="flex flex-col sm:!flex-row gap-y-2 sm:!gap-y-0 justify-between mt-1">
                  <p className="text-xs">
                    {localFormat(rateLimit.consumed)} /
                    {localFormat(rateLimit.limit)}
                  </p>
                  {data?.data?.subscription[0]?.end_date && (
                    <p className="text-xs text-nearblue-600 dark:text-neargray-10">
                      Renewal on &nbsp;
                      {dayjs(data?.data?.subscription[0]?.end_date).format(
                        'DD/MM/YYYY',
                      )}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
          <div className="flex items-center justify-end px-6 py-4">
            <button
              className={`text-[13px] text-white font-semibold px-6 py-2 bg-green-500 dark:bg-green-250 hover:-translate-y-1 hover:scale-100 duration-300 hover:shadow-md hover:shadow-green-500 rounded ${
                loadingBilling && 'cursor-not-allowed opacity-60'
              } `}
              disabled={loadingBilling}
              onClick={handleManageBilling}
              type="button"
            >
              <span className="flex px-1">
                Manage Billing
                <span>
                  <Arrow className="-rotate-45 -mt-1 h-4 w-4 fill-white" />
                </span>
              </span>
            </button>
            <a
              className="ml-4 text-[13px] text-white font-semibold px-6 py-2 bg-green-500 dark:bg-green-250 hover:-translate-y-1 hover:scale-100 duration-300 hover:shadow-md hover:shadow-green-500 rounded"
              href={'/apis'}
            >
              Upgrade / Downgrade
            </a>
          </div>
        </div>
      </UserLayout>
    </>
  );
};

export default withAuth(Plan);
