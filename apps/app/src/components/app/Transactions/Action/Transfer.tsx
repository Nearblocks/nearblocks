import { useParams } from 'next/navigation';

import AddressLink from '@/components/app/common/AddressLink';
import { Link } from '@/i18n/routing';
import { yoctoToNear } from '@/utils/libs';
import { ActionPropsInfo } from '@/utils/types';

import FaRight from '../../Icons/FaRight';
import { useActionContext } from './ActionContext';

const Transfer = (props: ActionPropsInfo) => {
  const params = useParams();
  const { address, handleMouseLeave, onHandleMouseOver } = useActionContext();

  return (
    <div className="action flex flex-wrap items-center break-all leading-7">
      {props?.action?.receiptId && params?.hash ? (
        <Link
          href={`/txns/${params?.hash}?tab=execution#${props?.action?.receiptId}`}
        >
          <FaRight className="inline-flex text-gray-400 dark:text-neargray-10 text-xs" />
        </Link>
      ) : (
        <FaRight className="inline-flex text-gray-400 dark:text-neargray-10 text-xs" />
      )}
      <span className="font-bold px-1">
        Transfer{' '}
        <span className="font-normal pl-1">
          {yoctoToNear(props.action.args.deposit, true)} Ⓝ
        </span>
      </span>
      <span className="font-bold text-gray px-1">
        From{' '}
        <AddressLink
          address={address}
          currentAddress={props.action.from}
          onMouseLeave={handleMouseLeave}
          onMouseOver={onHandleMouseOver}
        />
      </span>
      <span className="font-bold text-gray">
        To{' '}
        <AddressLink
          address={address}
          currentAddress={props.action.to}
          onMouseLeave={handleMouseLeave}
          onMouseOver={onHandleMouseOver}
        />
      </span>
    </div>
  );
};

export default Transfer;
