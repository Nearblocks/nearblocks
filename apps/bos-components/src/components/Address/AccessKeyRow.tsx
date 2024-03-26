/**
 * Component: AddressAccessKeyRow
 * Author: Nearblocks Pte Ltd
 * License: Business Source License 1.1
 * Description: Address Access key Row on Near Protocol.
 * @interface
 * @param {string}  [network] - The network data to show, either mainnet or testnet.
 * @param {Function} [t] - A function for internationalization (i18n) provided by the next-translate package.
 * @param {AccountContractInfo} [accessKey] - Key-value pairs for Accesskey info
 * @param {boolean} [showWhen] - Controls whether to show the date and time in UTC format or as a time ago string.
 */

interface Props {
  ownerID: string;
  network: string;
  t: (key: string, options?: { count?: string | undefined }) => string;
  accessKey: AccountContractInfo;
  showWhen: boolean;
}

import { AccessInfo, AccountContractInfo } from '@/includes/types';

export default function ({ network, t, accessKey, showWhen, ownerID }: Props) {
  const { formatTimestampToString, getTimeAgoString, capitalizeWords } =
    VM.require(`${ownerID}/widget/includes.Utils.formats`);

  const { getConfig, handleRateLimit, nanoToMilli, yoctoToNear } = VM.require(
    `${ownerID}/widget/includes.Utils.libs`,
  );

  const [keyInfo, setKeyInfo] = useState<AccessInfo>({} as AccessInfo);

  const config = getConfig && getConfig(network);

  const createdTime = accessKey.created?.block_timestamp
    ? nanoToMilli(accessKey.created?.block_timestamp)
    : '';
  const deletedTime = accessKey.deleted?.block_timestamp
    ? nanoToMilli(accessKey.deleted?.block_timestamp)
    : '';

  const txn = createdTime > deletedTime ? accessKey.created : accessKey.deleted;

  const action =
    accessKey.deleted?.transaction_hash && createdTime <= deletedTime
      ? 'Deleted'
      : 'Created';

  function showMethod(method: string) {
    switch (method) {
      case 'CREATE_ACCOUNT':
      case 'CreateAccount':
        return (
          <div className="px-1 py-1 flex justify-center items-center text-xs">
            {t('createAccount')}
          </div>
        );
      case 'DEPLOY_CONTRACT':
      case 'DeployContract':
        return (
          <div className="px-1 py-1 flex justify-center items-center text-xs">
            {t('deployContract')}
          </div>
        );
      case 'TRANSFER':
      case 'Transfer':
        return (
          <div className="bg-emerald-50 px-1 py-1 flex justify-center items-center text-xs">
            {t('transfer')}
          </div>
        );
      case 'STAKE':
      case 'Stake':
        return (
          <div className="px-1 py-1 flex justify-center items-center text-xs">
            {t('stake')}
          </div>
        );
      case 'ADD_KEY':
      case 'AddKey':
        return (
          <div className="px-1 py-1 flex justify-center items-center text-xs">
            Acces Key Created
          </div>
        );
      case 'DELETE_KEY':
      case 'DeleteKey':
        return (
          <div className="bg-red-50 px-1 py-1 flex justify-center items-center text-xs">
            Acces Key Deleted
          </div>
        );
      case 'DELETE_ACCOUNT':
      case 'DeleteAccount':
        return (
          <div className="bg-red-50 px-1 py-1 flex justify-center items-center text-xs">
            {t('deleteAccount')}
          </div>
        );

      default:
        return (
          <div className="px-1 py-1 flex justify-center items-center text-xs">
            {capitalizeWords(method)}
          </div>
        );
    }
  }

  useEffect(() => {
    function tokenInfo(view_access_key: string, account_id?: string) {
      return asyncFetch(`${config?.rpcUrl}`, {
        method: 'POST',
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 'dontcare',
          method: 'query',
          params: {
            request_type: 'view_access_key',
            finality: 'final',
            account_id: view_access_key,
            public_key: account_id,
          },
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      })
        .then((data: { body: { result: AccessInfo }; status: number }) => {
          const resp = data?.body?.result;
          if (data.status === 200) {
            setKeyInfo(resp);
          } else {
            handleRateLimit(data, () => tokenInfo(view_access_key, account_id));
          }
        })
        .catch(() => {});
    }

    if (accessKey.public_key && accessKey.permission_kind === 'FUNCTION_CALL') {
      tokenInfo(accessKey.account_id, accessKey.public_key);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config?.rpcUrl, accessKey]);

  return (
    <>
      <tr key={accessKey.public_key} className="hover:bg-blue-900/5">
        <td className="px-6 py-4 text-sm text-nearblue-600 ">
          {txn?.transaction_hash ? (
            <Tooltip.Provider>
              <Tooltip.Root>
                <Tooltip.Trigger asChild>
                  <span className="truncate max-w-[120px] inline-block align-bottom text-green-500 font-medium whitespace-nowrap">
                    <Link href={`/txns/${txn?.transaction_hash}`}>
                      <a className="text-green-500">
                        {txn?.transaction_hash && txn?.transaction_hash}
                      </a>
                    </Link>
                  </span>
                </Tooltip.Trigger>
                <Tooltip.Content
                  className="h-auto max-w-xs bg-black bg-opacity-90 z-10 text-white text-xs p-2 break-words"
                  sideOffset={5}
                >
                  {txn?.transaction_hash}
                </Tooltip.Content>
              </Tooltip.Root>
            </Tooltip.Provider>
          ) : (
            'Genesis'
          )}
        </td>
        <td className="pl-6 pr-2 py-4 text-sm text-nearblue-600  ">
          <Tooltip.Provider>
            <Tooltip.Root>
              <Tooltip.Trigger asChild>
                <span className="truncate max-w-[120px] inline-block align-bottom ">
                  {accessKey.public_key}
                </span>
              </Tooltip.Trigger>
              <Tooltip.Content
                className="h-auto max-w-xs bg-black bg-opacity-90 z-10 text-white text-xs p-2 break-words"
                sideOffset={5}
              >
                {accessKey.public_key}
              </Tooltip.Content>
            </Tooltip.Root>
          </Tooltip.Provider>
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-nearblue-600  flex justify-start">
          {accessKey.permission_kind === 'FUNCTION_CALL' ? (
            <div className="bg-blue-900/10 rounded px-4 h-6 flex items-center justify-center text-center text-xs">
              Limited
            </div>
          ) : (
            <div className="bg-blue-900/10 rounded px-4 h-6 flex items-center justify-center text-center text-xs">
              Full
            </div>
          )}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-nearblue-600 ">
          {keyInfo &&
            Object.keys(keyInfo).length !== 0 &&
            keyInfo?.permission?.FunctionCall?.receiver_id}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-nearblue-600  flex justify-start ">
          {keyInfo && keyInfo?.permission && (
            <div className="flex flex-col ">
              {keyInfo?.permission?.FunctionCall?.method_names.length > 0
                ? keyInfo?.permission?.FunctionCall?.method_names.map(
                    (method) => {
                      return <div key={method}>{showMethod(method)} </div>;
                    },
                  )
                : accessKey.permission_kind === 'FUNCTION_CALL'
                ? 'Any'
                : 'Full Access'}
            </div>
          )}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-nearblue-600 ">
          {keyInfo &&
            Object.keys(keyInfo).length !== 0 &&
            keyInfo?.permission?.FunctionCall?.allowance &&
            'Ⓝ ' +
              yoctoToNear(
                keyInfo?.permission?.FunctionCall?.allowance || '',
                true,
              )}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-nearblue-600 ">
          {action}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-nearblue-600 ">
          {txn?.block_timestamp ? (
            <Tooltip.Provider>
              <Tooltip.Root>
                <Tooltip.Trigger asChild>
                  <span>
                    {showWhen
                      ? txn?.block_timestamp
                        ? getTimeAgoString(nanoToMilli(txn?.block_timestamp))
                        : ''
                      : txn?.block_timestamp
                      ? formatTimestampToString(
                          nanoToMilli(txn?.block_timestamp),
                        )
                      : ''}
                  </span>
                </Tooltip.Trigger>
                <Tooltip.Content
                  className="h-auto max-w-xs bg-black bg-opacity-90 z-10 text-white text-xs p-2"
                  sideOffset={5}
                >
                  {!showWhen
                    ? txn?.block_timestamp
                      ? getTimeAgoString(nanoToMilli(txn?.block_timestamp))
                      : ''
                    : txn?.block_timestamp
                    ? formatTimestampToString(nanoToMilli(txn?.block_timestamp))
                    : ''}
                </Tooltip.Content>
              </Tooltip.Root>
            </Tooltip.Provider>
          ) : (
            'Genesis'
          )}
        </td>
      </tr>
    </>
  );
}
