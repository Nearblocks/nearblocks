import { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

import NodeList from '@/components/app/NodeExplorer/NodeList';
import ExplorerIndex from '@/components/app/skeleton/node-explorer/Index';

export default async function NodeExplorer(props: any) {
  const searchParams = await props.searchParams;
  return (
    <>
      <div>
        <div className="container-xxl mx-auto p-5">
          <h1 className="text-lg font-bold dark:text-neargray-10 text-nearblue-600">
            NEAR Protocol Validator Explorer
          </h1>
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
