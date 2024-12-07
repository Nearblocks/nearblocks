import { Tooltip } from '@reach/tooltip';
import { useParams } from 'next/navigation';

import AddressLink from '@/components/app/common/AddressLink';
import { Link } from '@/i18n/routing';
import { ActionPropsInfo } from '@/utils/types';

import FaRight from '../../Icons/FaRight';
import { useActionContext } from './ActionContext';

const FunctionCall = (props: ActionPropsInfo) => {
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
        Call{' '}
        <span className="font-normal pl-1">
          <Tooltip
            className="absolute top-0 left-0  h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2"
            label={props.action.args.method_name}
          >
            <span className="bg-blue-900/10 text-xs text-nearblue-600 dark:text-neargray-10 rounded-xl px-2 py-1 max-w-[240px] inline-flex truncate">
              <span className="block truncate">
                {props.action.args.method_name}
              </span>
            </span>
          </Tooltip>
        </span>
      </span>
      <span className="font-bold text-gray px-1">
        By{' '}
        <AddressLink
          address={address}
          currentAddress={props.action.from}
          onMouseLeave={handleMouseLeave}
          onMouseOver={onHandleMouseOver}
        />
      </span>
      <span className="font-bold text-gray">
        On{' '}
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

export default FunctionCall;
