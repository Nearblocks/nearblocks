import FaRight from '@/components/Icons/FaRight';
import { yoctoToNear } from '@/utils/libs';
import { ActionPropsInfo } from '@/utils/types';
import Link from 'next/link';
import { useRouter } from 'next/router';

const Stake = (props: ActionPropsInfo) => {
  const router = useRouter();
  const { hash } = router.query;

  return (
    <div className="action flex flex-wrap items-center break-all leading-7">
      {props?.action?.receiptId && hash ? (
        <Link
          href={`/txns/${hash}#execution#${props.action?.receiptId}`}
          className="cursor-pointer"
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
