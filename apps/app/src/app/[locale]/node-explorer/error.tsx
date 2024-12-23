'use client';

import React from 'react';

import ExplorerIndex from '@/components/app/skeleton/node-explorer/Index';

export default function Error({ error, reset }: any) {
  React.useEffect(() => {
    console.log('logging error:', error);
  }, [error]);

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
          <ExplorerIndex error reset={reset} />
        </div>
      </div>
    </>
  );
}
