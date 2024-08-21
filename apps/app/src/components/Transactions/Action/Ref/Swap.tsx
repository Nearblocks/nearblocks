import TokenInfo from '@/components/common/TokenInfo';
import { EventPropsInfo } from '@/utils/types';
import Link from 'next/link';

const Swap = (props: EventPropsInfo) => {
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
  const log = props.event.logs?.match(
    /^Swapped (\d+) ([\S]+) for (\d+) ([\S]+)/,
  );
  if (!Array.isArray(log)) {
    return null;
  }

  if (log?.length === 0) return null;

  return (
    <div className="action flex flex-wrap items-center break-all leading-7">
      <FaRight className="inline-flex text-gray-400 text-xs" />
      <span className="font-bold px-1">Swap </span>
      <TokenInfo contract={log[2]} amount={log[1]} />
      <TokenInfo contract={log[4].replace(/,$/, '')} amount={log[3]} />
      <span className="font-bold text-gray px-1">
        On{' '}
        <Link
          href="/address/v2.ref-finance.near"
          className="text-green-500 dark:text-green-250 font-normal hover:no-underline"
        >
          Ref Finance
        </Link>
      </span>
    </div>
  );
};

export default Swap;
