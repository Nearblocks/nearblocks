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
 * @param {any} [schema] - The schema data for the component.
 * @param {ContractParseInfo} [contractInfo] - Additional parsed information about the contract.
 * @param {Function} [requestSignInWithWallet] - Function to initiate sign-in with a wallet.
 * @param {boolean} [signedIn] - Boolean indicating whether the user is currently signed in or not.
 * @param {string} [accountId] - The account ID of the signed-in user, passed as a string.
 * @param {Function} [logOut] - Function to log out.
 * @param {React.FC<{
 *   href: string;
 *   children: React.ReactNode;
 *   className?: string;
 * }>} Link - A React component for rendering links.
 */

interface Props {
  network: string;
  t: (key: string) => string | undefined;
  id: string;
  contract: ContractInfo;
  schema: SchemaInfo;
  contractInfo: ContractParseInfo;
  requestSignInWithWallet: () => void;
  connected: boolean;
  accountId: string;
  logOut: () => void;
  Link: React.FC<{
    href: string;
    children: React.ReactNode;
    className?: string;
  }>;
}

import { getConfig } from '@/includes/libs';
import { ContractInfo, ContractParseInfo, SchemaInfo } from '@/includes/types';

export default function (props: Props) {
  const {
    network,
    t,
    id,
    contract,
    schema,
    contractInfo,
    requestSignInWithWallet,
    connected,
    accountId,
    logOut,
    Link,
  } = props;
  const [pageTab, setPageTab] = useState('Contract Info');
  const config = getConfig(network);
  const onTab = (index: number) => {
    setPageTab(tabs[index]);
  };

  const tabs = ['Contract Info', 'Contract Methods'];

  return (
    <Tabs.Root
      defaultValue={pageTab}
      className={'bg-white soft-shadow rounded-xl pb-1 px-4 py-3'}
    >
      <Tabs.List>
        {tabs &&
          tabs.map((tab, index) => (
            <Tabs.Trigger
              key={index}
              onClick={() => {
                onTab(index);
              }}
              className={`px-2 mr-1 md:px-3 border py-2 mb-3 text-xs font-medium rounded-md text-gray-500 hover:text-green-500 hover:border-green-500 cursor-pointer outline-none ${
                pageTab === tab ? 'text-green-500 border-green-500' : ''
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
            src={`${config.ownerId}/widget/bos-components.components.Contract.Info`}
            props={{
              network: network,
              t: t,
              id: id,
              contract: contract,
              Link,
            }}
          />
        }
      </Tabs.Content>
      <Tabs.Content value={tabs[1]}>
        <div className="border-t p-4">
          {connected ? (
            <Tooltip.Provider>
              <Tooltip.Root>
                <Tooltip.Trigger asChild>
                  <button
                    className="px-2 mr-1 md:px-3 bg-neargreen py-2 text-xs font-medium rounded-md text-white inline-flex items-center"
                    onClick={logOut}
                  >
                    <span className="h-3 w-3 inline-block rounded-full mr-2 bg-white" />
                    Connected
                  </button>
                </Tooltip.Trigger>
                <Tooltip.Content
                  className="h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2"
                  align="start"
                  side="bottom"
                >
                  Connect to Contract
                </Tooltip.Content>
              </Tooltip.Root>
            </Tooltip.Provider>
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
          <p className="text-xs mx-5 text-gray-500 mb-4  bg-gray-100 px-2 py-2  w-fit rounded shadow">
            Contracts compiled with{' '}
            <a
              className="text-green-500 mx-1"
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
            className="contract-accordian text-gray-600 px-4 pt-4 border-t w-full"
            collapsible
          >
            {schema?.body?.functions?.map((func: any, index: number) => (
              <Widget
                key={index}
                src={`${config.ownerId}/widget/bos-components.components.Contract.ViewOrChangeAbi`}
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
                  Link,
                }}
              />
            ))}
          </Accordion.Root>
        ) : (
          contractInfo?.methodNames?.length > 0 && (
            <Accordion.Root
              type="multiple"
              className="contract-accordian text-gray-600 px-4 pt-4 border-t w-full"
              collapsible
            >
              {contractInfo?.methodNames?.map((method: any, index: number) => (
                <Widget
                  key={index}
                  src={`${config.ownerId}/widget/bos-components.components.Contract.ViewOrChange`}
                  props={{
                    network: network,
                    t: t,
                    id: id,
                    key: index,
                    index: index,
                    method: method,
                    connected: connected,
                    accountId: accountId,
                    Link,
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
