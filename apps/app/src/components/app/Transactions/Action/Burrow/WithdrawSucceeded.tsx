import { useParams } from 'next/navigation';

import TokenInfo from '@/components/app/common/TokenInfo';
import FaRight from '@/components/app/Icons/FaRight';
import { Link } from '@/i18n/routing';
import { DepositPropsInfo } from '@/utils/types';

import { AddressOrTxnsLink } from '@/components/app/common/HoverContextProvider';

const WithdrawSucceeded = (props: DepositPropsInfo) => {
  const params = useParams();
  const log = props.event?.[0];

  if (!log?.token_id || !log?.account_id || !log?.amount) return null;

  return (
    <div className="action flex flex-wrap items-center break-all py-0.5">
      {props?.receiptId && params?.hash ? (
        <Link href={`/txns/${params?.hash}?tab=execution#${props?.receiptId}`}>
          <FaRight className="inline-flex text-gray-400 text-xs" />
        </Link>
      ) : (
        <FaRight className="inline-flex text-gray-400 text-xs" />
      )}
      <span className="font-bold px-1">Withdraw </span>
      <TokenInfo amount={log.amount} contract={log.token_id} decimals={18} />
      <span className="font-bold text-gray px-1 flex items-center">
        To <AddressOrTxnsLink currentAddress={log?.account_id} />
      </span>
      <span className="font-bold text-gray px-1 flex items-center">
        On
        <AddressOrTxnsLink
          name="Burrow"
          currentAddress={'contract.main.burrow.near'}
        />
      </span>
    </div>
  );
};

export default WithdrawSucceeded;
