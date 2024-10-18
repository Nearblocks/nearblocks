import React from 'react';
import Skeleton from '../common/Skeleton';

export default function InventorySkeleton() {
  return (
    <>
      <div className="pl-6 max-w-lg w-full py-5 ">
        <Skeleton className="h-4" />
      </div>
      <div className="flex flex-wrap sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 m-6">
        {[...Array(24)].map((_, i) => (
          <div
            className="max-w-full border rounded p-3 mx-auto md:mx-0"
            key={i}
          >
            <a
              href="#"
              className="flex items-center justify-center m-auto overflow-hidden"
            >
              <div className="w-40 h-40 ">
                <Skeleton className="h-40" />
              </div>
            </a>
            <div className="whitespace-nowrap text-ellipsis overflow-hidden text-xs mb-1 text-nearblue-600 dark:text-neargray-10 mt-4">
              <Skeleton className="h-4" />
            </div>
            <div className="whitespace-nowrap text-ellipsis overflow-hidden text-xs mb-1 text-nearblue-600 dark:text-neargray-10">
              <Skeleton className="h-4" />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
