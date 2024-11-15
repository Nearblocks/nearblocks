import { useParams } from 'next/navigation';

import TokenInfo from '@/components/common/TokenInfo';
import FaRight from '@/components/Icons/FaRight';
import { Link } from '@/i18n/routing';
import { EventPropsInfo } from '@/utils/types';

const WrapDeposit = (props: EventPropsInfo) => {
  const params = useParams();
  const log = props.event.logs?.match(/^Deposit (\d+) NEAR to ([\S]+)/);

  if (log?.length !== 3) return null;

  return (
    <div className="action flex flex-wrap items-center break-all leading-7">
      {props?.event?.receiptId && params?.hash ? (
        <Link
          href={`/txns/${params?.hash}?tab=execution#${props?.event?.receiptId}`}
        >
          <FaRight className="inline-flex text-gray-400 text-xs" />
        </Link>
      ) : (
        <FaRight className="inline-flex text-gray-400 text-xs" />
      )}
      <span className="font-bold px-1">Mint </span>
      <TokenInfo amount={log[1]} contract={props.event.contract} />
    </div>
  );
};

export default WrapDeposit;
