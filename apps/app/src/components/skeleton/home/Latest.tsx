import React from 'react';
import Skeleton from '../common/Skeleton';

const Latest = () => {
  return (
    <>
      <div className="relative">
        <div className="px-3 divide-y h-80">
          {[...Array(5)].map((_, i) => (
            <div
              className="grid grid-cols-2 md:grid-cols-3 gap-3 py-3 h-16"
              key={i}
            >
              <div className="flex items-center ">
                <div className="flex-shrink-0 rounded-full h-10 w-10 bg-blue-900/10 flex items-center justify-center text-sm">
                  <Skeleton className="h-4" />
                </div>
                <div className="px-2">
                  <div className="text-green-500 text-sm">
                    <div className="h-5 w-14">
                      <Skeleton className="h-4" />
                    </div>
                  </div>
                  <div className="text-gray-400 text-xs">
                    <div className="h-4 w-24">
                      <Skeleton className="h-3" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-span-2 md:col-span-1 px-2 order-2 md:order-1 text-sm">
                <div className="h-5 w-36">
                  <Skeleton className="h-4" />
                </div>
                <div className="text-gray-400 text-sm">
                  <div className="h-5 w-14">
                    <Skeleton className="h-4" />
                  </div>
                </div>
              </div>
              <div className="text-right order-1 md:order-2">
                <Skeleton className="h-4" />
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="border-t px-2 py-3 text-gray-700">
        <Skeleton className="h-10" />
      </div>
    </>
  );
};

export default Latest;
