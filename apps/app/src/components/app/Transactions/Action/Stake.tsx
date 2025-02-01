import { useParams } from 'next/navigation';

import { Link } from '@/i18n/routing';
import { yoctoToNear } from '@/utils/libs';
import { ActionPropsInfo } from '@/utils/types';

import FaRight from '../../Icons/FaRight';

const Stake = (props: ActionPropsInfo) => {
  const params = useParams();
  return (
    <div className="action flex flex-wrap items-center break-all">
      {props?.action?.receiptId && params?.hash ? (
        <Link
          href={`/txns/${params?.hash}?tab=execution#${props?.action?.receiptId}`}
        >
          <FaRight className="inline-flex text-gray-400 text-xs" />
        </Link>
      ) : (
        <FaRight className="inline-flex text-gray-400 text-xs" />
      )}
      <span className="font-bold px-1">
        Stake{' '}
        <span className="font-normal pl-1">
          {yoctoToNear(props.action.args.stake, true)} Ⓝ
        </span>
      </span>
    </div>
  );
};

export default Stake;
