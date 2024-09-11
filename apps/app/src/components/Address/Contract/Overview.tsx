import { ContractCodeInfo, ContractParseInfo, SchemaInfo } from '@/utils/types';
import { useState } from 'react';
import { Tab, TabList, TabPanel, Tabs } from 'react-tabs';
import Info from './Info';
import { Tooltip } from '@reach/tooltip';
import { Accordion } from '@reach/accordion';
import ViewOrChange from './ViewOrChange';
import { useAuthStore } from '@/stores/auth';
import ViewOrChangeAbi from './ViewOrChangeAbi';
import ContractCode from './ContractCode';

interface Props {
  contract: ContractCodeInfo;
  isLocked?: boolean;
  schema?: SchemaInfo;
  contractInfo: ContractParseInfo;
  requestSignInWithWallet?: () => void;
  connected?: boolean;
  accountId?: string;
  logOut?: () => void;
  deployments: any;
}

const Overview = (props: Props) => {
  const { contract, isLocked, schema, contractInfo, deployments, accountId } =
    props;

  const requestSignInWithWallet = useAuthStore(
    (store) => store.requestSignInWithWallet,
  );
  const signedIn = useAuthStore((store) => store.signedIn);
  const logOut = useAuthStore((store) => store.logOut);

  const [tab, setTab] = useState(0);

  const onTabChange = (index: number) => setTab(index);

  return (
    <Tabs
      selectedIndex={tab}
      onSelect={onTabChange}
      className={'pb-1 px-4 py-3'}
    >
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
        <Info
          contract={contract}
          isLocked={isLocked as boolean}
          data={deployments}
        />
      </TabPanel>
      <TabPanel>
        <ContractCode accountId={accountId as string} />
      </TabPanel>
      {!schema && (
        <TabPanel>
          <div className="border-t p-4 mt-3">
            {signedIn ? (
              <Tooltip
                label="Disconnect Wallet"
                className="absolute h-auto max-w-xs bg-black bg-opacity-90 z-10 text-white text-xs p-2 break-words"
              >
                <button
                  className="px-2 mr-1 md:px-3 bg-neargreen py-2 text-xs font-medium rounded-md text-white inline-flex items-center"
                  onClick={logOut}
                >
                  <span className="h-3 w-3 inline-block rounded-full mr-2 bg-white" />
                  Connected
                </button>
              </Tooltip>
            ) : (
              <button
                className="px-2 mr-1 md:px-3 bg-red-400 py-2 text-xs font-medium rounded-md text-white inline-flex items-center"
                onClick={requestSignInWithWallet}
              >
                <span className="h-3 w-3 inline-block rounded-full mr-2 bg-white animate-pulse" />
                Connect to Contract
              </button>
            )}
          </div>
          {!schema && (
            <p className="text-xs mx-4 text-gray-500 mb-4 bg-gray-100 dark:bg-black-200 px-2 py-2  w-fit rounded shadow">
              {`Near ABI schema not found, We have provide a best effort “auto detect” facility to find successful methods and parameters from past transactions. If you are the contract owner please consider recompiling your contract with Near`}{' '}
              <a
                className="text-green-500 dark:text-green-250"
                target="_blank"
                href="https://github.com/near/abi"
                rel="noreferrer noopener nofollow"
              >
                ABI
              </a>
              .
            </p>
          )}
          {contractInfo?.methodNames?.length > 0 && (
            <Accordion
              multiple
              collapsible
              className="contract-accordian text-gray-600 px-4 pt-4 border-t"
            >
              {contractInfo?.methodNames?.map((method, index) => (
                <ViewOrChange
                  key={index}
                  index={index}
                  method={method}
                  connected={signedIn}
                />
              ))}
            </Accordion>
          )}
        </TabPanel>
      )}
      {schema && schema?.body?.functions.length > 0 && (
        <TabPanel>
          <div className="border-t p-4 mt-3">
            {signedIn ? (
              <Tooltip
                label="Disconnect Wallet"
                className="absolute h-auto max-w-xs bg-black bg-opacity-90 z-10 text-white text-xs p-2 break-words"
              >
                <button
                  className="px-2 mr-1 md:px-3 bg-neargreen py-2 text-xs font-medium rounded-md text-white inline-flex items-center"
                  onClick={logOut}
                >
                  <span className="h-3 w-3 inline-block rounded-full mr-2 bg-white" />
                  Connected
                </button>
              </Tooltip>
            ) : (
              <button
                className="px-2 mr-1 md:px-3 bg-red-400 py-2 text-xs font-medium rounded-md text-white inline-flex items-center"
                onClick={requestSignInWithWallet}
              >
                <span className="h-3 w-3 inline-block rounded-full mr-2 bg-white animate-pulse" />
                Connect to Contract
              </button>
            )}
          </div>
          <p className="text-xs mx-4 text-gray-500 mb-4 bg-gray-100 dark:bg-black-200 px-2 py-2  w-fit rounded shadow">
            Methods and parameters are automatically shown from the embedded
            Near{' '}
            <a
              className="text-green-500 dark:text-green-250"
              target="_blank"
              href="https://github.com/near/abi"
              rel="noreferrer noopener nofollow"
            >
              ABI
            </a>{' '}
            {`Schema.`}
          </p>
          <Accordion
            multiple
            collapsible
            className="contract-accordian text-gray-600 px-4 pt-4 border-t"
          >
            {schema?.body?.functions?.map((func: any, index: number) => (
              <ViewOrChangeAbi
                key={index}
                index={index}
                method={func}
                schema={schema}
                connected={signedIn}
              />
            ))}
          </Accordion>
        </TabPanel>
      )}
    </Tabs>
  );
};
export default Overview;
