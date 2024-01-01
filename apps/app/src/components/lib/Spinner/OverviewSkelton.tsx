import { networkId } from '@/utils/config';
import Loader from './Loader';
import React from 'react';
const OverviewSkelton = () => {
  return (
    <div className="relative -mt-14">
      <div className="container mx-auto px-3">
        <div className="bg-white soft-shadow rounded-lg overflow-hidden px-5 md:py lg:px-0">
          <div
            className={`grid grid-flow-col grid-cols-1 ${
              networkId === 'mainnet'
                ? 'grid-rows-3 lg:grid-cols-3'
                : 'grid-rows-2 lg:grid-cols-2'
            } lg:grid-rows-1 divide-y lg:divide-y-0 lg:divide-x lg:py-3`}
          >
            {networkId === 'mainnet' && (
              <>
                <div className="flex flex-col lg:flex-col lg:items-stretch divide-y lg:divide-y lg:divide-x-0 md:pt-0 md:pb-0 md:px-5">
                  <div className="flex flex-row py-5 lg:pb-5 lg:px-0">
                    <div className="items-center flex justify-left mr-3 ">
                      <div className="max-w-lg w-40 pl-3  h-full">
                        <Loader />
                      </div>
                    </div>
                    <div className="ml-2">
                      <div className="max-w-lg w-96 pl-3  h-full">
                        <Loader />
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-row py-5 lg:pt-5 lg:px-0">
                    <div className="items-center flex justify-left mr-3 ">
                      <div className="max-w-lg w-96 pl-3  h-full">
                        <Loader />
                      </div>
                    </div>
                    <div className="ml-2">
                      <div className="max-w-lg w-96 pl-3  h-full">
                        <Loader />
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
            <div className="flex flex-col lg:flex-col lg:items-stretch divide-y lg:divide-y lg:divide-x-0 md:pt-0 md:pb-0 md:px-5">
              <div className="flex flex-row justify-between py-5 lg:pb-5 lg:px-0">
                <div className="flex flex-row ">
                  <div className="items-center flex justify-left mr-3 ">
                    <div className="max-w-lg w-96 pl-3  h-full">
                      <Loader />
                    </div>
                  </div>
                  <div className="ml-2">
                    <div className="max-w-lg w-60 pl-3  h-full">
                      <Loader />
                    </div>
                  </div>
                </div>
                <div className="flex flex-col text-right">
                  <div className="max-w-lg pl-3  h-full">
                    <Loader />
                  </div>
                  <div className="max-w-lg  pl-3  h-full">
                    <Loader />
                  </div>
                </div>
              </div>
              <div className="flex flex-row justify-between align-center py-5 lg:pt-5 lg:px-0">
                <div className="flex flex-row ">
                  <div className="items-center flex justify-left mr-3 ">
                    <div className="max-w-lg w-96 pl-3  h-full">
                      <Loader />
                    </div>
                  </div>
                  <div className="ml-2">
                    <div className="max-w-lg w-60 pl-3  h-full">
                      <Loader />
                    </div>
                  </div>
                </div>
                <div className="flex flex-col text-right">
                  <div className="max-w-lg  pl-3  h-full">
                    <Loader />
                  </div>
                  <div className="max-w-lg  pl-3  h-full">
                    <Loader />
                  </div>
                </div>
              </div>
            </div>
            <div className="md:col-span-2 lg:col-span-1 flex flex-col lg:flex-col lg:items-stretch divide-y lg:divide-y lg:divide-x-0 md:pt-0 md:px-5">
              <div className="flex-1 lg:px-0">
                <div className="max-w-lg w-96 pl-3 pt-5  h-20">
                  <Loader />
                </div>
                <div className="max-w-lg w-96 pl-3  pt-5 h-full">
                  <Loader />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="py-8 relative"></div>
    </div>
  );
};

export default OverviewSkelton;
