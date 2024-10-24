import { env } from 'next-runtime-env';
import Head from 'next/head';
import { useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import dayjs from 'dayjs';
import FaRegTimesCircle from '@/components/Icons/FaRegTimesCircle';
import FaCheckCircle from '@/components/Icons/FaCheckCircle';
import useAuth, { request } from '@/hooks/useAuth';
import withAuth from '@/stores/withAuth';
import { localFormat } from '@/utils/libs';
import Layout from '@/components/Layouts';
import CircleTimer from '@/components/Icons/CircleTimer';
import Avatar from '@/components/Icons/Avatar';
import Refresh from '@/components/Icons/Refresh';
import UserLayout from '@/components/Layouts/UserLayout';
import Meta from '@/components/Layouts/Meta';
import Arrow from '@/components/Icons/Arrow';
import fetcher from '@/utils/fetcher';
import { InferGetServerSidePropsType, GetServerSideProps } from 'next';
import Skeleton from '@/components/skeleton/common/Skeleton';

export const getServerSideProps: GetServerSideProps<{
  statsDetails: any;
  latestBlocks: any;
}> = async () => {
  try {
    const [statsResult, latestBlocksResult] = await Promise.allSettled([
      fetcher(`stats`),
      fetcher(`blocks/latest?limit=1`),
    ]);

    const statsDetails =
      statsResult.status === 'fulfilled' ? statsResult.value : null;
    const latestBlocks =
      latestBlocksResult.status === 'fulfilled'
        ? latestBlocksResult.value
        : null;

    return {
      props: {
        statsDetails,
        latestBlocks,
      },
    };
  } catch (error) {
    console.error('Error fetching charts:', error);
    return {
      props: {
        statsDetails: null,
        latestBlocks: null,
      },
    };
  }
};

const CurrentPlan = ({
  statsDetails,
  latestBlocks,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const router = useRouter();
  const ogUrl = env('NEXT_PUBLIC_OG_URL');
  const siteUrl = env('NEXT_PUBLIC_SITE_URL');
  const [loadingBilling, setLoadingBilling] = useState(false);

  const dynamicTitle =
    'Near' + '%20Protocol%20API%20&%20Documentation%20|%20' + 'Nearblocks';
  const thumbnail = `${ogUrl}/thumbnail/basic?brand=near&title=${dynamicTitle}`;

  const metaTitle = 'Near' + ' API | ' + 'Nearblocks';

  const metaDescription =
    'Nearblocks' +
    ' APIs derives data from ' +
    'Nearblocks' +
    ' ' +
    'Near' +
    ' Protocol (' +
    'Near' +
    ') Block Explorer to cater for ' +
    'Near' +
    ' Protocol applications through API Endpoints.';

  const { data, error, loading } = useAuth('/profile');

  const rateLimit = useMemo(() => {
    const usage = data?.['rate-limit'];
    const limit = usage?.limit ? usage?.limit : 0;
    const consumed = usage?.consumed ? usage?.consumed : 0;
    const percentage =
      +limit === 0 || +consumed === 0 ? 0 : (consumed / limit) * 100;

    return { limit, consumed, percentage };
  }, [data]);

  const { status } = router.query;

  const handleManageBilling = async () => {
    setLoadingBilling(true);

    try {
      const res = await request.post(
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
    <Layout latestBlocks={latestBlocks} statsDetails={statsDetails}>
      <Head>
        <title>{metaTitle}</title>
        <Meta
          title={metaTitle}
          description={metaDescription}
          thumbnail={thumbnail}
        />
        <link rel="canonical" href={`${siteUrl}/user/plan`} />
      </Head>
      <UserLayout title="Current Plan">
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
            <p className="text-black dark:text-neargray-10">
              Current API Plans
            </p>
          </div>
          <div className="gap-1 items-center">
            <p className="text-sm text-gray-600 dark:text-neargray-10 px-6 py-4 ">
              All API plan accounts are Free by default. You may upgrade your
              plan at any time.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-1 items-center px-6 py-4  border-b dark:border-black-200">
              <p className="text-gray-600 dark:text-neargray-10 text-xs flex items-center mb-2">
                <Avatar className="text-gray-600 dark:text-neargray-100" />{' '}
                <span className="ml-2">My API plan</span>
              </p>
              {loading || error ? (
                <div className="w-full md:w-1/5">
                  <Skeleton className="flex w-20 h-4" />
                </div>
              ) : (
                <p className="text-sm text-black dark:text-neargray-10 font-medium">
                  {data?.currentPlan?.title} API Plan
                </p>
              )}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-1 items-center px-6 py-4  border-b dark:border-black-200">
            <p className="text-gray-600 dark:text-neargray-10 text-xs flex items-center mb-2">
              <CircleTimer className="text-gray-600 dark:text-neargray-100" />{' '}
              <span className="ml-2">API calls per minute</span>
            </p>
            {loading || error ? (
              <div className="w-full  md:w-1/5">
                <Skeleton className="flex w-20 h-4" />
              </div>
            ) : (
              <p className="text-sm text-black dark:text-neargray-10 font-medium">
                {localFormat(data?.currentPlan?.limit_per_minute)} Calls
              </p>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-1 items-center px-6 py-4">
            <p className="text-gray-600 dark:text-neargray-10 text-xs flex items-center mb-2">
              <Refresh className="text-gray-600 dark:text-neargray-100" />{' '}
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
                    <p className="text-xs text-black dark:text-neargray-10">
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
              disabled={loadingBilling}
              type="button"
              onClick={handleManageBilling}
              className={`text-[13px] text-white font-semibold px-6 py-2 bg-green-500 dark:bg-green-250 hover:-translate-y-1 hover:scale-100 duration-300 hover:shadow-md hover:shadow-green-500 rounded ${
                loadingBilling && 'cursor-not-allowed opacity-60'
              } `}
            >
              <span className="flex px-1">
                Manage Billing
                <span>
                  <Arrow className="-rotate-45 -mt-1 h-4 w-4 fill-white" />
                </span>
              </span>
            </button>
            <a
              href={'/apis'}
              className="ml-4 text-[13px] text-white font-semibold px-6 py-2 bg-green-500 dark:bg-green-250 hover:-translate-y-1 hover:scale-100 duration-300 hover:shadow-md hover:shadow-green-500 rounded"
            >
              Upgrade / Downgrade
            </a>
          </div>
        </div>
      </UserLayout>
    </Layout>
  );
};

export default withAuth(CurrentPlan);
