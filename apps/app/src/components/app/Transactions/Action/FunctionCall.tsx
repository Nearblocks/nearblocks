import { useParams } from 'next/navigation';

import { Link } from '@/i18n/routing';
import { ActionPropsInfo } from '@/utils/types';

import Tooltip from '@/components/app/common/Tooltip';
import FaRight from '@/components/app/Icons/FaRight';
import { AddressOrTxnsLink } from '@/components/app/common/HoverContextProvider';

const FunctionCall = (props: ActionPropsInfo) => {
  const params = useParams();

  return (
    <div className="action flex flex-wrap items-center break-">
      {props?.action?.receiptId && params?.hash ? (
        <Link
          href={`/txns/${params?.hash}?tab=execution#${props?.action?.receiptId}`}
        >
          <FaRight className="inline-flex text-gray-400 dark:text-neargray-10 text-xs" />
        </Link>
      ) : (
        <FaRight className="inline-flex text-gray-400 dark:text-neargray-10 text-xs" />
      )}
      <span className="font-bold px-1">
        Call
        <span className="font-normal pl-1">
          <Tooltip
            className={'left-1/2 ml-5 max-w-max'}
            position="bottom"
            tooltip={props.action.args.method_name}
          >
            <span className="bg-blue-900/10 text-xs text-nearblue-600 dark:text-neargray-10 rounded-xl px-2 py-0.5 max-w-[240px] inline-flex truncate">
              <span className="block truncate">
                {props.action.args.method_name}
              </span>
            </span>
          </Tooltip>
        </span>
      </span>
      <span className="font-bold text-gray px-1 flex items-center">
        By{' '}
        <AddressOrTxnsLink
          className="h-6 flex items-center ml-1"
          currentAddress={props.action.from}
        />
      </span>
      <span className="font-bold text-gray flex items-center">
        On{' '}
        <AddressOrTxnsLink
          className="h-6 flex items-center ml-1"
          currentAddress={props.action.to}
        />
      </span>
    </div>
  );
};

export default FunctionCall;
