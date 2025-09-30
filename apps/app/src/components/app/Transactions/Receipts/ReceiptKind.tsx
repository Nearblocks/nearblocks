import { useTranslations } from 'next-intl';

import { hexy } from '@/utils/app/hexy';
import { yoctoToNear } from '@/utils/libs';
import { ReceiptKindInfo } from '@/utils/types';

import FaTimesCircle from '@/components/app/Icons/FaTimesCircle';
import RlpTransaction from '@/components/app/Transactions/Receipts/RlpTransaction';
import { useEffect, useState } from 'react';
import { isValidJson } from '@/utils/app/libs';
import FaMinimize from '@/components/app/Icons/FaMinimize';
import FaExpand from '@/components/app/Icons/FaExpand';
import Tooltip from '@/components/app/common/Tooltip';
import { displayGlobalContractArgs, encodeArgs } from '@/utils/app/near';
import { useRpcTrigger } from '@/components/app/common/RpcTriggerContext';
import { isEmpty } from 'lodash';

const backgroundColorClasses: Record<string, string> = {
  addKey: 'bg-indigo-50 dark:bg-indigo-900',
  ADD_KEY: 'bg-indigo-50 dark:bg-indigo-900',
  createAccount: 'bg-fuchsia-100 dark:bg-fuchsia-900',
  CREATE_ACCOUNT: 'bg-fuchsia-100 dark:bg-fuchsia-900',
  delegateAction: 'bg-blue-50 dark:bg-black-200',
  DELEGATE_ACTION: 'bg-blue-50 dark:bg-black-200',
  deleteAccount: 'bg-red-50 dark:bg-red-900',
  DELETE_ACCOUNT: 'bg-red-50 dark:bg-red-900',
  deleteKey: 'bg-red-50 dark:bg-red-900',
  DELETE_KEY: 'bg-red-50 dark:bg-red-900',
  deployContract: 'bg-orange-50 dark:bg-orange-900',
  DEPLOY_CONTRACT: 'bg-orange-50 dark:bg-orange-900',
  DEPLOY_GLOBAL_CONTRACT: 'bg-orange-50 dark:bg-orange-900',
  DeployGlobalContract: 'bg-orange-50 dark:bg-orange-900',
  DEPLOY_GLOBAL_CONTRACT_BY_ACCOUNT_ID: 'bg-orange-50 dark:bg-orange-900',
  DeployGlobalContractByAccountId: 'bg-orange-50 dark:bg-orange-900',
  USE_GLOBAL_CONTRACT: 'bg-orange-50 dark:bg-orange-900',
  UseGlobalContract: 'bg-orange-50 dark:bg-orange-900',
  USE_GLOBAL_CONTRACT_BY_ACCOUNT_ID: 'bg-orange-50 dark:bg-orange-900',
  UseGlobalContractByAccountId: 'bg-orange-50 dark:bg-orange-900',
  functionCall: 'bg-blue-50 dark:bg-black-200',
  FUNCTION_CALL: 'bg-blue-50 dark:bg-black-200',
  stake: 'bg-cyan-50 dark:bg-cyan-900',
  STAKE: 'bg-cyan-50 dark:bg-cyan-900',
  transfer: 'bg-green-50 dark:bg-green-200',
  TRANSFER: 'bg-green-50 dark:bg-green-200',
};

const ReceiptKind = (props: ReceiptKindInfo) => {
  const {
    action,
    isTxTypeActive,
    onClick,
    receipt,
    receiver,
    polledAction,
    rpcAction,
  } = props;
  const t = useTranslations();
  const [viewMode, setViewMode] = useState<'auto' | 'raw'>('auto');
  const [isExpanded, setIsExpanded] = useState(false);
  const { setShouldFetchRpc } = useRpcTrigger();

  const args =
    polledAction?.args?.args ||
    encodeArgs(polledAction?.args?.args_json) ||
    polledAction.args.args_base64 ||
    polledAction?.args;

  const methodName = action?.args?.method_name || action?.args?.methodName;

  const isSubmitOrRlp = ['rlp_execute', 'submit', 'submit_with_args'].includes(
    methodName,
  );

  const isAuroraSubmit =
    ['submit', 'submit_with_args'].includes(methodName) &&
    receiver === 'aurora';

  const modifiedData = isAuroraSubmit
    ? { tx_bytes_b64: action?.args.args_base64 || action?.args.args }
    : action?.args.args_base64 || action?.args.args;

  function parseNestedJSON(obj: any): any {
    if (typeof obj !== 'object' || obj === null) return obj;

    if (Array.isArray(obj)) {
      return obj.map((item) => parseNestedJSON(item));
    }

    const result: any = {};
    for (const key in obj) {
      if (typeof obj[key] === 'string') {
        try {
          result[key] = JSON.parse(atob(obj[key]));
        } catch {
          result[key] = obj[key];
        }
      } else if (typeof obj[key] === 'object') {
        result[key] = parseNestedJSON(obj[key]);
      } else {
        result[key] = obj[key];
      }
    }

    return result;
  }

  function displayArgs(args: any) {
    if (!args || typeof args === 'undefined') return 'The arguments are empty';

    let decoded;
    try {
      decoded = Buffer.from(args, 'base64');
    } catch (e) {
      return 'The arguments are empty';
    }

    let pretty = '';
    const decodedStr = decoded.toString();

    if (isValidJson(decodedStr)) {
      try {
        const parsed = JSON.parse(decodedStr);

        const parsedWithNestedJSON = parseNestedJSON(parsed);

        pretty = JSON.stringify(parsedWithNestedJSON, null, 2);
      } catch (err) {
        return '';
      }
    } else {
      pretty = hexy(decoded, { format: 'twos' });
    }

    return pretty;
  }

  const displayData = displayGlobalContractArgs(args);

  const decodedData = args;
  const jsonStringifiedData = displayArgs(decodedData);

  const getRpcActionArg = () => {
    if (!rpcAction) return null;

    const targetMethod = action?.args?.method_name || action?.args?.methodName;

    const matchingRpc = Array.isArray(rpcAction)
      ? rpcAction?.find((ra: any) => {
          const raMethod = ra?.args?.methodName || ra?.args?.method_name;
          return raMethod && targetMethod && raMethod === targetMethod;
        })
      : null;

    const chosen = matchingRpc || rpcAction?.[0];

    return chosen?.args?.args || chosen?.args?.actions?.[0]?.args?.args || null;
  };

  const rpcActionArg = getRpcActionArg();
  const actionLogData = viewMode === 'raw' ? rpcActionArg : jsonStringifiedData;
  const status = receipt?.outcome?.status;
  const isSuccess =
    status &&
    (status.type === 'successValue' ||
      status.type === 'successReceiptId' ||
      'SuccessValue' in status ||
      'SuccessReceiptId' in status);

  const isGlobalContractAction = (actionKind: string) => {
    const globalContractKinds = [
      'DEPLOY_GLOBAL_CONTRACT',
      'DeployGlobalContract',
      'DEPLOY_GLOBAL_CONTRACT_BY_ACCOUNT_ID',
      'DeployGlobalContractByAccountId',
      'USE_GLOBAL_CONTRACT',
      'UseGlobalContract',
      'USE_GLOBAL_CONTRACT_BY_ACCOUNT_ID',
      'UseGlobalContractByAccountId',
    ];
    return globalContractKinds.includes(actionKind);
  };

  const onRawClick = () => {
    setViewMode('raw');
    if (isEmpty(rpcActionArg)) {
      setShouldFetchRpc(true);
    } else {
      setShouldFetchRpc(false);
    }
  };

  useEffect(() => {
    if (rpcActionArg) {
      setShouldFetchRpc(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rpcActionArg]);
  return (
    <div className="pb-3">
      <div
        className={`relative p-2 mr-3 min-h-25 rounded-md inline-flex items-center justify-center leading-5 cursor-pointer 
        transition-all ease-in-out 
        ${
          !isSuccess
            ? 'bg-red-50 dark:bg-black-200'
            : backgroundColorClasses[action.action_kind] ||
              backgroundColorClasses[action?.kind] ||
              ''
        }`}
        onClick={onClick}
        role="button"
        tabIndex={0}
      >
        {action?.kind &&
        action?.kind !== 'functionCall' &&
        action?.kind !== 'delegateAction'
          ? t(`${action?.kind}`)
          : null}
        {action?.action_kind !== 'FUNCTION_CALL' &&
          action?.action_kind !== 'DELEGATE_ACTION' &&
          action?.action_kind}
        {action?.kind === 'delegateAction' ||
        action?.action_kind === 'DELEGATE_ACTION' ? (
          <div className="inline-flex text-sm">{`Delegate`}</div>
        ) : null}
        {action?.kind === 'functionCall' ||
        action?.action_kind === 'FUNCTION_CALL' ? (
          <div className="inline-flex text-sm">{`'${
            action?.args?.method_name || action?.args?.methodName
          }'`}</div>
        ) : null}
        {onClick ? (
          <div className="ml-2">{isTxTypeActive ? '-' : '+'}</div>
        ) : null}
        {!isSuccess && (
          <div className="absolute top-0 right-0 -mt-1 -mr-1">
            <FaTimesCircle />
          </div>
        )}
      </div>
      {action?.action_kind === 'TRANSFER' || action?.kind === 'transfer' ? (
        <div className="inline-flex justify-center">
          <span className="text-xs whitespace-nowrap">
            {action?.args?.deposit
              ? action?.args?.deposit &&
                yoctoToNear(action?.args?.deposit, false)
              : action?.args?.deposit ?? ''}
            Ⓝ
          </span>
        </div>
      ) : null}
      {isTxTypeActive ? (
        action?.kind === 'functionCall' ||
        action?.action_kind === 'FUNCTION_CALL' ? (
          isSubmitOrRlp || isAuroraSubmit ? (
            <RlpTransaction
              method={action?.args?.method_name || action?.args?.methodName}
              pretty={modifiedData}
              receiver={receiver}
            />
          ) : (
            <>
              <div className="relative w-full pt-1">
                <div className="absolute top-2 mt-1 sm:!mr-4 right-2 flex">
                  <Tooltip
                    className="whitespace-nowrap"
                    tooltip={<span>Human-readable</span>}
                  >
                    <button
                      onClick={() => setViewMode('auto')}
                      className={`px-3 py-1 rounded-l-lg text-sm ${
                        viewMode === 'auto'
                          ? 'bg-gray-500 text-white'
                          : 'bg-gray-200 dark:bg-black-300 text-gray-700 dark:text-neargray-10'
                      }`}
                    >
                      Auto
                    </button>
                  </Tooltip>
                  <Tooltip
                    className="whitespace-nowrap"
                    tooltip={<span>Original RPC args as sent to chain</span>}
                  >
                    <button
                      onClick={() => onRawClick()}
                      className={`px-3 py-1 rounded-r-lg text-sm ${
                        viewMode === 'raw'
                          ? 'bg-gray-500 text-white'
                          : 'bg-gray-200 dark:bg-black-300 text-gray-700 dark:text-neargray-10'
                      }`}
                    >
                      Raw
                    </button>
                  </Tooltip>
                  <button
                    onClick={() => setIsExpanded((prev) => !prev)}
                    className="bg-gray-700 dark:bg-gray-500 bg-opacity-10 hover:bg-opacity-100 group rounded-full p-1.5 w-7 h-7 ml-1.5"
                  >
                    {!isExpanded ? (
                      <FaMinimize className="fill-current -z-50 text-gray-700 dark:text-neargray-10 group-hover:text-white h-4 w-4" />
                    ) : (
                      <FaExpand className="fill-current -z-50 text-gray-700 dark:text-neargray-10 group-hover:text-white h-4 w-4" />
                    )}
                  </button>
                </div>
                <div
                  className={`block appearance-none outline-none w-full border rounded-lg bg-gray-100 dark:bg-black-200 dark:border-black-200 p-3 resize-y font-space-mono whitespace-pre-wrap overflow-auto max-w-full overflow-x-auto  ${
                    !isExpanded ? 'h-[8rem]' : ''
                  }`}
                >
                  {!actionLogData ? 'Loading...' : actionLogData}
                </div>
              </div>
            </>
          )
        ) : isGlobalContractAction(action?.kind || action?.action_kind) ? (
          <div className="relative w-full pt-1">
            <div className="absolute top-2 mt-1 sm:!mr-4 right-2 flex">
              <button
                onClick={() => setIsExpanded((prev) => !prev)}
                className="bg-gray-700 dark:bg-gray-500 bg-opacity-10 hover:bg-opacity-100 group rounded-full p-1.5 w-7 h-7 ml-1.5"
              >
                {!isExpanded ? (
                  <FaMinimize className="fill-current -z-50 text-gray-700 dark:text-neargray-10 group-hover:text-white h-4 w-4" />
                ) : (
                  <FaExpand className="fill-current -z-50 text-gray-700 dark:text-neargray-10 group-hover:text-white h-4 w-4" />
                )}
              </button>
            </div>
            <div
              className={`block appearance-none outline-none w-full border rounded-lg bg-gray-100 dark:bg-black-200 dark:border-black-200 p-3 resize-y font-space-mono whitespace-pre-wrap overflow-auto max-w-full overflow-x-auto  ${
                !isExpanded ? 'h-[8rem]' : ''
              }`}
            >
              {displayData}
            </div>
          </div>
        ) : action?.kind === 'delegateAction' ||
          action?.action_kind === 'DELEGATE_ACTION' ? (
          <div className="pt-2">
            {(polledAction?.args?.actions || [])
              .sort((actionA: any, actionB: any) => {
                return (
                  (actionA?.delegateIndex || 0) - (actionB?.delegateIndex || 0)
                );
              })
              .map((subaction: any, index: number) => (
                <ReceiptKind
                  action={subaction}
                  polledAction={subaction}
                  isTxTypeActive={true}
                  key={subaction.delegateIndex || index}
                  receipt={receipt}
                  receiver={receiver}
                  rpcAction={rpcAction}
                />
              ))}
          </div>
        ) : null
      ) : null}
    </div>
  );
};
export default ReceiptKind;
