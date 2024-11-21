import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

import { request } from '@/hooks/app/useAuth';
import { CampaignProps } from '@/utils/types';

import { Loader } from '../skeleton/common/Skeleton';

const StartForm = ({
  campaignData,
  campaignId,
  campaignMutate,
  loading,
  mutate,
}: CampaignProps) => {
  const router = useRouter();
  const [checked, setChecked] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubscriptionCancelled, setIsSubscriptionCancelled] = useState(false);

  useEffect(() => {
    if (campaignData?.data?.subscription?.status === 'canceled') {
      setIsSubscriptionCancelled(true);
    } else {
      setIsSubscriptionCancelled(false);
    }
  }, [campaignData?.data?.subscription?.status]);

  const onSubmit = async () => {
    try {
      if (!campaignId) {
        if (!toast.isActive('add-campaign-info-error')) {
          toast.error('Please add your campaign information first', {
            toastId: 'add-campaign-info-error',
          });
        }
        setChecked((curr) => !curr);
      } else {
        setIsSubmitting((curr) => !curr);
        await request.post(
          `/campaign/${campaignId}/${
            campaignData && campaignData?.data?.is_active == 1
              ? 'stop'
              : 'start'
          }`,
        );
        setIsSubmitting((curr) => !curr);
        if (!toast.isActive('campaign-submit')) {
          toast.success(
            campaignData && campaignData?.data?.is_active == 1
              ? 'Campaign stopped successfully.'
              : 'Campaign started successfully. Awaiting admin approval for ad publishing.',
            {
              toastId: 'campaign-submit',
            },
          );
        }
        setChecked((curr) => !curr);
        mutate();
        campaignMutate();
        router.push('/campaign');
      }
    } catch (error: any) {
      if (!toast.isActive('campaign-submit-error')) {
        toast.error(error?.response?.data, {
          toastId: 'campaign-submit-error',
        });
      }
      setIsSubmitting((curr) => !curr);
      setChecked((curr) => !curr);
    }
  };

  if (loading) {
    return (
      <div className="my-4 rounded-xl soft-shadow border dark:border-black-200">
        <div className="border-b dark:border-black-200 px-5 py-5">
          <>
            <Loader wrapperClassName="flex h-5 w-32" />
          </>
        </div>

        <div className="px-6 pt-4 mt-2">
          <Loader wrapperClassName="flex h-5 w-72" />
        </div>
        <div className="flex items-center justify-between px-6 py-4">
          <div className="w-full">
            <div className="w-full flex items-center">
              <input disabled type="checkbox" />
              <Loader
                className="ml-2"
                wrapperClassName="flex flex-grow h-4 w-64"
              />
            </div>
          </div>
          <div>
            <Loader wrapperClassName="flex h-9 w-24" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="w-full bg-white dark:bg-black-600 rounded-xl soft-shadow h-fit my-4">
        {/* <div className="pl-8 pb-3 border-b dark:border-black-200"> */}
        <div className="border-b px-5 py-5 dark:border-black-200">
          <p className="text-black dark:text-neargray-10">
            {!campaignData || campaignData?.data?.is_active == 0
              ? 'Start Campaign'
              : 'Stop Campaign'}
          </p>
        </div>
        <div className="border-b items-center justify-between dark:border-black-200">
          <p className="text-sm text-black dark:text-neargray-10 mt-2 px-6 pt-4 font-semibold">
            {!campaignData || campaignData?.data?.is_active == 0
              ? 'Your campaign will start once approved by an administrator'
              : 'Are you sure you want to permanently stop this campaign?'}
          </p>

          {!campaignData || campaignData?.data?.is_active == 0 ? (
            <div className="flex items-center justify-between px-6 py-4">
              <div className="text-gray-600 dark:text-neargray-10 text-sm flex items-center">
                <input
                  checked={checked}
                  disabled={isSubscriptionCancelled}
                  onChange={() => setChecked((curr) => !curr)}
                  type="checkbox"
                />
                <span className="text-sm text-gray-600 dark:text-neargray-10 ml-2">
                  Confirm that I want to start this campaign.
                </span>
              </div>
              <div>
                <button
                  className={`text-sm text-[13px] px-10
               focus:outline-none text-white dark:text-neargray-10 text-center font-semibold py-2 bg-green-500  rounded ${
                 !checked || isSubmitting || isSubscriptionCancelled
                   ? 'cursor-not-allowed opacity-60'
                   : ' bg-green-500 dark:bg-green-250 hover:-translate-y-1 hover:scale-100 duration-300 hover:shadow-md hover:shadow-green-500'
               } `}
                  disabled={!checked || isSubmitting || isSubscriptionCancelled}
                  onClick={onSubmit}
                  type="button"
                >
                  Start
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between px-6 py-4">
              <div className="text-gray-600 dark:text-neargray-10 text-sm flex items-center">
                <input
                  checked={checked}
                  disabled={
                    campaignData?.data?.subscription?.status === 'canceled'
                  }
                  onChange={() => setChecked((curr) => !curr)}
                  type="checkbox"
                />
                <span className="text-sm text-gray-600 dark:text-neargray-10 ml-2">
                  Confirm that I want to stop this campaign.
                </span>
              </div>
              <div>
                <button
                  className={`text-sm text-[13px] px-10
               focus:outline-none text-white text-center font-semibold py-2 bg-green-500 rounded ${
                 !checked || isSubmitting || isSubscriptionCancelled
                   ? 'cursor-not-allowed opacity-60'
                   : 'bg-green-500 dark:bg-green-250 hover:-translate-y-1 hover:scale-100 duration-300 hover:shadow-md hover:shadow-green-500'
               } `}
                  disabled={!checked || isSubmitting || isSubscriptionCancelled}
                  onClick={onSubmit}
                  type="button"
                >
                  Stop
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
export default StartForm;
