'use client';

import React from 'react';

import ErrorMessage from '@/components/app/common/ErrorMessage';
import FileSlash from '@/components/app/Icons/FileSlash';

export default function Error({ error, reset }: any) {
  React.useEffect(() => {
    console.log('logging error:', error);
  }, [error]);

  return (
    <>
      <div className="container-xxl mx-auto px-5 -z">
        <div className="bg-white dark:bg-black-600 soft-shadow rounded-xl pb-1">
          <div className="text-sm text-nearblue-600 dark:text-neargray-10 divide-solid dark:divide-black-200 divide-gray-200 !divide-y">
            <ErrorMessage
              icons={<FileSlash />}
              message="Sorry, we are unable to locate this transaction hash. Please try again later."
              mutedText={''}
              reset={reset}
            />
          </div>
        </div>
      </div>
      <div className="py-8"></div>
    </>
  );
}
