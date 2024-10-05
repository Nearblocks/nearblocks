'use client';
import { Tab, TabList, TabPanel, Tabs } from 'react-tabs';
import { Tooltip } from '@reach/tooltip';
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
      <TabList className={'flex flex-wrap'}>
        <Tab
          className={`px-2 mr-1 md:px-3 border py-2 text-xs font-medium rounded-md text-gray-500 hover:text-green-500 hover:border-green-500 cursor-pointer outline-none`}
          selectedClassName="text-green-500 border-green-500 dark:text-neargray-10"
        >
          Contract Info
        </Tab>
        <Tab
          className={`px-2 mr-1 md:px-3 border py-2  text-xs font-medium rounded-md text-gray-500 hover:text-green-500 hover:border-green-500 cursor-pointer outline-none`}
          selectedClassName="text-green-500 border-green-500 dark:text-neargray-10"
        >
          Contract Code
        </Tab>
        <Tab
          className={`px-2 mr-1 md:px-3 border py-2  text-xs font-medium rounded-md text-gray-500 hover:text-green-500 hover:border-green-500 cursor-pointer outline-none`}
          selectedClassName="text-green-500 border-green-500 dark:text-neargray-10"
        >
          Contract Methods
        </Tab>
      </TabList>
      <TabPanel>
        <div className="w-full border-t dark:border-black-200 mt-3">
          <div className="h-full bg-white dark:bg-black-600 text-sm text-gray-500 dark:text-neargray-10">
            <div className="flex flex-wrap p-4">
              <div className="flex items-center w-full md:w-1/4 mb-2 md:mb-0">
                <Tooltip
                  label={'Latest time the contract deployed.'}
                  className="absolute h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white p-2 break-words"
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
            <div className="flex flex-wrap p-4">
              <div className="flex items-center w-full md:w-1/4 mb-2 md:mb-0 ">
                <Tooltip
                  label={`The transaction unique identifier (hash) that the contract is latest deployed.`}
                  className="absolute h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white p-2 break-words"
                >
                  <div>
                    <Question className="w-4 h-4 fill-current mr-1" />
                  </div>
                </Tooltip>
                Transaction Hash
              </div>
              <Loader wrapperClassName="w-32" />
            </div>
            <div className="flex flex-wrap p-4">
              <div className="flex items-center w-full md:w-1/4 mb-2 md:mb-0 ">
                <Tooltip
                  label={`Locked contract means that there are no access keys allowing the contract code to be re-deployed`}
                  className="absolute h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white p-2 break-words"
                >
                  <div>
                    <Question className="w-4 h-4 fill-current mr-1" />
                  </div>
                </Tooltip>
                Contract Locked
              </div>
              <Loader wrapperClassName="w-32" />
            </div>
            <div className="flex flex-wrap p-4">
              <div className="flex items-center w-full md:w-1/4 mb-2 md:mb-0 ">
                <Tooltip
                  label={`Checksum (SHA-256 in base58 encoding) of the contract binary.`}
                  className="absolute h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white p-2 break-words"
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
