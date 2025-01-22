import { useTranslations } from 'next-intl';

import FaCode from '@/components/app/Icons/FaCode';
import { Link } from '@/i18n/routing';
import { hexy } from '@/utils/app/hexy';
import { TransactionActionInfo } from '@/utils/types';

import RlpTransaction from '../RlpTransaction';
import { isValidJson, shortenAddress } from '@/utils/app/libs';
import { useState } from 'react';
import FaMinimize from '@/components/app/Icons/FaMinimize';
import FaExpand from '@/components/app/Icons/FaExpand';

const FunctionCall = (props: TransactionActionInfo) => {
  const t = useTranslations();
  const { args, receiver } = props;
  const [viewMode, setViewMode] = useState<'auto' | 'raw'>('auto');
  const [isExpanded, setIsExpanded] = useState(false);

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
      return '';
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

  const modifiedData =
    args?.method_name === 'submit' && receiver.includes('aurora')
      ? { tx_bytes_b64: args.args_base64 || args.args }
      : args.args_base64 || args.args;

  const decodedData = args?.args_base64 || args?.args;
  const jsonStringifiedData = displayArgs(decodedData);
  const actionLogData = viewMode === 'raw' ? decodedData : jsonStringifiedData;

  return (
    <div className="py-1">
      <FaCode className="inline-flex text-yellow-500 mr-1" />
      {t ? t('txnDetails.actions.functionCall.0') : 'Called method'}
      <span className="font-bold ml-1">{args?.method_name}</span>
      {t ? t('txnDetails.actions.functionCall.1') : 'in contract'}
      <Link
        href={`/address/${receiver}`}
        className="text-green-500 dark:text-green-250 font-bold hover:no-underline ml-1"
      >
        {shortenAddress(receiver)}
      </Link>
      {args?.method_name === 'rlp_execute' ||
      (args?.method_name === 'submit' && receiver.includes('aurora')) ? (
        <RlpTransaction
          pretty={modifiedData}
          method={args?.method_name}
          receiver={receiver}
        />
      ) : (
        <>
          <div className="relative w-full pt-1">
            <div className="absolute top-2 mt-1 sm:!mr-4 right-2 flex">
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
              <button
                onClick={() => setViewMode('raw')}
                className={`px-3 py-1 rounded-r-lg text-sm ${
                  viewMode === 'raw'
                    ? 'bg-gray-500 text-white'
                    : 'bg-gray-200 dark:bg-black-300 text-gray-700 dark:text-neargray-10'
                }`}
              >
                Raw
              </button>
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
              {actionLogData}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default FunctionCall;
