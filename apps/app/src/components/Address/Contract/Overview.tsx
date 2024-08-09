import { ContractCodeInfo, ContractParseInfo, SchemaInfo } from '@/utils/types';
import { useState } from 'react';
import { Tab, TabList, TabPanel, Tabs } from 'react-tabs';
import Info from './Info';
import { Tooltip } from '@reach/tooltip';
import { Accordion } from '@reach/accordion';
import ViewOrChange from './ViewOrChange';
import { useAuthStore } from '@/stores/auth';
import ViewOrChangeAbi from './ViewOrChangeAbi';

interface Props {
  contract: ContractCodeInfo;
  isLocked?: boolean;
  schema?: SchemaInfo;
  contractInfo: ContractParseInfo;
  requestSignInWithWallet?: () => void;
  connected?: boolean;
  accountId?: string;
  logOut?: () => void;
}

const Overview = (props: Props) => {
  const { contract, isLocked, schema, contractInfo } = props;

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
      className={
        'bg-white dark:bg-black-600 soft-shadow rounded-xl pb-1 px-4 py-3'
      }
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
          Contract Methods
        </Tab>
      </TabList>
      <TabPanel>
        <Info contract={contract} isLocked={isLocked as boolean} />
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
            <p className="text-xs mx-5 text-gray-500 mb-4 bg-gray-100 dark:bg-black-200 px-2 py-2  w-fit rounded shadow">
              Contracts with Near{' '}
              <a
                className="text-green-500 dark:text-green-250"
                target="_blank"
                href="https://github.com/near/abi"
                rel="noreferrer noopener nofollow"
              >
                abi
              </a>{' '}
              {`will have their methods and parameters automatically shown. For other contracts we provide a best effort "auto detect" facility to find successful methods and parameters from past transactions.`}
            </p>
          )}
          {contractInfo?.methodNames?.length > 0 && (
            <Accordion
              multiple
              collapsible
              className="contract-accordian text-gray-600 px-4 pt-4 border-t"
            >
              {contractInfo?.methodNames?.map((method, index) => (
                <ViewOrChange key={index} index={index} method={method} />
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
              />
            ))}
          </Accordion>
        </TabPanel>
      )}
    </Tabs>
    // <Tabs.Root
    //   defaultValue={pageTab}
    //   className={
    //     'bg-white dark:bg-black-600  soft-shadow rounded-xl pb-1 px-4 py-3'
    //   }
    // >
    //   <Tabs.List>
    //     {tabs &&
    //       tabs.map((tab, index) => (
    //         <Tabs.Trigger
    //           key={index}
    //           onClick={() => {
    //             onTab(index);
    //           }}
    //           className={`px-2 mr-1 md:px-3 border dark:border-black-200 py-2 mb-3 text-xs font-medium rounded-md text-gray-500 dark:text-neargray-10 hover:text-green-500 dark:hover:text-green-250 dark:hover:border-green-250 hover:border-green-500 cursor-pointer outline-none ${
    //             pageTab === tab
    //               ? 'text-green-500 dark:text-green-250 border-green-500 dark:border-green-250'
    //               : ''
    //           }`}
    //           value={tab}
    //         >
    //           {tab === 'Contract Methods' && !schema ? (
    //             <div className="flex h-full">
    //               <h2>{tab}</h2>
    //             </div>
    //           ) : (
    //             <h2>{tab}</h2>
    //           )}
    //         </Tabs.Trigger>
    //       ))}
    //   </Tabs.List>
    //   <Tabs.Content value={tabs[0]}>
    //     {
    //       <Widget
    //         src={`${ownerId}/widget/bos-components.components.Contract.Info`}
    //         props={{
    //           network: network,
    //           t: t,
    //           id: id,
    //           contract: contract,
    //           isLocked: isLocked,
    //           ownerId,
    //         }}
    //       />
    //     }
    //   </Tabs.Content>
    //   <Tabs.Content value={tabs[1]}>
    //     <div className="border-t dark:border-black-200 p-4">
    //       {connected ? (
    //         <OverlayTrigger
    //           placement="bottom-start"
    //           delay={{ show: 500, hide: 0 }}
    //           overlay={
    //             <Tooltip className="fixed h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2">
    //               Connected to Contract
    //             </Tooltip>
    //           }
    //         >
    //           <button
    //             className="px-2 mr-1 md:px-3 bg-neargreen py-2 text-xs font-medium rounded-md text-white inline-flex items-center"
    //             onClick={logOut}
    //           >
    //             <span className="h-3 w-3 inline-block rounded-full mr-2 bg-white dark:bg-black-600 dark:text-neargray-10" />
    //             Connected
    //           </button>
    //         </OverlayTrigger>
    //       ) : (
    //         <button
    //           className="px-2 mr-1 md:px-3 bg-red-400 py-2 text-xs font-medium rounded-md text-white inline-flex items-center"
    //           onClick={requestSignInWithWallet}
    //         >
    //           <span className="h-3 w-3 inline-block rounded-full mr-2 bg-white dark:bg-black-600 dark:text-neargray-10 animate-pulse" />
    //           Connect to Contract
    //         </button>
    //       )}
    //     </div>
    //     {!schema && (
    //       <p className="text-xs mx-5 text-gray-500 mb-4  bg-gray-100 dark:bg-black-200 px-2 py-2  w-fit rounded shadow">
    //         Contracts with Near{' '}
    //         <a
    //           className="text-green-500 dark:text-green-250"
    //           target="_blank"
    //           href="https://github.com/near/abi"
    //           rel="noreferrer noopener nofollow"
    //         >
    //           abi
    //         </a>
    //         {`will have their methods and parameters automatically shown. For
    //           other contracts we provide a best effort "auto detect" facility to
    //           find successful methods and parameters from past transactions.`}
    //       </p>
    //     )}
    //     {schema?.body?.functions.length > 0 ? (
    //       <Accordion.Root
    //         type="multiple"
    //         className="contract-accordian text-gray-600 dark:text-neargray-10 px-4 pt-4 border-t dark:border-black-200 w-full"
    //         collapsible
    //       >
    //         {schema?.body?.functions?.map((func: any, index: number) => (
    //           <Widget
    //             key={index}
    //             src={`${ownerId}/widget/bos-components.components.Contract.ViewOrChangeAbi`}
    //             props={{
    //               network: network,
    //               t: t,
    //               id: id,
    //               key: index,
    //               index: index,
    //               method: func,
    //               connected: connected,
    //               accountId: accountId,
    //               schema: schema,
    //               ownerId,
    //             }}
    //           />
    //         ))}
    //       </Accordion.Root>
    //     ) : (
    //       contractInfo?.methodNames?.length > 0 && (
    //         <Accordion.Root
    //           type="multiple"
    //           className="contract-accordian text-gray-600 dark:text-neargray-10  px-4 pt-4 border-t dark:border-black-200 w-full"
    //           collapsible
    //         >
    //           {contractInfo?.methodNames?.map((method: any, index: number) => (
    //             <Widget
    //               key={index}
    //               src={`${ownerId}/widget/bos-components.components.Contract.ViewOrChange`}
    //               props={{
    //                 network: network,
    //                 t: t,
    //                 id: id,
    //                 key: index,
    //                 index: index,
    //                 method: method,
    //                 connected: connected,
    //                 accountId: accountId,
    //                 ownerId,
    //               }}
    //             />
    //           ))}
    //         </Accordion.Root>
    //       )
    //     )}
    //   </Tabs.Content>
    // </Tabs.Root>
  );
};
export default Overview;
