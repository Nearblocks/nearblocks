import { hexy } from '@/utils/hexy';
import { isValidJson, yoctoToNear } from '@/utils/libs';
import { ReceiptKindInfo } from '@/utils/types';
import RlpTransaction from './RlpTransaction';
import useTranslation from 'next-translate/useTranslation';
import FaTimesCircle from '@/components/Icons/FaTimesCircle';
import { useState } from 'react';
import FaMinimize from '@/components/Icons/FaMinimize';
import FaExpand from '@/components/Icons/FaExpand';

const backgroundColorClasses: Record<string, string> = {
  transfer: 'bg-green-50 dark:bg-green-200',
  stake: 'bg-cyan-50 dark:bg-cyan-900',
  deployContract: 'bg-orange-50 dark:bg-orange-900',
  addKey: 'bg-indigo-50 dark:bg-indigo-900',
  deleteKey: 'bg-red-50 dark:bg-red-900',
  functionCall: 'bg-blue-50 dark:bg-black-200',
  createAccount: 'bg-fuchsia-100 dark:bg-fuchsia-900',
  deleteAccount: 'bg-red-50 dark:bg-red-900',
  delegateAction: 'bg-blue-50 dark:bg-black-200',
};

const ReceiptKind = (props: ReceiptKindInfo) => {
  const { action, onClick, isTxTypeActive, receiver, receipt } = props;
  const { t } = useTranslation();
  const [viewMode, setViewMode] = useState<'auto' | 'raw'>('auto');
  const [isExpanded, setIsExpanded] = useState(false);

  const args = action?.args?.args;
  const modifiedData =
    action?.args?.methodName === 'submit' && receiver.includes('aurora')
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

  const decodedData = args;
  const jsonStringifiedData = displayArgs(decodedData);
  const actionLogData = viewMode === 'raw' ? decodedData : jsonStringifiedData;

  const status = receipt?.outcome?.status;
  const isSuccess =
    status &&
    (status.type === 'successValue' || status.type === 'successReceiptId');

  return (
    <div className="pb-3">
      <div
        className={`relative p-2 mr-3 min-h-25 rounded-md inline-flex items-center justify-center leading-5 cursor-pointer 
        transition-all ease-in-out 
        ${
          !isSuccess
            ? 'bg-red-50 dark:bg-black-200'
            : backgroundColorClasses[action.kind] || ''
        }`}
        onClick={onClick}
        role="button"
        tabIndex={0}
      >
        {action?.kind !== 'functionCall' &&
          action?.kind !== 'delegateAction' &&
          t(`txns:${action?.kind}`)}
        {action?.kind === 'delegateAction' ? (
          <div className="inline-flex text-sm">{`Delegate`}</div>
        ) : null}
        {action?.kind === 'functionCall' ? (
          <div className="inline-flex text-sm">{`'${action?.args?.methodName}'`}</div>
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
      {action?.kind === 'transfer' ? (
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
        action?.kind === 'functionCall' ? (
          action?.args?.methodName === 'rlp_execute' ||
          (action?.args?.methodName === 'submit' &&
            receiver.includes('aurora')) ? (
            <RlpTransaction
              pretty={modifiedData}
              method={action?.args?.methodName}
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
                  className={`block appearance-none outline-none w-full border rounded-lg bg-gray-100 dark:bg-black-200 dark:border-black-200 p-3 resize-y font-space-mono whitespace-pre-wrap overflow-auto max-w-full overflow-x-auto  ${
                    !isExpanded ? 'h-[8rem]' : ''
                  }`}
                >
                  {actionLogData}
                </div>
              </div>
            </>
          )
        ) : action?.kind === 'delegateAction' ? (
          <div className="pt-2">
            {[...action.args.actions]
              .sort(
                (actionA, actionB) =>
                  actionA.delegateIndex - actionB.delegateIndex,
              )
              .map((subaction) => (
                <ReceiptKind
                  key={subaction.delegateIndex}
                  action={subaction}
                  isTxTypeActive={true}
                  receiver={receiver}
                  receipt={receipt}
                />
              ))}
          </div>
        ) : null
      ) : null}
    </div>
  );
};
export default ReceiptKind;
