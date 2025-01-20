import { useParams } from 'next/navigation';

import TokenInfo from '@/components/app/common/TokenInfo';
import FaRight from '@/components/app/Icons/FaRight';
import { Link } from '@/i18n/routing';
import { EventPropsInfo } from '@/utils/types';

import { AddressOrTxnsLink } from '@/components/app/common/HoverContextProvider';

const Swap = (props: EventPropsInfo) => {
  const params = useParams();
  const log = props.event.logs?.match(
    /^Swapped (\d+) ([\S]+) for (\d+) ([\S]+)/,
  );
  if (!Array.isArray(log)) {
    return null;
  }

  if (log?.length === 0) return null;

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
      <span className="font-bold px-1">Swap </span>
      <TokenInfo amount={log[1]} contract={log[2]} />
      <TokenInfo amount={log[3]} contract={log[4].replace(/,$/, '')} />
      <span className="font-bold text-gray px-1 flex items-center">
        On
        <AddressOrTxnsLink
          name="Ref Finance"
          currentAddress={'v2.ref-finance.near'}
        />
      </span>
    </div>
  );
};

export default Swap;
