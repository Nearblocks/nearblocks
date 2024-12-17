'use client';
import dayjs from 'dayjs';
import { get } from 'lodash';
import React from 'react';
import { useState } from 'react';
import { toast } from 'react-toastify';

import ApiUsageStats from '@/components/app/ApiUsage/Stats';
import AddKeys from '@/components/app/Dashboard/Addkeys';
import DeleteKey from '@/components/app/Dashboard/DeleteKey';
import CopyIcon from '@/components/app/Icons/CopyIcon';
import Delete from '@/components/app/Icons/Delete';
import Edit from '@/components/app/Icons/Edit';
import Plan from '@/components/app/Icons/Plan';
import UserLayout from '@/components/app/Layouts/UserLayout';
import Skeleton from '@/components/app/skeleton/common/Skeleton';
import { DialogRoot, DialogTrigger } from '@/components/ui/dialog';
import useAuth from '@/hooks/app/useAuth';
import { Link } from '@/i18n/routing';

import Tooltip from '../common/Tooltip';
import withAuth from '../stores/withAuth';

interface ApiKey {
  created_at: string;
  id: string;
  name: string;
  token: string;
  usage: string;
}

const Keys = ({ role }: { role?: string }) => {
  const [selected, setSelected] = useState<any>();

  const { data, loading, mutate } = useAuth('/keys');

  const keys = get(data, 'keys') || null;

  const onToggleEdit = (id: string) => {
    setSelected(id);
  };

  const onToggleAdd = () => {
    setSelected(undefined);
  };

  const onToggleDelete = (key?: ApiKey) => {
    setSelected(key);
  };

  const onCopy = async (key: ApiKey) => {
    await navigator.clipboard.writeText(key?.token);
    if (!toast.isActive('copy-key')) {
      toast.success('Copied!', {
        toastId: 'copy-key',
      });
    }
  };
  return (
    <>
      <UserLayout role={role} title="API Keys">
        <ApiUsageStats />
        <div className="w-full bg-white dark:bg-black-600 dark:text-neargray-10 rounded-xl soft-shadow h-fit mb-4 mt-8">
          <div className="px-5 py-5">
            <p className="text-black dark:text-neargray-10">API Keys</p>
            <p className="text-sm text-gray-600 dark:text-neargray-10 mt-2">
              For developers interested in building applications using our API
              Service, please create an API-Key Token usable for all API
              requests.
            </p>
          </div>
          <div className="flex border-b dark:border-black-200">
            <div className="overflow-x-auto w-full">
              <table className="w-full divide-y border-t dark:border-black-200 dark:divide-black-200">
                <thead className="bg-gray-100 dark:bg-black-300 dark:text-neargray-10">
                  <tr>
                    <th
                      className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-neargray-10 whitespace-nowrap uppercase tracking-wider"
                      scope="col"
                    >
                      APP NAME
                    </th>
                    <th
                      className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-neargray-10 whitespace-nowrap uppercase tracking-wider"
                      scope="col"
                    >
                      API KEY TOKEN
                    </th>
                    <th
                      className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-neargray-10 whitespace-nowrap uppercase tracking-wider"
                      scope="col"
                    >
                      Usage (Monthly)
                    </th>
                    <th
                      className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-neargray-10 uppercase tracking-wider"
                      scope="col"
                    >
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-black-600 divide-y divide-gray-200 dark:divide-black-200">
                  {loading &&
                    [...Array(5)].map((_, i) => (
                      <tr className="hover:bg-blue-900/5 h-[53px]" key={i}>
                        <td className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-neargray-10 uppercase tracking-wider">
                          <Skeleton className="h-4" />
                        </td>
                        <td className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-neargray-10 uppercase tracking-wider">
                          <Skeleton className="h-4 " />
                          <Skeleton className="h-4 w-40 mt-2" />
                        </td>
                        <td className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-neargray-10 uppercase tracking-wider">
                          <Skeleton className="h-4" />
                        </td>
                        <td className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-neargray-10 uppercase tracking-wider">
                          <Skeleton className="h-4" />
                        </td>
                      </tr>
                    ))}
                  {!loading && (!keys || keys?.length === 0) && (
                    <tr className="h-[53px]">
                      <td className="text-gray-600 text-xs" colSpan={100}>
                        <div className="w-full bg-white dark:bg-black-600 h-fit">
                          <div className="text-center py-28">
                            <div className="mb-4 flex justify-center">
                              <span className="inline-block border border-yellow-600 border-opacity-25 bg-opacity-10 bg-yellow-300 text-yellow-500 rounded-full p-4">
                                <Plan />
                              </span>
                            </div>
                            <h3 className="h-5 font-bold text-lg text-black dark:text-neargray-10">
                              API Keys Empty
                            </h3>
                            <p className="mb-0 py-4 font-bold text-sm text-gray-500 dark:text-neargray-10">
                              No API Key Found
                            </p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}

                  {keys?.map((key: ApiKey) => (
                    <tr className="hover:bg-blue-900/5" key={key.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-black dark:text-neargray-10 align-top max-w-52 text-ellipsis">
                        <Tooltip
                          className={'left-1/2 max-w-[200px]'}
                          position="top"
                          tooltip={key?.name}
                        >
                          <span className="overflow-hidden">{key?.name}</span>
                        </Tooltip>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-green-500 dark:text-green-250 align-top">
                        <div className="flex">
                          <p className="mr-2">{key?.token}</p>
                          <button
                            className="bg-green-500 dark:bg-black-200 bg-opacity-10 hover:bg-opacity-100 group rounded-full  p-1 w-5 h-5"
                            onClick={() => onCopy(key)}
                            type="button"
                          >
                            <CopyIcon className="fill-current -z-50 text-green-500 dark:text-green-250 group-hover:text-white h-3 w-3" />
                          </button>
                        </div>
                        <p className="text-[10px] text-gray-600 dark:text-neargray-100">
                          Added on {dayjs(key.created_at).format('YYYY-MM-DD')}
                        </p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-black dark:text-neargray-10 align-top">
                        {key.usage}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap flex  items-center text-xs text-gray-600 dark:text-neargray-10 align-top">
                        <DialogRoot placement={'center'} size="xs">
                          <DialogTrigger asChild>
                            <button
                              className="flex items-center border border-green-500 dark:border-green-250 rounded-md px-2 py-1 hover:bg-neargreen/5 dark:hover:bg-black-200"
                              onClick={() => onToggleEdit(key.id)}
                            >
                              <Edit className="text- dark:text-neargray-10" />{' '}
                              <p className="ml-1 text-green-500 dark:text-green-250 cursor-pointer">
                                Edit
                              </p>
                            </button>
                          </DialogTrigger>
                          <AddKeys mutate={mutate} selected={selected} />
                        </DialogRoot>
                        <div className="flex items-center border border-green-500 dark:border-green-250 rounded-md px-2 py-1 hover:bg-neargreen/5 dark:hover:bg-black-200 ml-3">
                          <Link
                            className="flex items-center"
                            href={`/user/apiusage?id=${key?.id}`}
                            passHref
                          >
                            <p className="ml-1 text-green-500 dark:text-green-250 cursor-pointer">
                              Stats
                            </p>
                          </Link>
                        </div>
                        <DialogRoot placement={'center'} size="xs">
                          <DialogTrigger asChild>
                            <button
                              className="border border-green-500 dark:border-green-250 ml-3 rounded-md  cursor-pointer hover:bg-red-100 dark:hover:bg-black-200 "
                              onClick={() => onToggleDelete(key)}
                            >
                              <Delete className="text-red-600 dark:text-red-400 w-3 h-3 m-1.5" />
                            </button>
                          </DialogTrigger>
                          <DeleteKey mutate={mutate} selected={selected} />
                        </DialogRoot>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="flex items-center justify-end px-6 py-4">
            <DialogRoot placement={'center'} size="xs">
              <DialogTrigger asChild>
                <button
                  className="text-[13px] text-white font-semibold px-6 py-2 bg-green-500 dark:bg-green-250 hover:-translate-y-1 hover:scale-100 duration-300 hover:shadow-md hover:shadow-green-500 rounded"
                  onClick={onToggleAdd}
                >
                  Add key
                </button>
              </DialogTrigger>
              <AddKeys mutate={mutate} selected={selected} />
            </DialogRoot>
          </div>
        </div>
      </UserLayout>
    </>
  );
};

export default withAuth(Keys);
