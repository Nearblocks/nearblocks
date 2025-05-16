import { useSearchParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';

import { DialogRoot, DialogTrigger } from '@/components/ui/dialog';
import useAuth, { request } from '@/hooks/app/useAuth';
import { Link } from '@/i18n/routing';
import { localFormat } from '@/utils/app/libs';
import { currentCampaign } from '@/utils/types';

import Edit from '@/components/app/Icons/Edit';
import Plan from '@/components/app/Icons/Plan';
import Skeleton from '@/components/app/skeleton/common/Skeleton';
import CampaignPagination from '@/components/app/Campaign/CampaignPagination';
import ConfirmModal from '@/components/app/Campaign/Advertiser/ConfirmModal';
import { useConfig } from '@/hooks/app/useConfig';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const Listing = ({ mutate: statsMutate }: { mutate: () => void }) => {
  const [currentCampaign, setCurrentCampaign] =
    useState<currentCampaign | null>(null);
  const [buttonLoading, setButtonLoading] = useState(false);
  const [url, setUrl] = useState(`advertiser/campaigns?page=1`);
  const { data, loading, mutate } = useAuth(url);
  const searchParams = useSearchParams();
  const { userApiURL: baseURL } = useConfig();
  const status = searchParams?.get('status');

  useEffect(() => {
    if (status) {
      mutate();
    }
  }, [status, mutate]);

  const formatStartDate = (startDate: string) => {
    if (!startDate) return 'XX/XX/XXXX';

    const date = new Date(startDate);
    const timeZone = 'UTC'; // Set your desired time zone here
    const formattedDate = date.toLocaleDateString('en-US', {
      day: '2-digit',
      month: '2-digit',
      timeZone,
      year: 'numeric',
    });

    return formattedDate;
  };

  const onCancel = (item: currentCampaign) => {
    setCurrentCampaign(item);
  };

  const handleCampaignCancellation = async () => {
    await request(baseURL).post(
      `advertiser/campaigns/${currentCampaign?.id}/cancel`,
    );
    await sleep(1000);
    mutate();
  };

  return (
    <>
      <div className="block lg:flex lg:space-x-2 rounded-xl mb-4">
        <div className="w-full rounded-xl">
          <div className="bg-white py-2 dark:bg-black-600 dark:text-neargray-10 border dark:border-black-200 soft-shadow rounded-xl">
            <div className={`flex flex-col lg:flex-row pt-2`}>
              <div className="flex flex-col">
                <h1 className="leading-7 px-6 text-base text-nearblue-600 dark:text-neargray-10 mb-1">
                  My Campaigns
                </h1>
                <div className="leading-7 px-6 text-sm mb-4 text-gray-600 dark:text-neargray-10">
                  <p>
                    Below are your campaigns. Click on &quot;Edit&quot; to view
                    and modify the campaign.
                  </p>
                </div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y dark:divide-black-200 border-t dark:border-black-200 text-nearblue-600 dark:text-neargray-10">
                <thead className="bg-gray-100 dark:bg-black-300">
                  <tr>
                    <th
                      className="px-5 py-4 text-left text-xs font-semibold text-gray-600 dark:text-neargray-10 uppercase tracking-wider"
                      scope="col"
                    >
                      placement
                    </th>
                    <th
                      className="px-5 py-4 text-left text-xs font-semibold text-gray-600 dark:text-neargray-10 uppercase tracking-wider"
                      scope="col"
                    >
                      status
                    </th>
                    <th
                      className="px-5 py-4 text-left text-xs font-semibold text-gray-600 dark:text-neargray-10 uppercase tracking-wider"
                      scope="col"
                    >
                      impressions
                    </th>
                    <th
                      className="px-5 py-4 text-left text-xs font-semibold text-gray-600 dark:text-neargray-10 uppercase tracking-wider"
                      scope="col"
                    >
                      clicks
                    </th>
                    <th
                      className="px-5 py-4 text-left text-xs font-semibold text-gray-600 dark:text-neargray-10 uppercase tracking-wider whitespace-nowrap"
                      scope="col"
                    >
                      start date
                    </th>
                    <th
                      className="px-5 py-4 text-left text-xs font-semibold text-gray-600 dark:text-neargray-10 uppercase tracking-wider"
                      scope="col"
                    >
                      actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y dark:bg-black-600 divide-gray-200 dark:divide-black-200">
                  {loading &&
                    [...Array(2)].map((_, i) => (
                      <tr
                        className="hover:bg-blue-900/5 h-[57px] w-full"
                        key={i}
                      >
                        <td className="w-[3.6%] px-5 py-4 whitespace-nowrap text-sm text-gray-600">
                          <Skeleton className="h-4" />
                        </td>
                        <td className="w-[6.5%] px-5 py-4 whitespace-nowrap text-sm text-gray-600">
                          <Skeleton className="h-4" />
                        </td>
                        <td className="w-[4%] px-5 py-4 whitespace-nowrap text-sm text-gray-600">
                          <Skeleton className="h-4" />
                        </td>
                        <td className="w-[3%] px-5 py-4 whitespace-nowrap text-sm">
                          <Skeleton className="h-4" />
                        </td>
                        <td className="w-[4%] px-5 py-4 whitespace-nowrap text-sm text-gray-600">
                          <Skeleton className="h-4" />
                        </td>
                        <td className="w-[20%] px-5 py-4 whitespace-nowrap text-sm text-gray-600">
                          <Skeleton className="h-4" />
                        </td>
                      </tr>
                    ))}
                  {!loading && (!data || data?.data?.length === 0) && (
                    <tr className="h-[57px]">
                      <td
                        className="text-gray-600 dark:text-neargray-10 text-xs"
                        colSpan={100}
                      >
                        <div className="w-full bg-white dark:bg-black-600 h-fit">
                          <div className="text-center py-28">
                            <div className="mb-4 flex justify-center">
                              <span className="inline-block border border-yellow-600 border-opacity-25 bg-opacity-10 bg-yellow-300 text-yellow-500 rounded-full p-4">
                                <Plan />
                              </span>
                            </div>
                            <h3 className="h-5 font-semibold text-lg text-nearblue-600 dark:text-neargray-10">
                              Campaigns Empty
                            </h3>
                            <p className="mb-0 py-4 font-semibold text-sm text-gray-500 dark:text-neargray-10">
                              No Campaign Found
                            </p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                  {data?.data?.map((item: currentCampaign, index: number) => (
                    <tr
                      className="h-[57px] dark:text-neargray-10 dark:bg-black-600 hover:bg-blue-900/5"
                      key={index}
                    >
                      <td className="px-5 py-4 whitespace-nowrap text-sm">
                        <span className="text-xs">
                          {item?.title.charAt(0).toUpperCase() +
                            item?.title.slice(1)}
                        </span>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap text-sm ">
                        <span className="text-xs uppercase">
                          {item?.is_active == 1 ? 'active' : 'non-active'}
                        </span>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap text-sm ">
                        <span className="text-xs">
                          {localFormat((item?.impression_count).toString())}
                        </span>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap text-sm ">
                        <span className="text-xs">
                          {localFormat((item?.click_count).toString())}
                        </span>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap text-sm">
                        <span className="text-xs">
                          {formatStartDate(item?.start_date)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap flex gap-x-2 items-center text-xs text-gray-600 dark:text-neargray-10 align-top">
                        <div className="flex items-center border border-green-500 dark:border-green-250 rounded-md px-2 py-1 hover:bg-neargreen/5 dark:hover:bg-black-200">
                          <Link
                            className="flex items-center"
                            href={`/campaign/${item?.id}`}
                            passHref
                          >
                            <Edit className=" text-green-500 dark:text-green-250 " />{' '}
                            &nbsp;
                            <p className="ml-1 text-green-500 dark:text-green-250 cursor-pointer">
                              Edit
                            </p>
                          </Link>
                        </div>
                        <div className="flex items-center border border-green-500 dark:border-green-250 rounded-md px-2 py-1 hover:bg-neargreen/5 dark:hover:bg-black-200">
                          <Link
                            className="flex items-center"
                            href={`/campaign/chart?id=${item?.id}`}
                            passHref
                          >
                            <p className="ml-1  text-green-500 dark:text-green-250 cursor-pointer">
                              Stats
                            </p>
                          </Link>
                        </div>
                        <></>
                        {item?.subscription?.status === 'canceled' ? (
                          <span className="bg-red-100 dark:bg-red-100/10 text-xs text-red-500 rounded-xl px-2 py-1 max-w-[120px] inline-flex truncate">
                            Cancelled
                          </span>
                        ) : (
                          <DialogRoot placement={'center'} size="xs">
                            <DialogTrigger asChild>
                              <button
                                className="flex items-center border border-green-500 dark:border-green-250 rounded-md px-2 py-1 hover:bg-neargreen/5 dark:hover:bg-black-200"
                                onClick={() => onCancel(item)}
                              >
                                <p className="ml-1 text-green-500 dark:text-green-250 cursor-pointer">
                                  Cancel Campaign
                                </p>
                              </button>
                            </DialogTrigger>
                            <ConfirmModal
                              buttonLoading={buttonLoading}
                              handleCampaignCancellation={
                                handleCampaignCancellation
                              }
                              mutate={mutate}
                              statsMutate={statsMutate}
                              setButtonLoading={setButtonLoading}
                            />
                          </DialogRoot>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <CampaignPagination
              currentPage={data?.meta?.current_page}
              firstPageUrl={data?.links?.first}
              mutate={mutate}
              nextPageUrl={data?.links?.next}
              prevPageUrl={data?.links?.prev}
              setUrl={setUrl}
              isLoading={loading}
            />
          </div>
        </div>
      </div>
    </>
  );
};
export default Listing;
