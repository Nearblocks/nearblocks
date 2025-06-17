import { useParams } from 'next/navigation';

import TokenInfo from '@/components/app/common/TokenInfo';
import FaRight from '@/components/app/Icons/FaRight';
import { Link } from '@/i18n/routing';
import { EventPropsInfo } from '@/utils/types';

import { AddressOrTxnsLink } from '@/components/app/common/HoverContextProvider';

const Swap = (props: EventPropsInfo) => {
  const params = useParams();
  let log: RegExpMatchArray | null = null;

  if (typeof props?.event?.logs === 'string') {
    log = props.event.logs.match(/^Swapped (\d+) ([\S]+) for (\d+) ([\S]+)/);
  }
  if (!Array.isArray(log)) {
    return null;
  }
  const metaInfo1 = props?.tokenMetadata?.filter(
    (meta: any) => meta?.contractId === log?.[2],
  );

  const metaInfo2 = props?.tokenMetadata?.filter(
    (meta: any) => meta?.contractId === log?.[4].replace(/,$/, ''),
  );

  if (log?.length === 0) return null;
  return (
    <div className="action flex flex-wrap items-center break-all py-0.5">
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
      <TokenInfo amount={log[1]} contract={log[2]} metaInfo={metaInfo1} />
      <TokenInfo
        amount={log[3]}
        contract={log[4].replace(/,$/, '')}
        metaInfo={metaInfo2}
      />
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
