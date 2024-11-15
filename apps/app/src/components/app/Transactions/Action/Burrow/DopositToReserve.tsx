import { useParams } from 'next/navigation';

import TokenInfo from '@/components/common/TokenInfo';
import FaRight from '@/components/Icons/FaRight';
import { Link } from '@/i18n/routing';
import { shortenAddress } from '@/utils/libs';
import { DepositPropsInfo } from '@/utils/types';

const DepositToReserve = (props: DepositPropsInfo) => {
  const params = useParams();
  const log = props.event?.[0];

  if (!log?.token_id || !log?.account_id || !log?.amount) return null;

  return (
    <div className="action flex flex-wrap items-center break-all leading-7">
      {props?.receiptId && params?.hash ? (
        <Link href={`/txns/${params?.hash}?tab=execution#${props?.receiptId}`}>
          <FaRight className="inline-flex text-gray-400 dark:text-neargray-10 text-xs" />
        </Link>
      ) : (
        <FaRight className="inline-flex text-gray-400 dark:text-neargray-10 text-xs" />
      )}
      <span className="font-bold px-1">Deposit To Reserve </span>
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

export default DepositToReserve;
