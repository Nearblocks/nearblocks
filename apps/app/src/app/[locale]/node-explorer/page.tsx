import { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

import NodeList from '@/components/app/NodeExplorer/NodeList';
import ExplorerIndex from '@/components/app/skeleton/node-explorer/Index';
import RpcMenu from '@/components/app/Layouts/RpcMenu';

export default async function NodeExplorer(props: any) {
  const searchParams = await props.searchParams;
  return (
    <>
      <div>
        <div className="container-xxl mx-auto p-5 flex justify-between items-center">
          <h1 className="text-lg font-medium dark:text-neargray-10 text-nearblue-600">
            NEAR Protocol Validator Explorer
          </h1>
          <ul className="flex items-center text-gray-500 text-xs">
            <RpcMenu positionClass="right-0" />
          </ul>
        </div>
      </div>
      <div className="container-xxl mx-auto px-4">
        <div className="relative">
          <ErrorBoundary fallback={<ExplorerIndex error reset />}>
            <Suspense fallback={<ExplorerIndex />}>
              <NodeList searchParams={searchParams} />
            </Suspense>
          </ErrorBoundary>
        </div>
      </div>
    </>
  );
}
