import TokenInfo from '@/components/common/TokenInfo';
import { Link } from '@/i18n/routing';
import { shortenAddress } from '@/utils/libs';
import { DepositPropsInfo } from '@/utils/types';

const DescreaseCollateral = (props: DepositPropsInfo) => {
  const FaRight = (props: { className: string }) => {
    return (
      <svg
        className={props.className}
        fill="currentColor"
        height="1em"
        stroke="currentColor"
        stroke-width="0"
        viewBox="0 0 192 512"
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
      <span className="font-bold px-1">Decrease Collateral </span>

      <TokenInfo amount={log.amount} contract={log.token_id} decimals={18} />
      <span className="font-bold text-gray px-1">
        From{' '}
        <Link
          className="text-green-500 dark:text-green-250 font-normal pl-1 hover:no-underline"
          href={`/address/${log.account_id}`}
        >
          {shortenAddress(log.account_id)}
        </Link>
      </span>
      <span className="font-bold text-gray px-1">
        On{' '}
        <Link
          className="text-green-500 dark:text-green-250 font-normal hover:no-underline"
          href="/address/contract.main.burrow.near"
        >
          Burrow
        </Link>
      </span>
    </div>
  );
};

export default DescreaseCollateral;
