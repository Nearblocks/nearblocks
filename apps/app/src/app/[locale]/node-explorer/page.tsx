export const runtime = 'edge';

import { Suspense } from 'react';

import NodeList from '@/components/app/NodeExplorer/NodeList';
import ExplorerIndex from '@/components/app/skeleton/node-explorer/Index';

export default async function NodeExplorer({ searchParams }: any) {
  return (
    <>
      <div className="bg-hero-pattern dark:bg-hero-pattern-dark h-72">
        <div className="container mx-auto px-3">
          <h1 className="mb-4 pt-8 sm:!text-2xl text-xl text-white">
            NEAR Protocol Validator Explorer
          </h1>
        </div>
      </div>
      <div className="container mx-auto px-3 -mt-48">
        <div className="relative">
          <Suspense fallback={<ExplorerIndex />}>
            <NodeList searchParams={searchParams} />
          </Suspense>
        </div>
      </div>
    </>
  );
}
