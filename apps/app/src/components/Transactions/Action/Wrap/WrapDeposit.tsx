import TokenInfo from '@/components/common/TokenInfo';
import { EventPropsInfo } from '@/utils/types';

const WrapDeposit = (props: EventPropsInfo) => {
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

  const log = props.event.logs?.match(/^Deposit (\d+) NEAR to ([\S]+)/);

  if (log?.length !== 3) return null;

  return (
    <div className="action flex flex-wrap items-center break-all leading-7">
      <FaRight className="inline-flex text-gray-400 text-xs" />
      <span className="font-bold px-1">Mint </span>

      <TokenInfo contract={props.event.contract} amount={log[1]} />
    </div>
  );
};

export default WrapDeposit;
