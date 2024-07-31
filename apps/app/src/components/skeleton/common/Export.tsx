import React, { Ref, forwardRef } from 'react';
import Skeleton from './Skeleton';
interface Props {
  className?: string;
}
const Export = forwardRef(({ className }: Props, ref: Ref<HTMLDivElement>) => {
  return (
    <div ref={ref} className={`w-full z-10 ${className}`}>
      <div className="bg-neargray-25 dark:bg-black-300 py-16 flex flex-col items-center">
        <div className="w-20 py-1">
          <Skeleton className="h-6" />
        </div>
        <div className="text-sm text-neargray-600 dark:text-neargray-10 py-2 max-w-lg md:mx-12 mx-4">
          <div className="text-center">
            The information you requested can be downloaded from this page.
          </div>
          <div className="bg-white dark:bg-black-600 dark:border-black-200 border rounded-md shadow-md w-full px-4 py-4 my-10">
            <p className="text-gray-900 my-3 mx-2">
              Export the earliest 5000 records starting from
            </p>

            <div className="lg:flex justify-between items-center text-center">
              <div className="flex items-center border-gray-300  dark:border-black-200 rounded-md text-center px-2 py-2 w-11/12 mx-2">
                <input
                  type="date"
                  name="startdate"
                  id="startdate"
                  className="border flex items-center  border-gray-300 dark:border-black-200 rounded-md px-2 py-2 w-11/12 mx-2 focus:outline-none text-center"
                />
              </div>

              <p className="text-center">To</p>

              <div className="flex items-center  border-gray-300 dark:border-black-200 rounded-md text-center px-2 py-2 w-11/12 mx-2">
                <input
                  type="date"
                  name="enddate"
                  id="enddate"
                  className="border flex items-center  border-gray-300 dark:border-black-200 rounded-md px-2 py-2 w-11/12 mx-2 focus:outline-none text-center"
                />
              </div>
            </div>
            <div className="w-full flex justify-center my-4"></div>
            <div className="w-full flex justify-center my-4">
              <div
                className={`items-center cursor-pointer text-center bg-green-500 dark:bg-green-250 hover:shadow-lg  text-white text-xs py-2 rounded w-20 focus:outline-none`}
              >
                Generate
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});
Export.displayName = 'Export';
export default Export;
