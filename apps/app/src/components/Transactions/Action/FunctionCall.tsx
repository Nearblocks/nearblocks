import FaRight from '@/components/Icons/FaRight';
import { shortenAddress } from '@/utils/libs';
import { ActionPropsInfo } from '@/utils/types';
import { Tooltip } from '@reach/tooltip';
import Link from 'next/link';
import { useRouter } from 'next/router';

const FunctionCall = (props: ActionPropsInfo) => {
  const router = useRouter();
  const { hash } = router.query;

  return (
    <div className="action flex flex-wrap items-center break-all">
      {props?.action?.receiptId && hash ? (
        <Link
          href={`/txns/${hash}#execution#${props.action?.receiptId}`}
          className="cursor-pointer"
        >
          <FaRight className="inline-flex text-gray-400 dark:text-neargray-10 text-xs" />
        </Link>
      ) : (
        <FaRight className="inline-flex text-gray-400 dark:text-neargray-10 text-xs" />
      )}
      <span className="font-bold pl-1 py-0.5">
        Call
        <span className="font-normal pl-1">
          <Tooltip
            label={props.action.args.method_name}
            className="absolute top-0 left-0  h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2"
          >
            <span className="bg-blue-900/10 text-xs text-nearblue-600 dark:text-neargray-10 rounded-xl px-2 py-0.5 max-w-[240px] inline-flex truncate">
              <span className="block truncate">
                {props.action.args.method_name}
              </span>
            </span>
          </Tooltip>
        </span>
      </span>
      <span className="font-bold text-gray pl-1 py-0.5">
        By
        <Link
          href={`/address/${props.action.from}`}
          className="text-green-500 dark:text-green-250 font-normal pl-1 hover:no-underline"
        >
          {shortenAddress(props.action.from)}
        </Link>
      </span>
      <span className="font-bold text-gray pl-1 py-0.5">
        On
        <Link
          href={`/address/${props.action.to}`}
          className="text-green-500 dark:text-green-250 font-normal pl-1 hover:no-underline"
        >
          {shortenAddress(props.action.to)}
        </Link>
      </span>
    </div>
  );
};

export default FunctionCall;
