import { useParams } from 'next/navigation';

import TokenInfo from '@/components/app/common/TokenInfo';
import FaRight from '@/components/app/Icons/FaRight';
import { Link } from '@/i18n/routing';
import { DepositPropsInfo } from '@/utils/types';

import { AddressOrTxnsLink } from '@/components/app/common/HoverContextProvider';

const DescreaseCollateral = (props: DepositPropsInfo) => {
  const params = useParams();
  const log = props.event?.[0];
  const metaInfo = props?.tokenMetadata?.filter(
    (meta: any) => meta?.contractId === log?.token_id,
  );
  if (!log?.token_id || !log?.account_id || !log?.amount) return null;

  return (
    <div className="action flex flex-wrap items-center break-all py-0.5">
      {props?.receiptId && params?.hash ? (
        <Link href={`/txns/${params?.hash}?tab=execution#${props?.receiptId}`}>
          <FaRight className="inline-flex text-gray-400 dark:text-neargray-10 text-xs" />
        </Link>
      ) : (
        <FaRight className="inline-flex text-gray-400 dark:text-neargray-10 text-xs" />
      )}
      <span className="font-bold px-1">Decrease Collateral </span>
      <TokenInfo
        amount={log.amount}
        contract={log.token_id}
        metaInfo={metaInfo}
      />
      <span className="font-bold text-gray px-1 flex items-center">
        From <AddressOrTxnsLink currentAddress={log.account_id} />
      </span>
      <span className="font-bold text-gray px-1 flex items-center">
        On{' '}
        <AddressOrTxnsLink
          name="Burrow"
          currentAddress={'contract.main.burrow.near'}
        />
      </span>
    </div>
  );
};

export default DescreaseCollateral;
