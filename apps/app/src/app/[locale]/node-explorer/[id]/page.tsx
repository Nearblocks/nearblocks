import { cookies } from 'next/headers';
import { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

import Buttons from '@/components/app/common/Button';
import Delegators from '@/components/app/NodeExplorer/Delegators';
import Skeleton from '@/components/app/skeleton/common/Skeleton';
import DelegatorSkeleton from '@/components/app/skeleton/node-explorer/Delegator';
import RpcMenu from '@/components/app/Layouts/RpcMenu';

export default async function Delegator(props: {
  params: Promise<{ id: string }>;
}) {
  const params = await props.params;
  const theme = (await cookies()).get('theme')?.value || 'light';

  const { id } = params;

  return (
    <div className="container-xxl relative mx-auto px-4">
      <div className="md:flex justify-between">
        {!id ? (
          <div className="w-80 max-w-xs px-1 py-5">
            <Skeleton className="h-7" />
          </div>
        ) : (
          <div className="md:flex-wrap w-full">
            <div className="break-words px-1">
              <div className="py-5 sm:flex flex-1 md:items-center w-full justify-between text-lg font-bold dark:text-neargray-10 text-nearblue-600">
                <div className="md:flex-wrap flex-wrap">
                  <span className="whitespace-nowrap">
                    Near Validator:&nbsp;
                  </span>
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
                </div>
                <div>
                  <div className="flex relative md:pt-0 pt-2 items-center text-gray-500 text-xs font-normal">
                    <span className="ml-2 text-xs">
                      <RpcMenu />
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <div>
        <ErrorBoundary fallback={<DelegatorSkeleton error reset />}>
          <Suspense fallback={<DelegatorSkeleton />}>
            <Delegators accountId={id} theme={theme} />
          </Suspense>
        </ErrorBoundary>
      </div>
    </div>
  );
}
