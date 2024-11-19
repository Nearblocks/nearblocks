export const runtime = 'edge';

import { Suspense } from 'react';

import NodeList from '@/components/app/NodeExplorer/NodeList';
import ExplorerIndex from '@/components/app/skeleton/node-explorer/Index';

export default async function NodeExplorer(props: any) {
  const searchParams = await props.searchParams;
  return (
    <>
      <div className="bg-hero-pattern dark:bg-hero-pattern-dark h-72">
        <div className="container-xxl mx-auto px-5">
          <h1 className="mb-4 pt-8 sm:!text-2xl text-xl text-white font-medium dark:text-neargray-10">
            NEAR Protocol Validator Explorer
          </h1>
        </div>
      </div>
      <div className="container-xxl mx-auto px-5 -mt-48">
        <div className="relative">
          <Suspense fallback={<ExplorerIndex />}>
            <NodeList searchParams={searchParams} />
          </Suspense>
        </div>
      </div>
    </>
  );
}
