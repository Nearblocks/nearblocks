import { Link } from '@/i18n/routing';
import { shortenAddress } from '@/utils/libs';
import { ActionPropsInfo } from '@/utils/types';
import { Tooltip } from '@reach/tooltip';

const FunctionCall = (props: ActionPropsInfo) => {
  const FaRight = (props: { className: string }) => {
    return (
      <svg
        stroke="currentColor"
        fill="currentColor"
        stroke-width="0"
        viewBox="0 0 192 512"
        className={props.className}
        height="1em"
        width="1em"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M0 384.662V127.338c0-17.818 21.543-26.741 34.142-14.142l128.662 128.662c7.81 7.81 7.81 20.474 0 28.284L34.142 398.804C21.543 411.404 0 402.48 0 384.662z"></path>
      </svg>
    );
  };
  return (
    <div className="action flex flex-wrap items-center break-all leading-7">
      <FaRight className="inline-flex text-gray-400 dark:text-neargray-10 text-xs" />
      <span className="font-bold px-1">
        Call{' '}
        <span className="font-normal pl-1">
          <Tooltip
            label={props?.action?.args?.method_name}
            className="absolute top-0 left-0  h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2"
          >
            <span className="bg-blue-900/10 text-xs text-nearblue-600 dark:text-neargray-10 rounded-xl px-2 py-1 max-w-[240px] inline-flex truncate">
              <span className="block truncate">
                {props?.action?.args?.method_name}
              </span>
            </span>
          </Tooltip>
        </span>
      </span>
      <span className="font-bold text-gray px-1">
        By{' '}
        <Link
          href={`/address/${props?.action?.from}`}
          className="text-green-500 dark:text-green-250 font-normal pl-1 hover:no-underline"
        >
          {shortenAddress(props?.action?.from)}
        </Link>
      </span>
      <span className="font-bold text-gray px-1">
        On{' '}
        <Link
          href={`/address/${props?.action?.to}`}
          className="text-green-500 dark:text-green-250 font-normal pl-1 hover:no-underline"
        >
          {shortenAddress(props?.action?.to)}
        </Link>
      </span>
    </div>
  );
};

export default FunctionCall;
