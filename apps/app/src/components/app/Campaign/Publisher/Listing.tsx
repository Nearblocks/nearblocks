import { useState } from 'react';

import { DialogRoot, DialogTrigger } from '@/components/ui/dialog';
import useAuth from '@/hooks/app/useAuth';
import { Link } from '@/i18n/routing';
import { localFormat } from '@/utils/app/libs';
import { currentCampaign } from '@/utils/types';

import Edit from '@/components/app/Icons/Edit';
import Plan from '@/components/app/Icons/Plan';
import Skeleton from '@/components/app/skeleton/common/Skeleton';
import CampaignPagination from '@/components/app/Campaign/CampaignPagination';
import ConfirmModal from '@/components/app/Campaign/Publisher/ConfirmModal';
import Tooltip from '@/components/app/common/Tooltip';

const CampaignListing = () => {
  const [currentCampaign, setCurrentCampaign] =
    useState<currentCampaign | null>(null);
  const [url, setUrl] = useState(`publisher/campaigns?page=1`);
  const { data, loading, mutate } = useAuth(url);

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

  const onApprove = (item: currentCampaign) => {
    setCurrentCampaign(item);
  };

  return (
    <>
      <div className="bg-white dark:bg-black-600 py-2 dark:text-neargray-10 border dark:border-black-200 soft-shadow rounded-lg">
        <div className={`flex flex-col lg:flex-row pt-2`}>
          <div className="flex flex-col">
            <h1 className="leading-7 px-6 text-base text-nearblue-600 dark:text-neargray-10 mb-1">
              Campaign
            </h1>
            <div className="leading-7 px-6 text-sm mb-4 text-gray-600 dark:text-neargray-10">
              <p>
                Below are the campaigns. Click on &quot;Edit&quot; to view and
                modify the campaign.
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
                  plan
                </th>
                <th
                  className="px-5 py-4 text-left text-xs font-semibold text-gray-600 dark:text-neargray-10 uppercase tracking-wider"
                  scope="col"
                >
                  advertiser
                </th>
                <th
                  className="px-5 py-4 text-left text-xs font-semibold text-gray-600 dark:text-neargray-10 uppercase tracking-wider whitespace-nowrap"
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
                  status
                </th>
                <th
                  className="px-5 py-4 text-left text-xs font-semibold text-gray-600 dark:text-neargray-10 uppercase tracking-wider"
                  scope="col"
                >
                  action
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-black-600 divide-y divide-gray-200 dark:divide-black-200">
              {loading &&
                [...Array(3)].map((_, i) => (
                  <tr className="hover:bg-blue-900/5 h-[57px]" key={i}>
                    <td className="w-[1%] px-5 py-4 whitespace-nowrap text-sm text-gray-600">
                      <Skeleton className="h-4" />
                    </td>
                    <td className="w-[2%] px-5 py-4 whitespace-nowrap text-sm text-gray-600">
                      <Skeleton className="h-4 w-16" />
                    </td>
                    <td className="w-[0.2%] px-5 py-4 whitespace-nowrap text-sm text-gray-600">
                      <Skeleton className="h-4" />
                    </td>
                    <td className="w-[0.2%] px-5 py-4 whitespace-nowrap text-sm">
                      <Skeleton className="h-4" />
                    </td>
                    <td className="w-[0.2%] px-5 py-4 whitespace-nowrap text-sm text-gray-600">
                      <Skeleton className="h-4" />
                    </td>
                    <td className="w-[0.1%] px-5 py-4 whitespace-nowrap text-sm text-gray-600">
                      <Skeleton className="h-4" />
                    </td>
                    <td className="w-[2%] px-5 py-4 whitespace-nowrap text-sm text-gray-600">
                      <Skeleton className="h-4" />
                    </td>
                    <td className="w-[13.5%] px-5 py-4 whitespace-nowrap text-sm text-gray-600">
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
              {data?.data?.map((item: currentCampaign, index: any) => (
                <tr className="h-[57px] hover:bg-blue-900/5" key={index}>
                  <td className="px-5 py-4 whitespace-nowrap text-sm ">
                    <Tooltip
                      className={'left-1/2 mb-3 max-w-[200px] ml-2'}
                      position="top"
                      tooltip={
                        item?.title.charAt(0).toUpperCase() +
                        item?.title.slice(1)
                      }
                    >
                      <span className="text-xs inline-block truncate max-w-[80px]">
                        {' '}
                        {item?.title.charAt(0).toUpperCase() +
                          item?.title.slice(1)}
                      </span>
                    </Tooltip>
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap text-sm ">
                    <span className="text-xs">
                      {item?.subscription?.campaign_plan?.title &&
                        item?.subscription?.campaign_plan?.title
                          .charAt(0)
                          .toUpperCase() +
                          item?.subscription?.campaign_plan?.title.slice(1)}
                    </span>
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap text-sm ">
                    <Tooltip
                      className={'left-1/2 max-w-[200px]'}
                      position="top"
                      tooltip={item?.user?.email}
                    >
                      <span className="text-xs inline-block truncate max-w-[80px]">
                        {item?.user?.username}
                      </span>
                    </Tooltip>
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
                  <td className="px-5 py-4 whitespace-nowrap text-sm">
                    <span className="text-xs">
                      {item?.is_active ? 'ACTIVE' : 'NON-ACTIVE'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap flex gap-x-2 items-center text-xs text-gray-600 dark:text-neargray-10 align-top">
                    <div className="flex items-center border border-green-500 dark:border-green-250 rounded-md px-2 py-1 hover:bg-neargreen/5 dark:hover:bg-black-200">
                      <Link
                        className="flex items-center"
                        href={`/campaign/${item?.id}`}
                        passHref
                      >
                        <Edit className="text-green-500 dark:text-green-250" />{' '}
                        &nbsp;
                        <p className="ml-1 text-green-500 cursor-pointer dark:text-neargray-10">
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
                        <p className="ml-1 text-green-500 cursor-pointer dark:text-neargray-10">
                          Stats
                        </p>
                      </Link>
                    </div>
                    {item?.subscription?.status === 'canceled' ? (
                      <span className="bg-red-100 dark:bg-red-100/10 text-xs text-red-500 rounded-xl px-2 py-1 max-w-[120px] inline-flex truncate">
                        Cancelled
                      </span>
                    ) : (
                      item?.title != 'Placeholder Ad' &&
                      item?.title != 'Placeholder Text Ad' &&
                      (item?.is_approved == 1 ? (
                        <span className="bg-green-500 dark:bg-green-250 text-xs text-neargray-10 dark:text-neargray-10 rounded-xl px-2 py-1 max-w-[120px] inline-flex truncate">
                          Approved
                        </span>
                      ) : (
                        <DialogRoot placement={'center'} size="xs">
                          <DialogTrigger asChild>
                            <button
                              className="flex items-center border border-green-500 dark:border-green-250 rounded-md px-2 py-1 hover:bg-neargreen/5 dark:hover:bg-black-200"
                              onClick={() => onApprove(item)}
                            >
                              <p className="ml-1 text-green-500 dark:text-green-250 cursor-pointer">
                                Approve
                              </p>
                            </button>
                          </DialogTrigger>
                          <ConfirmModal
                            currentCampaign={currentCampaign}
                            mutate={mutate}
                          />
                        </DialogRoot>
                      ))
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
    </>
  );
};
export default CampaignListing;
