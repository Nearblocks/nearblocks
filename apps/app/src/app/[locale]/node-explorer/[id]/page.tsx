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
      <div className="flex items-center justify-between w-full">
        {!id ? (
          <div className="w-80 max-w-xs px-1 py-5">
            <Skeleton className="h-7" />
          </div>
        ) : (
          <div className="w-full px-1">
            <div className="md:flex flex-wrap py-3 md:items-center justify-between text-lg font-medium dark:text-neargray-10 text-nearblue-600">
              <h1 className="py-2 flex-wrap md:flex">
                <span className="flex">Near Validator:&nbsp;</span>
                {id && (
                  <span className="text-green-500 dark:text-green-250 flex-wrap">
                    @<span className="font-semibold">{id}</span>
                  </span>
                )}
                <span className="ml-1.5">
                  <Buttons address={id} />
                </span>
              </h1>
              <div className="relative items-center text-center text-gray-500 text-xs font-normal flex">
                <span className="text-xs items-center flex">
                  <RpcMenu />
                </span>
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
