/**
 * Component: ContractOverview
 * Author: Nearblocks Pte Ltd
 * License: Business Source License 1.1
 * Description: Contract Overview on Near Protocol.
 * @interface Props
 * @param {string} [network] - The network data to show, either mainnet or testnet
 * @param {Function} [t] - A function for internationalization (i18n) provided by the next-translate package.
 * @param {string} [id] - The account identifier passed as a string.
 * @param {ContractInfo} [contract] - Information about the user's contract.
 * @param {boolean} [isLocked] - Boolean indicating whether the account or contract with full access key or not.
 * @param {any} [schema] - The schema data for the component.
 * @param {ContractParseInfo} [contractInfo] - Additional parsed information about the contract.
 * @param {Function} [requestSignInWithWallet] - Function to initiate sign-in with a wallet.
 * @param {boolean} [signedIn] - Boolean indicating whether the user is currently signed in or not.
 * @param {string} [accountId] - The account ID of the signed-in user, passed as a string.
 * @param {Function} [logOut] - Function to log out.
 * @param {string} ownerId - The identifier of the owner of the component.
 */

interface Props {
  ownerId: string;
  network: string;
  t: (key: string) => string | undefined;
  id: string;
  contract: ContractCodeInfo;
  isLocked: boolean;
  schema: SchemaInfo;
  contractInfo: ContractParseInfo;
  requestSignInWithWallet: () => void;
  connected: boolean;
  accountId: string;
  logOut: () => void;
}

import {
  ContractCodeInfo,
  ContractParseInfo,
  SchemaInfo,
} from '@/includes/types';

export default function (props: Props) {
  const {
    network,
    t,
    id,
    contract,
    isLocked,
    schema,
    contractInfo,
    requestSignInWithWallet,
    connected,
    accountId,
    logOut,
    ownerId,
  } = props;

  const [pageTab, setPageTab] = useState('Contract Info');

  const onTab = (index: number) => {
    setPageTab(tabs[index]);
  };

  const tabs = ['Contract Info', 'Contract Methods'];

  return (
    <Tabs.Root
      defaultValue={pageTab}
      className={
        'bg-white dark:bg-black-600  soft-shadow rounded-xl pb-1 px-4 py-3'
      }
    >
      <Tabs.List>
        {tabs &&
          tabs.map((tab, index) => (
            <Tabs.Trigger
              key={index}
              onClick={() => {
                onTab(index);
              }}
              className={`px-2 mr-1 md:px-3 border dark:border-black-200 py-2 mb-3 text-xs font-medium rounded-md text-gray-500 dark:text-neargray-10 hover:text-green-500 dark:hover:text-green-250 dark:hover:border-green-250 hover:border-green-500 cursor-pointer outline-none ${
                pageTab === tab
                  ? 'text-green-500 dark:text-green-250 border-green-500 dark:border-green-250'
                  : ''
              }`}
              value={tab}
            >
              {tab === 'Contract Methods' && !schema ? (
                <div className="flex h-full">
                  <h2>{tab}</h2>
                </div>
              ) : (
                <h2>{tab}</h2>
              )}
            </Tabs.Trigger>
          ))}
      </Tabs.List>
      <Tabs.Content value={tabs[0]}>
        {
          <Widget
            src={`${ownerId}/widget/bos-components.components.Contract.Info`}
            props={{
              network: network,
              t: t,
              id: id,
              contract: contract,
              isLocked: isLocked,
              ownerId,
            }}
          />
        }
      </Tabs.Content>
      <Tabs.Content value={tabs[1]}>
        <div className="border-t dark:border-black-200 p-4">
          {connected ? (
            <OverlayTrigger
              placement="bottom-start"
              delay={{ show: 500, hide: 0 }}
              overlay={
                <Tooltip className="fixed h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2">
                  Connected to Contract
                </Tooltip>
              }
            >
              <button
                className="px-2 mr-1 md:px-3 bg-neargreen py-2 text-xs font-medium rounded-md text-white inline-flex items-center"
                onClick={logOut}
              >
                <span className="h-3 w-3 inline-block rounded-full mr-2 bg-white dark:bg-black-600 dark:text-neargray-10" />
                Connected
              </button>
            </OverlayTrigger>
          ) : (
            <button
              className="px-2 mr-1 md:px-3 bg-red-400 py-2 text-xs font-medium rounded-md text-white inline-flex items-center"
              onClick={requestSignInWithWallet}
            >
              <span className="h-3 w-3 inline-block rounded-full mr-2 bg-white dark:bg-black-600 dark:text-neargray-10 animate-pulse" />
              Connect to Contract
            </button>
          )}
        </div>
        {!schema && (
          <p className="text-xs mx-5 text-gray-500 mb-4  bg-gray-100 dark:bg-black-200 px-2 py-2  w-fit rounded shadow dark:text-neargray-10 ">
            Contracts with Near{' '}
            <a
              className="text-green-500 dark:text-green-250"
              target="_blank"
              href="https://github.com/near/abi"
              rel="noreferrer noopener nofollow"
            >
              abi
            </a>
            {`will have their methods and parameters automatically shown. For
              other contracts we provide a best effort "auto detect" facility to
              find successful methods and parameters from past transactions.`}
          </p>
        )}
        {schema?.body?.functions.length > 0 ? (
          <Accordion.Root
            type="multiple"
            className="contract-accordian text-gray-600 dark:text-neargray-10 px-4 pt-4 border-t dark:border-black-200 w-full"
            collapsible
          >
            {schema?.body?.functions?.map((func: any, index: number) => (
              <Widget
                key={index}
                src={`${ownerId}/widget/bos-components.components.Contract.ViewOrChangeAbi`}
                props={{
                  network: network,
                  t: t,
                  id: id,
                  key: index,
                  index: index,
                  method: func,
                  connected: connected,
                  accountId: accountId,
                  schema: schema,
                  ownerId,
                }}
              />
            ))}
          </Accordion.Root>
        ) : (
          contractInfo?.methodNames?.length > 0 && (
            <Accordion.Root
              type="multiple"
              className="contract-accordian text-gray-600 dark:text-neargray-10  px-4 pt-4 border-t dark:border-black-200 w-full"
              collapsible
            >
              {contractInfo?.methodNames?.map((method: any, index: number) => (
                <Widget
                  key={index}
                  src={`${ownerId}/widget/bos-components.components.Contract.ViewOrChange`}
                  props={{
                    network: network,
                    t: t,
                    id: id,
                    key: index,
                    index: index,
                    method: method,
                    connected: connected,
                    accountId: accountId,
                    ownerId,
                  }}
                />
              ))}
            </Accordion.Root>
          )
        )}
      </Tabs.Content>
    </Tabs.Root>
  );
}
