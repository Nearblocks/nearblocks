import { getConfig } from '@/includes/libs';
import { EventPropsInfo } from '@/includes/types';

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
  const config = getConfig(props.network);
  const log = props.event.logs?.match(
    /^Swapped (\d+) ([\S]+) for (\d+) ([\S]+)/,
  );

  if (log?.length !== 5) return null;

  return (
    <div className="flex flex-wrap items-center break-all leading-7">
      <FaRight className="inline-flex text-gray-400 text-xs" />
      <span className="font-bold px-1">Swap </span>
      {
        <Widget
          src={`${config.ownerId}/widget/bos-components.components.Shared.TokenInfo`}
          props={{ contract: log[2], amount: log[1] }}
        />
      }
      {
        <Widget
          src={`${config.ownerId}/widget/bos-components.components.Shared.TokenInfo`}
          props={{ contract: log[4], amount: log[3] }}
        />
      }
      <span className="font-bold text-gray px-1">
        On{' '}
        <a href="/address/v2.ref-finance.near" className="hover:no-underline">
          <a className="text-green-500 font-normal hover:no-underline">
            Ref Finance
          </a>
        </a>
      </span>
    </div>
  );
};

export default Swap;
