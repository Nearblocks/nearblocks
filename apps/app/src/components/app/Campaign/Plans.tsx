'use client';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

import UserLayout from '@/components/app/Layouts/UserLayout';
import useAuth, { request } from '@/hooks/app/useAuth';
import { catchErrors, dollarFormat } from '@/utils/app/libs';
import { currentCampaign } from '@/utils/types';

import LoadingCircular from '../common/LoadingCircular';
import Skeleton from '../skeleton/common/Skeleton';
import withAuth from '../stores/withAuth';
import SwitchButton from '../SwitchButton';

interface CampaignDetail {
  currentPlan?: currentCampaign;
}

const CampaignPlans = ({ userRole }: { userRole?: string }) => {
  const [_currentPlanId, setCurrentPlanId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState<{ [key: string]: boolean }>(
    {},
  );
  const [interval, setInterval] = useState(false);
  const [purchasedPlanId, setPurchasedPlanId] = useState<null | string>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const status = searchParams?.get('status');
  const { data, mutate } = useAuth('/campaign/plans');
  const { data: userData, mutate: campaignMutate } = useAuth(
    '/campaign/subscription-info',
    {
      revalidateOnMount: true,
    },
  );
  const currentPlans = userData?.campaignDetails?.map(
    (detail: CampaignDetail) => detail?.currentPlan?.id,
  );

  const onGetStarted = async (plan: currentCampaign): Promise<void> => {
    setCurrentPlanId(plan?.id);
    localStorage.setItem('purchased-plan-id', plan?.id);
    setIsSubmitting((prev) => ({ ...prev, [plan?.id]: true }));

    try {
      const res = await request.post(`advertiser/subscribe`, {
        interval: !interval ? 'month' : 'year',
        plan_id: plan?.id,
      });
      setIsSubmitting((prev) => ({ ...prev, [plan?.id]: false }));
      if (res?.data) {
        await router.push(res?.data && res?.data['url ']);
      }
      mutate();
      campaignMutate();
    } catch (error) {
      //const statusCode = get(error, "response.status") || null;
      setCurrentPlanId('');
      const message = catchErrors(error);
      if (message === 'You have already subscribed this plan') {
        if (!toast.isActive('plan-subscrition-exists')) {
          toast.error('You have already subscribed this plan', {
            toastId: 'plan-subscrition-exists',
          });
        }
      } else {
        if (!toast.isActive('plan-subscrition-error')) {
          toast.error('Something went wrong, please try again later', {
            toastId: 'plan-subscrition-error',
          });
        }
      }
      setIsSubmitting((prev) => ({ ...prev, [plan?.id]: false }));
    }
  };

  useEffect(() => {
    const purchasedPlanId = localStorage.getItem('purchased-plan-id');
    setPurchasedPlanId(purchasedPlanId);

    if (purchasedPlanId) {
      const timer = setTimeout(() => {
        localStorage.removeItem('purchased-plan-id');
      }, 10000);

      return () => clearTimeout(timer);
    }
    return;
  }, []);

  return (
    <UserLayout role={userRole} title="Create new campaign type">
      <div className="w-full bg-white dark:bg-black-600 rounded-xl soft-shadow h-fit py-6">
        <h2 className="text-2xl my-2 text-center px-14 dark:text-neargray-10">
          Choose a plan that&apos;s right for you.
        </h2>
        <div className="my-4 flex justify-center items-center font-thin">
          <p
            className={`${
              !interval ? 'text-black dark:text-neargray-10' : 'text-gray-600'
            } text-sm mx-2`}
          >
            Monthly{' '}
          </p>
          <span className="mx-2">
            <SwitchButton
              onChange={() => setInterval(!interval)}
              selected={interval}
            />
          </span>
          <p
            className={`${
              interval ? 'text-black dark:text-neargray-10' : 'text-gray-500'
            } text-sm`}
          >
            Annually{' '}
          </p>
        </div>
        <div
          className="text-gray-600 dark:text-neargray-10 grid justify-items-center sm:px-10 2xl:px-20  grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 py-6"
          id="plans"
        >
          {data?.data?.length
            ? data?.data?.map((plan: currentCampaign, index: number) => (
                <div
                  className={`bg-white dark:bg-black-200 rounded-md  text-center w-full md:w-[280px] shadow-xl hover:shadow-2xl`}
                  key={index}
                >
                  <div
                    className={`border-b border-b-gray-200 dark:border-b-gary-600 ${
                      (status === 'success' || status === 'cancelled') &&
                      purchasedPlanId == plan?.id
                        ? ''
                        : 'mt-8'
                    }`}
                  >
                    <div className="px-4 py-0">
                      <h3 className="uppercase py-4 text-sm">{plan?.title}</h3>
                      <h1 className="py-4 text-4xl">
                        {!interval ? (
                          <p>
                            ${dollarFormat(plan?.price_monthly / 100)}
                            <span className="text-lg">/mo</span>
                          </p>
                        ) : (
                          <p>
                            ${dollarFormat(plan?.price_annually / 100)}
                            <span className="text-lg">/yr</span>
                          </p>
                        )}
                      </h1>
                    </div>
                  </div>
                  <div className="px-4 py-4">
                    <h3 className="py-2 text-sm">30 slots available</h3>
                    <h3 className="py-2 text-sm">Rotate between each slot</h3>
                    <button
                      className={`text-sm hover:bg-green-400 text-white font-semibold px-7 ${
                        isSubmitting[plan?.id] ? 'py-5' : 'py-3'
                      } ${
                        (status === 'success' || status === 'cancelled') &&
                        purchasedPlanId == plan?.id
                          ? 'mt-3'
                          : 'my-6'
                      }  bg-green-500 dark:bg-green-250 dark:text-neargray-10 rounded w-full transition ease-in-out delay-150 hover:-translate-y-1 hover:scale-100 duration-300 hover:shadow-md hover:shadow-green-500`}
                      onClick={() => {
                        onGetStarted(plan);
                      }}
                    >
                      {isSubmitting[plan?.id] ? (
                        <div className="absolute inset-0 flex items-center justify-center cursor-not-allowed opacity-60">
                          <LoadingCircular className="w-4 h-4" />
                        </div>
                      ) : currentPlans?.includes(plan?.id) ? (
                        <span>Active Subscription</span>
                      ) : (
                        <span>Get started now</span>
                      )}
                    </button>
                  </div>
                </div>
              ))
            : [...Array(2)].map((_, i) => (
                <div
                  className={`bg-white dark:bg-black-300 rounded-md px-4 py-4 text-center w-full md:w-[280px] shadow-xl hover:shadow-2xl`}
                  key={i}
                >
                  <div className="border-b border-b-gray-200 dark:border-b-black-200 py-2">
                    <h3 className="uppercase py-4 text-sm">
                      <Skeleton className="h-4" />
                    </h3>
                    <h1 className="py-4 text-4xl">
                      <Skeleton className="h-4" />
                    </h1>
                  </div>
                  <div className="pt-4">
                    <h3 className="py-2 text-sm">
                      <Skeleton className="h-4" />
                    </h3>
                    <h3 className="py-2 text-sm">
                      <Skeleton className="h-4" />
                    </h3>
                    <div className="text-sm text-white font-semibold px-7 py-3 mt-4 rounded w-full transition ease-in-out delay-150 hover:-translate-y-1 hover:scale-100 duration-300 hover:shadow-md">
                      <span>
                        <Skeleton className="h-4" />
                      </span>
                    </div>
                  </div>
                </div>
              ))}
        </div>
      </div>
    </UserLayout>
  );
};

export default withAuth(CampaignPlans);
