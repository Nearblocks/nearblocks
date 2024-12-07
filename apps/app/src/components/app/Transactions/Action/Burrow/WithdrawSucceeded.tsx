import { useParams } from 'next/navigation';

import AddressLink from '@/components/app/common/AddressLink';
import TokenInfo from '@/components/app/common/TokenInfo';
import FaRight from '@/components/app/Icons/FaRight';
import { Link } from '@/i18n/routing';
import { DepositPropsInfo } from '@/utils/types';

import { useActionContext } from '../ActionContext';

const WithdrawSucceeded = (props: DepositPropsInfo) => {
  const { address, handleMouseLeave, onHandleMouseOver } = useActionContext();
  const params = useParams();
  const log = props.event?.[0];

  if (!log?.token_id || !log?.account_id || !log?.amount) return null;

  return (
    <div className="action flex flex-wrap items-center break-all leading-7">
      {props?.receiptId && params?.hash ? (
        <Link href={`/txns/${params?.hash}?tab=execution#${props?.receiptId}`}>
          <FaRight className="inline-flex text-gray-400 text-xs" />
        </Link>
      ) : (
        <FaRight className="inline-flex text-gray-400 text-xs" />
      )}
      <span className="font-bold px-1">Withdraw </span>
      <TokenInfo amount={log.amount} contract={log.token_id} decimals={18} />
      <span className="font-bold text-gray px-1">
        To{' '}
        <AddressLink
          address={address}
          currentAddress={log.account_id}
          onMouseLeave={handleMouseLeave}
          onMouseOver={onHandleMouseOver}
        />
      </span>
      <span className="font-bold text-gray px-1">
        On{' '}
        <AddressLink
          address={address}
          currentAddress={'contract.main.burrow.near'}
          name="Burrow"
          onMouseLeave={handleMouseLeave}
          onMouseOver={onHandleMouseOver}
        />
      </span>
    </div>
  );
};

export default WithdrawSucceeded;
