import Link from 'next/link';
import { AddressOrTxnsLink } from '../../common/HoverContextProvider';
import FaRight from '../../Icons/FaRight';
import Tooltip from '../../common/Tooltip';
import { yoctoToNear } from '@/utils/libs';

export default function ActionEvents({
  receiptId,
  index,
  hash,
  type,
  details,
  action,
}: {
  receiptId?: string;
  index?: number;
  hash?: string;
  type: string;
  details: any;
  action?: any;
}) {
  return (
    <div
      key={receiptId || index}
      className="action flex flex-wrap items-center gap-1 text-gray-800 dark:text-gray-200 py-1 px-2"
    >
      {receiptId && hash ? (
        <Link href={`/txns/${hash}?tab=execution#${receiptId}`}>
          <FaRight className="text-gray-400 dark:text-neargray-10 text-xs" />
        </Link>
      ) : (
        <FaRight className="text-gray-400 dark:text-neargray-10 text-xs" />
      )}

      {type === 'ADD_KEY' ? (
        <span className="text-sm">
          {details?.label}{' '}
          <Tooltip tooltip={details?.publicKey}>
            <span className="text-blue-600 cursor-pointer underline">
              {details?.publicKey}
            </span>
          </Tooltip>{' '}
          added for <AddressOrTxnsLink currentAddress={details?.to?.address} />{' '}
          with permission{' '}
          <span className="text-green-600 font-medium">
            {details?.permission}
          </span>
        </span>
      ) : (
        <>
          <span className="font-bold px-1">{details?.label || type}</span>

          {details?.methodName && (
            <span className="font-normal pl-1">
              <Tooltip
                className="left-1/2 ml-5 max-w-max"
                position="bottom"
                tooltip={details?.methodName}
              >
                <span className="bg-blue-900/10 text-xs text-nearblue-600 dark:text-neargray-10 rounded-xl px-2 py-0.5 max-w-[240px] truncate inline-flex">
                  <span className="block truncate">{details?.methodName}</span>
                </span>
              </Tooltip>
            </span>
          )}

          {details?.deposit && (
            <span className="font-normal pl-1">
              {isNaN(Number(details.deposit))
                ? details.deposit
                : `${yoctoToNear(details.deposit, true)} Ⓝ`}
            </span>
          )}

          {(details?.from?.address || action?.from) && (
            <span className="font-bold text-gray px-1 flex items-center">
              By{' '}
              <AddressOrTxnsLink
                className="h-6 flex items-center ml-1"
                currentAddress={details?.from?.address || action?.from}
              />
            </span>
          )}

          {(details?.to?.address || action?.to) && (
            <span className="font-bold text-gray flex items-center">
              On{' '}
              <AddressOrTxnsLink
                className="h-6 flex items-center ml-1"
                currentAddress={details?.to?.address || action?.to}
              />
            </span>
          )}
        </>
      )}
    </div>
  );
}
