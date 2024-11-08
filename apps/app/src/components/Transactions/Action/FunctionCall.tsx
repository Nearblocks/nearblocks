import FaRight from '@/components/Icons/FaRight';
import { shortenAddress } from '@/utils/libs';
import { ActionPropsInfo } from '@/utils/types';
import { Tooltip } from '@reach/tooltip';
import Link from 'next/link';
import { useRouter } from 'next/router';

const FunctionCall = (props: ActionPropsInfo) => {
  const router = useRouter();
  const { hash } = router.query;

  const handleClick = () => {
    router.push(`/txns/${hash}#execution#${props.action?.receiptId}`);
  };

  return (
    <div className="action flex flex-wrap items-center break-all leading-7">
      {props?.action?.receiptId && hash ? (
        <span onClick={handleClick} className="cursor-pointer">
          <FaRight className="inline-flex text-gray-400 dark:text-neargray-10 text-xs" />
        </span>
      ) : (
        <FaRight className="inline-flex text-gray-400 dark:text-neargray-10 text-xs" />
      )}
      <span className="font-bold px-1">
        Call{' '}
        <span className="font-normal pl-1">
          <Tooltip
            label={props.action.args.method_name}
            className="absolute top-0 left-0  h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2"
          >
            <span className="bg-blue-900/10 text-xs text-nearblue-600 dark:text-neargray-10 rounded-xl px-2 py-1 max-w-[240px] inline-flex truncate">
              <span className="block truncate">
                {props.action.args.method_name}
              </span>
            </span>
          </Tooltip>
        </span>
      </span>
      <span className="font-bold text-gray px-1">
        By{' '}
        <Link
          href={`/address/${props.action.from}`}
          className="text-green-500 dark:text-green-250 font-normal pl-1 hover:no-underline"
        >
          {shortenAddress(props.action.from)}
        </Link>
      </span>
      <span className="font-bold text-gray px-1">
        On{' '}
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
