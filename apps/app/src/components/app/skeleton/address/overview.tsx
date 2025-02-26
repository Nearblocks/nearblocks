'use client';
import { Tab, TabList, TabPanel, Tabs } from 'react-tabs';

import Tooltip from '../../common/Tooltip';
import Question from '../../Icons/Question';

const Loader = (props: { className?: string; wrapperClassName?: string }) => {
  return (
    <div
      className={`bg-gray-200 dark:bg-black-200 h-5 rounded shadow-sm animate-pulse ${props.className} ${props.wrapperClassName}`}
    ></div>
  );
};

const OverviewActionsSkeleton = () => {
  return (
    <Tabs className={'pb-1 px-4 py-3'}>
      <TabList className={'flex flex-wrap gap-x-1 gap-y-2 pt-2'}>
        <Tab
          className={`px-2.5 mr-1 border dark:border-black-200 py-1.5 text-xs font-semibold rounded-lg cursor-pointer outline-none 
    text-nearblue-600 dark:text-neargray-10 hover:bg-neargray-800 bg-neargray-700 dark:bg-black-200 dark:hover:bg-black-100`}
          selectedClassName="!bg-green-600 dark:!bg-green-250 !text-white"
        >
          Contract Info
        </Tab>
        <Tab
          className={`px-2.5 mr-1 border dark:border-black-200 py-1.5 text-xs font-semibold rounded-lg cursor-pointer outline-none 
    text-nearblue-600 dark:text-neargray-10 hover:bg-neargray-800 bg-neargray-700 dark:bg-black-200 dark:hover:bg-black-100`}
          selectedClassName="!bg-green-600 dark:!bg-green-250 !text-white"
        >
          Contract Code
        </Tab>
        <Tab
          className={`px-2.5 mr-1 border dark:border-black-200 py-1.5 text-xs font-semibold rounded-lg cursor-pointer outline-none 
    text-nearblue-600 dark:text-neargray-10 hover:bg-neargray-800 bg-neargray-700 dark:bg-black-200 dark:hover:bg-black-100`}
          selectedClassName="!bg-green-600 dark:!bg-green-250 !text-white"
        >
          Contract Methods
        </Tab>
      </TabList>
      <TabPanel>
        <div className="w-full mt-3">
          <div className="h-full bg-white dark:bg-black-600 text-sm text-nearblue-600 dark:text-neargray-10 divide-y dark:divide-black-200 px-1">
            <div className="flex flex-wrap py-4">
              <div className="flex items-center w-full md:w-1/4 mb-2 md:mb-0">
                <Tooltip
                  className={'left-[5.6rem] max-w-[200px] w-40'}
                  position="bottom"
                  tooltip={'Latest time the contract deployed.'}
                >
                  <div>
                    <Question className="w-4 h-4 fill-current mr-1" />
                  </div>
                </Tooltip>
                Last Updated
              </div>
              <div className="w-full md:w-3/4">
                <Loader wrapperClassName="flex w-full max-w-xl" />
              </div>
            </div>
            <div className="flex flex-wrap py-4">
              <div className="flex items-center w-full md:w-1/4 mb-2 md:mb-0 ">
                <Tooltip
                  className={'left-28 max-w-[200px] w-80'}
                  position="bottom"
                  tooltip={`The transaction unique identifier (hash) that the contract is latest deployed.`}
                >
                  <div>
                    <Question className="w-4 h-4 fill-current mr-1" />
                  </div>
                </Tooltip>
                Transaction Hash
              </div>
              <Loader wrapperClassName="w-32" />
            </div>
            <div className="flex flex-wrap py-4">
              <div className="flex items-center w-full md:w-1/4 mb-2 md:mb-0 ">
                <Tooltip
                  className={'left-28 max-w-[200px] w-80'}
                  position="bottom"
                  tooltip={`Locked contract means that there are no access keys allowing the contract code to be re-deployed`}
                >
                  <div>
                    <Question className="w-4 h-4 fill-current mr-1" />
                  </div>
                </Tooltip>
                Contract Locked
              </div>
              <Loader wrapperClassName="w-32" />
            </div>
            <div className="flex flex-wrap py-4">
              <div className="flex items-center w-full md:w-1/4 mb-2 md:mb-0 ">
                <Tooltip
                  className={'left-28 max-w-[200px] w-80'}
                  position="bottom"
                  tooltip={`Checksum (SHA-256 in base58 encoding) of the contract binary.`}
                >
                  <div>
                    <Question className="w-4 h-4 fill-current mr-1" />
                  </div>
                </Tooltip>
                Code Hash
              </div>
              <Loader wrapperClassName="w-32" />
            </div>
          </div>
        </div>
      </TabPanel>
    </Tabs>
  );
};

export default OverviewActionsSkeleton;
