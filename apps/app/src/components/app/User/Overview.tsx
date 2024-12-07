'use client';
import { get } from 'lodash';
import React from 'react';

import Avatar from '@/components/app/Icons/Avatar';
import Edit from '@/components/app/Icons/Edit';
import EmailCircle from '@/components/app/Icons/EmailCircle';
import LoginCircle from '@/components/app/Icons/LoginCircle';
import UserLayout from '@/components/app/Layouts/UserLayout';
import useAuth from '@/hooks/app/useAuth';
import { Link } from '@/i18n/routing';
import dayjs from '@/utils/app/dayjs';

import Clock from '../Icons/Clock';
import Skeleton from '../skeleton/common/Skeleton';
import withAuth from '../stores/withAuth';

const Overview = ({ role }: { role?: string }) => {
  const { data, loading } = useAuth('/profile');
  const user = get(data, 'data') || null;

  return (
    <UserLayout role={role} title="Account Overview">
      <div className="w-full bg-white dark:bg-black-600 rounded-xl soft-shadow h-fit">
        <div className="border-b px-5 py-5 dark:border-black-200">
          <p className="text-black dark:text-neargray-100">
            Personal Information
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-600 dark:text-neargray-100 mt-2 px-6 py-4">
            Below are the username, emali address and overview information of
            your account
          </p>
          <div className="grid grid-cols-3 gap-1 items-center px-6 py-4  border-b dark:border-black-200">
            <p className="text-gray-600 dark:text-neargray-100 text-sm flex items-center">
              <Avatar /> <span className="ml-2">Username</span>
            </p>
            {loading ? (
              <div className="w-full md:w-1/5">
                <Skeleton className="flex w-20 h-4" />
              </div>
            ) : (
              <p className="text-sm text-black dark:text-neargray-100 font-bold">
                {user?.username}
              </p>
            )}
          </div>
        </div>
        <div className="grid grid-cols-3 gap-1 items-center px-6 py-4  border-b dark:border-black-200">
          <p className="text-gray-600 dark:text-neargray-100 text-sm flex items-center">
            <EmailCircle /> <span className="ml-2">Email Address</span>
          </p>
          {loading ? (
            <div className="w-full md:w-1/5">
              <Skeleton className="flex w-26 h-4" />
            </div>
          ) : (
            <>
              <p className="text-sm text-black dark:text-neargray-100 font-bold">
                {user?.email}
              </p>
              <div className=" flex justify-end">
                <Link href={`/user/settings`} legacyBehavior>
                  <div className="w-1/3 flex justify-center	items-center text-center border-2 text-md pl-4 pr-6 py-1 rounded focus:outline-none font-semibold hover:bg-green-400 bg-green-500 text-white border-green cursor-pointer">
                    <Edit className="h-3 w-3 " />
                    <span className="text-[13px] font-semibold ml-2">Edit</span>
                  </div>
                </Link>
              </div>
            </>
          )}
        </div>
        <div className="grid grid-cols-3 gap-1 items-center px-6 py-4 border-b dark:border-black-200">
          <p className="text-gray-600 dark:text-neargray-100 text-sm flex items-center">
            <LoginCircle /> <span className="ml-2">Last Login</span>
          </p>
          {loading ? (
            <div className="w-full md:w-1/5">
              <Skeleton className="flex w-20 h-4" />
            </div>
          ) : (
            <p className="text-sm text-black dark:text-neargray-100 flex col-span-2">
              <Clock className="my-auto mr-1" />
              {dayjs(user?.last_login_at).format('YYYY-MM-DD  HH:mm:ss')}
            </p>
          )}
        </div>
      </div>
    </UserLayout>
  );
};

export default withAuth(Overview);
