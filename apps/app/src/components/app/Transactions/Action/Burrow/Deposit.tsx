import { useParams } from 'next/navigation';

import TokenInfo from '@/components/app/common/TokenInfo';
import FaRight from '@/components/app/Icons/FaRight';
import { Link } from '@/i18n/routing';
import { DepositPropsInfo } from '@/utils/types';

import { AddressOrTxnsLink } from '@/components/app/common/HoverContextProvider';

const Deposit = (props: DepositPropsInfo) => {
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
      <span className="font-bold px-1">Deposit </span>
      <TokenInfo amount={log.amount} contract={log.token_id} decimals={18} />
      <span className="font-bold text-gray px-1 flex items-center">
        From{' '}
        <AddressOrTxnsLink
          className="h-6 flex items-center ml-1"
          currentAddress={log?.account_id}
        />
      </span>
      <span className="font-bold text-gray px-1 flex items-center">
        On{' '}
        <AddressOrTxnsLink
          className="h-6 flex items-center ml-1"
          name="Burrow"
          currentAddress={log?.account_id}
        />
      </span>
    </div>
  );
};

export default Deposit;
