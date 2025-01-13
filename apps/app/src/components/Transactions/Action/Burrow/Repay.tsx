import TokenInfo from '@/components/common/TokenInfo';
import FaRight from '@/components/Icons/FaRight';
import { shortenAddress } from '@/utils/libs';
import { DepositPropsInfo } from '@/utils/types';
import Link from 'next/link';
import { useRouter } from 'next/router';

const Repay = (props: DepositPropsInfo) => {
  const router = useRouter();
  const { hash } = router.query;

  const log = props.event?.[0];

  if (!log?.token_id || !log?.account_id || !log?.amount) return null;

  return (
    <div className="action flex flex-wrap items-center break-all leading-7">
      {props?.receiptId && hash ? (
        <Link
          href={`/txns/${hash}#execution#${props?.receiptId}`}
          className="cursor-pointer"
        >
          <FaRight className="inline-flex text-gray-400 dark:text-neargray-10 text-xs" />
        </Link>
      ) : (
        <FaRight className="inline-flex text-gray-400 dark:text-neargray-10 text-xs" />
      )}
      <span className="font-bold px-1">Repay </span>
      <TokenInfo contract={log?.token_id} amount={log?.amount} decimals={18} />
      <span className="font-bold text-gray px-1">
        From{' '}
        <Link
          href={`/address/${log?.account_id}`}
          className="text-green-500 dark:text-green-250 font-normal pl-1 hover:no-underline"
        >
          {shortenAddress(log?.account_id)}
        </Link>
      </span>
      <span className="font-bold text-gray px-1">
        On{' '}
        <Link
          href="/address/contract.main.burrow.near"
          className="text-green-500 dark:text-green-250 font-normal hover:no-underline"
        >
          Burrow
        </Link>
      </span>
    </div>
  );
};

export default Repay;
