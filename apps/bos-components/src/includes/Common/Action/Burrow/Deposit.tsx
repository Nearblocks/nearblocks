import { DepositPropsInfo } from '@/includes/types';

const Deposit = (props: DepositPropsInfo) => {
  const { shortenAddress } = VM.require(
    `${props.ownerId}/widget/includes.Utils.libs`,
  );
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
  const log = props.event?.[0];

  if (!log?.token_id || !log?.account_id || !log?.amount) return null;

  return (
    <div className="action flex flex-wrap items-center break-all leading-7">
      <FaRight className="inline-flex text-gray-400 dark:text-neargray-10 text-xs" />
      <span className="font-bold px-1">Deposit </span>
      {
        <Widget
          src={`${props.ownerId}/widget/bos-components.components.Shared.TokenInfo`}
          props={{
            contract: log.token_id,
            amount: log.amount,
            ownerId: props.ownerId,
            network: props.network,
            decimals: 18,
          }}
        />
      }
      <span className="font-bold text-gray px-1">
        From{' '}
        <a href={`/address/${log.account_id}`} className="hover:no-underline">
          <a className="text-green-500 dark:text-green-250 font-normal pl-1 hover:no-underline">
            {shortenAddress(log.account_id)}
          </a>
        </a>
      </span>
      <span className="font-bold text-gray px-1">
        On{' '}
        <a
          href="/address/contract.main.burrow.near"
          className="hover:no-underline"
        >
          <a className="text-green-500 dark:text-green-250 font-normal hover:no-underline">
            Burrow
          </a>
        </a>
      </span>
    </div>
  );
};

export default Deposit;
