export const runtime = 'edge';

import { Suspense } from 'react';

import Buttons from '@/components/app/Address/Button';
import Delegators from '@/components/app/NodeExplorer/Delegators';
import DelegatorSkeleton from '@/components/app/skeleton/node-explorer/Delegator';
import Skeleton from '@/components/skeleton/common/Skeleton';

export default async function Delegator({
  params: { id },
}: {
  params: { id: string };
}) {
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
        <Suspense fallback={<DelegatorSkeleton />}>
          <Delegators accountId={id} />
        </Suspense>
      </div>
    </div>
  );
}
