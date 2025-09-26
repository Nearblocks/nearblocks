import { useTranslations } from 'next-intl';

import FaCode from '@/components/app/Icons/FaCode';
import { Link } from '@/i18n/routing';
import { hexy } from '@/utils/app/hexy';
import { TransactionActionInfo } from '@/utils/types';

import RlpTransaction from '@/components/app/Transactions/Receipts/RlpTransaction';
import { isValidJson, shortenAddress } from '@/utils/app/libs';
import { useEffect, useState } from 'react';
import FaMinimize from '@/components/app/Icons/FaMinimize';
import FaExpand from '@/components/app/Icons/FaExpand';
import Tooltip from '@/components/app/common/Tooltip';
import { encodeArgs } from '@/utils/app/near';
import { useRpcTrigger } from '@/components/app/common/RpcTriggerContext';
import { isEmpty } from 'lodash';

const FunctionCall = (props: TransactionActionInfo) => {
  const t = useTranslations();
  const { args, receiver, rpcAction } = props;
  const [viewMode, setViewMode] = useState<'auto' | 'raw'>('auto');
  const [isExpanded, setIsExpanded] = useState(false);
  const { setShouldFetchRpc } = useRpcTrigger();
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
    let decodedStr = '';
    if (typeof args === 'string') {
      try {
        decoded = Buffer.from(args, 'base64');
        decodedStr = decoded.toString();
      } catch (e) {
        decodedStr = args;
      }
    } else if (typeof args === 'object') {
      if (args.signed && Array.isArray(args.signed)) {
        return JSON.stringify(args, null, 2);
      } else if (args.payload) {
        try {
          const payload = atob(args.payload);
          return JSON.stringify(JSON.parse(payload), null, 2);
        } catch (e) {
          return JSON.stringify(args, null, 2);
        }
      } else {
        return JSON.stringify(args, null, 2);
      }
    }

    let pretty = '';
    if (isValidJson(decodedStr)) {
      try {
        const parsed = JSON.parse(decodedStr);
        const parsedWithNestedJSON = parseNestedJSON(parsed);
        pretty = JSON.stringify(parsedWithNestedJSON, null, 2);
      } catch (err) {
        // If JSON parsing fails, use hex representation
        pretty = hexy(decoded, { format: 'twos' });
      }
    } else {
      pretty = hexy(decoded, { format: 'twos' });
    }

    return pretty;
  }
  const isSubmit =
    args?.methodName === 'submit' || args?.method_name === 'submit';
  const isSubmitWithArgs =
    args?.methodName === 'submit_with_args' ||
    args?.method_name === 'submit_with_args';
  const isAuroraSubmit = isSubmit || isSubmitWithArgs;
  const modifiedData =
    isAuroraSubmit && receiver?.includes('aurora')
      ? { tx_bytes_b64: args.args_base64 || args.args }
      : args.args_base64 || args.args || encodeArgs(args?.args_json);

  const decodedData =
    args?.args_base64 || args?.args || encodeArgs(args?.args_json);
  const jsonStringifiedData = displayArgs(decodedData);
  const getRpcActionArg = () => {
    if (!rpcAction) return null;

    const targetMethod = args?.method_name || args?.methodName;

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

  const onRawClick = () => {
    setViewMode('raw');
    if (isEmpty(rpcActionArg)) {
      setShouldFetchRpc(true);
    } else {
      setShouldFetchRpc(false);
    }
  };

  useEffect(() => {
    if (rpcAction?.args?.args) {
      setShouldFetchRpc(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rpcAction?.args?.args]);
  return (
    <div className="py-1">
      <FaCode className="inline-flex text-yellow-500 mr-1" />
      {t ? t('txnDetails.actions.functionCall.0') : 'Called method'}
      <span className="font-bold mx-1">
        {args?.method_name || args?.methodName}
      </span>
      {t ? t('txnDetails.actions.functionCall.1') : 'in contract'}
      <Link
        href={`/address/${receiver}`}
        className="text-green-500 dark:text-green-250 font-bold hover:no-underline ml-1"
      >
        {shortenAddress(receiver)}
      </Link>
      {(args?.method_name || args?.methodName) === 'rlp_execute' ||
      (isAuroraSubmit && receiver?.includes('aurora')) ? (
        <RlpTransaction
          pretty={modifiedData}
          method={args?.method_name || args?.methodName}
          receiver={receiver}
        />
      ) : (
        <>
          <div className="relative w-full pt-1">
            <div className="absolute top-2 mt-1 sm:!mr-4 right-2 flex">
              <Tooltip
                className="whitespace-nowrap"
                tooltip={<span>Smart formatted view (pretty JSON)</span>}
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
              className={`block appearance-none outline-none w-full border rounded-lg bg-gray-100 dark:bg-black-200 dark:border-black-200 p-3 resize-y font-space-mono whitespace-pre-wrap overflow-auto max-w-full overflow-x-auto ${
                !isExpanded ? 'h-[8rem]' : ''
              }`}
            >
              {!actionLogData
                ? 'Loading...'
                : typeof actionLogData === 'object'
                ? JSON.stringify(actionLogData)
                : actionLogData}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default FunctionCall;
