import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import ConfirmModal from './ConfirmModal';
import { useRouter } from 'next/router';
import useAuth, { request } from '@/hooks/useAuth';
import Edit from '@/components/Icons/Edit';
import Plan from '@/components/Icons/Plan';
import { localFormat } from '@/utils/libs';
import { currentCampaign } from '@/utils/types';
import CampaignPagination from '@/components/CampaignPagination';
import Skeleton from '@/components/skeleton/common/Skeleton';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

type Props = {
  statsMutate: () => void;
};

const Listing = ({ statsMutate }: Props) => {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [currentCampaign, setCurrentCampaign] =
    useState<currentCampaign | null>(null);
  const [buttonLoading, setButtonLoading] = useState(false);
  const [url, setUrl] = useState(`advertiser/campaigns?page=1`);
  const router = useRouter();

  const { data, loading, mutate } = useAuth(url);

  const { status } = router.query;

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
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      timeZone,
    });

    return formattedDate;
  };

  const onCancel = (item: currentCampaign) => {
    setConfirmOpen(true);
    setCurrentCampaign(item);
  };

  const handleCampaignCancellation = async () => {
    await request.post(`advertiser/campaign/${currentCampaign?.id}/cancel`);
    await sleep(1000);
    mutate();
    statsMutate();
  };

  return (
    <>
      <div className="block lg:flex lg:space-x-2 rounded-xl mb-4">
        <div className="w-full rounded-xl">
          <div className="bg-white py-2 dark:bg-black-600 dark:text-neargray-10 border dark:border-black-200 soft-shadow rounded-xl">
            <div className={`flex flex-col lg:flex-row pt-2`}>
              <div className="flex flex-col">
                <h1 className="leading-7 px-6 text-base text-black dark:text-neargray-10 mb-1">
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
              <table className="min-w-full divide-y dark:divide-black-200 border-t dark:border-black-200 text-black">
                <thead className="bg-gray-100 dark:bg-black-300">
                  <tr>
                    <th
                      scope="col"
                      className="px-5 py-4 text-left text-xs font-semibold text-gray-600 dark:text-neargray-10 uppercase tracking-wider"
                    >
                      placement
                    </th>
                    <th
                      scope="col"
                      className="px-5 py-4 text-left text-xs font-semibold text-gray-600 dark:text-neargray-10 uppercase tracking-wider"
                    >
                      status
                    </th>
                    <th
                      scope="col"
                      className="px-5 py-4 text-left text-xs font-semibold text-gray-600 dark:text-neargray-10 uppercase tracking-wider"
                    >
                      impressions
                    </th>
                    <th
                      scope="col"
                      className="px-5 py-4 text-left text-xs font-semibold text-gray-600 dark:text-neargray-10 uppercase tracking-wider"
                    >
                      clicks
                    </th>
                    <th
                      scope="col"
                      className="px-5 py-4 text-left text-xs font-semibold text-gray-600 dark:text-neargray-10 uppercase tracking-wider whitespace-nowrap"
                    >
                      start date
                    </th>
                    <th
                      scope="col"
                      className="px-5 py-4 text-left text-xs font-semibold text-gray-600 dark:text-neargray-10 uppercase tracking-wider"
                    >
                      actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y dark:bg-black-600 divide-gray-200 dark:divide-black-200">
                  {loading &&
                    [...Array(4)].map((_, i) => (
                      <tr key={i} className="hover:bg-blue-900/5 h-[57px]">
                        <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-600">
                          <Skeleton className="h-4" />
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-600">
                          <Skeleton className="h-4" />
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-600">
                          <Skeleton className="h-4" />
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap text-sm">
                          <Skeleton className="h-4" />
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-600">
                          <Skeleton className="h-4" />
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-600">
                          <Skeleton className="h-4" />
                        </td>
                      </tr>
                    ))}
                  {!loading && (!data || data?.data?.length === 0) && (
                    <tr className="h-[57px]">
                      <td
                        colSpan={100}
                        className="text-gray-600 dark:text-neargray-10 text-xs"
                      >
                        <div className="w-full bg-white dark:bg-black-600 h-fit">
                          <div className="text-center py-28">
                            <div className="mb-4 flex justify-center">
                              <span className="inline-block border border-yellow-600 border-opacity-25 bg-opacity-10 bg-yellow-300 text-yellow-500 rounded-full p-4">
                                <Plan />
                              </span>
                            </div>
                            <h3 className="h-5 font-bold text-lg text-black dark:text-neargray-10">
                              Campaigns Empty
                            </h3>
                            <p className="mb-0 py-4 font-bold text-sm text-gray-500 dark:text-neargray-10">
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
                            passHref
                            className="flex items-center"
                            href={{
                              pathname: '/campaign/[id]',
                              query: { id: item?.id },
                            }}
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
                            passHref
                            className="flex items-center"
                            href={{
                              pathname: '/campaign/chart',
                              query: { id: item?.id },
                            }}
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
                          <div
                            onClick={() => onCancel(item)}
                            className="flex items-center border border-green-500 dark:border-green-250 rounded-md px-2 py-1 hover:bg-neargreen/5 dark:hover:bg-black-200"
                          >
                            <p className="ml-1 text-green-500 dark:text-green-250 cursor-pointer">
                              Cancel Campaign
                            </p>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {data && data?.data?.length > 0 && (
              <CampaignPagination
                nextPageUrl={data?.links?.next}
                prevPageUrl={data?.links?.prev}
                firstPageUrl={data?.links?.first}
                currentPage={data?.meta?.current_page}
                setUrl={setUrl}
                mutate={mutate}
              />
            )}
          </div>
        </div>
      </div>
      {confirmOpen && (
        <ConfirmModal
          setConfirmOpen={setConfirmOpen}
          currentCampaign={currentCampaign}
          mutate={mutate}
          handleCampaignCancellation={handleCampaignCancellation}
          buttonLoading={buttonLoading}
          setButtonLoading={setButtonLoading}
        />
      )}
    </>
  );
};
export default Listing;
