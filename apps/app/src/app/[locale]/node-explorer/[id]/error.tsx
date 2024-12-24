'use client';

import { useParams } from 'next/navigation';
import React from 'react';

import Buttons from '@/components/app/common/Button';
import Skeleton from '@/components/app/skeleton/common/Skeleton';
import DelegatorSkeleton from '@/components/app/skeleton/node-explorer/Delegator';

export default function Error({ error, reset }: any) {
  const params = useParams<{ id: string }>();
  const id = params.id;
  React.useEffect(() => {
    console.log('logging error:', error);
  }, [error]);

  return (
    <div className="container-xxl relative mx-auto p-3">
      <div className="md:flex justify-between">
        {!id ? (
          <div className="w-80 max-w-xs px-3 py-5">
            <Skeleton className="h-7" />
          </div>
        ) : (
          <div className="md:flex-wrap">
            <div className="break-words py-4 px-2">
              <span className="py-5 text-xl text-gray-700 leading-8 dark:text-neargray-10 mr-1">
                <span className="whitespace-nowrap">Near Validator:&nbsp;</span>
                {id && (
                  <span className="text-center items-center">
                    <span className="text-green-500 dark:text-green-250">
                      @<span className="font-semibold">{id}</span>
                    </span>
                    <span className="ml-2">
                      <Buttons address={id} />
                    </span>
                  </span>
                )}
              </span>
            </div>
          </div>
        )}
      </div>
      <div>
        <DelegatorSkeleton error reset={reset} />
      </div>
    </div>
  );
}
