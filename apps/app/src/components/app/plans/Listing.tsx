'use client';
import useAuth from '@/hooks/app/useAuth';
import { dollarFormat } from '@/utils/app/libs';

import Plan from '../Icons/Plan';
import UserLayout from '../Layouts/UserLayout';
import Skeleton from '../skeleton/common/Skeleton';
import withAuth from '../stores/withAuth';

type Item = {
  id: number | string;
  price_annually: number;
  price_monthly: number;
  title: string;
};

const PlanListing = ({ userRole }: { userRole?: string }) => {
  const { data, loading } = useAuth('/campaign/plans');

  return (
    <>
      <UserLayout role={userRole} title="Campaign Plans">
        <div className="my-campaigns">
          <div className="">
            <div className="block lg:flex lg:space-x-2">
              <div className="w-full">
                <div className="bg-white dark:bg-black-600 dark:text-neargray-10 border dark:border-black-200 soft-shadow rounded-lg pb-1">
                  <div className={`flex flex-col lg:flex-row pt-4`}>
                    <div className="flex flex-col">
                      <h1 className="leading-7 px-6 text-base text-black dark:text-neargray-10">
                        Campaign Plans
                      </h1>
                      <p className="leading-7 px-6 text-sm mb-4 text-gray-600 dark:text-neargray-10">
                        Below are your campaign plans.
                      </p>
                    </div>
                  </div>
                  <div className="overflow-x-auto ">
                    <table className="min-w-full divide-y dark:divide-black-200  border-t dark:border-black-200 text-black">
                      <thead className="bg-gray-100 dark:bg-black-300 dark:text-neargray-10">
                        <tr>
                          <th
                            className="px-5 py-4 text-left text-xs font-semibold text-gray-600 dark:text-neargray-10 uppercase tracking-wider"
                            scope="col"
                          >
                            title
                          </th>
                          <th
                            className="px-5 py-4 text-left text-xs font-semibold text-gray-600 dark:text-neargray-10 uppercase tracking-wider whitespace-nowrap"
                            scope="col"
                          >
                            price(monthly)
                          </th>
                          <th
                            className="px-5 py-4 text-left text-xs font-semibold text-gray-600 dark:text-neargray-10 uppercase tracking-wider whitespace-nowrap"
                            scope="col"
                          >
                            price(annually)
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-black-600 divide-y divide-gray-200 dark:divide-black-200">
                        {loading &&
                          [...Array(5)].map((_, i) => (
                            <tr
                              className="hover:bg-blue-900/5 h-[57px]"
                              key={i}
                            >
                              <td className="pl-5 pr-2 py-4 whitespace-nowrap text-sm text-gray-600 ">
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
                            <td className="text-gray-600 text-xs" colSpan={100}>
                              <div className="w-full bg-white dark:bg-black-600 h-fit">
                                <div className="text-center py-28">
                                  <div className="mb-4 flex justify-center">
                                    <span className="inline-block border border-yellow-600 border-opacity-25 bg-opacity-10 bg-yellow-300 text-yellow-500 rounded-full p-4">
                                      <Plan />
                                    </span>
                                  </div>
                                  <h3 className="h-5 font-bold text-lg text-black dark:text-neargray-10">
                                    Plans Empty
                                  </h3>
                                  <p className="mb-0 py-4 font-bold text-sm text-gray-500 dark:text-neargray-10">
                                    No Plans Found
                                  </p>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                        {data?.data?.map((item: Item, index: number) => (
                          <tr
                            className="h-[57px] dark:text-neargray-10 hover:bg-blue-900/5"
                            key={index}
                          >
                            <td className="px-5 py-4 whitespace-nowrap text-sm">
                              <span className="text-xs">{item?.title}</span>
                            </td>
                            <td className="px-5 py-4 whitespace-nowrap text-sm ">
                              <span className="text-xs">
                                ${dollarFormat(item?.price_monthly / 100)}
                              </span>
                            </td>
                            <td className="px-5 py-4 whitespace-nowrap text-sm ">
                              <span className="text-xs">
                                ${dollarFormat(item?.price_annually / 100)}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </UserLayout>
    </>
  );
};

export default withAuth(PlanListing);
