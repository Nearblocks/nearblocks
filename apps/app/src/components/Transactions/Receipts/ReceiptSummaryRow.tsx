import { Tooltip } from '@reach/tooltip';
import Big from 'big.js';
import { Fragment } from 'react';

import TxnsReceiptStatus from '@/components/common/TxnsReceiptStatus';
import FaLongArrowAltRight from '@/components/Icons/FaLongArrowAltRight';
import { Link } from '@/i18n/routing';
import { networkId } from '@/utils/config';
import { convertToMetricPrefix, fiatValue, yoctoToNear } from '@/utils/libs';
import {
  Action,
  FunctionCallActionView,
  ReceiptsPropsInfo,
  TransactionInfo,
} from '@/utils/types';

interface Props {
  borderFlag?: boolean;
  receipt: any | ReceiptsPropsInfo;
  statsData: {
    stats: Array<{
      near_price: string;
    }>;
  };
  txn: TransactionInfo;
}

const ReceiptSummaryRow = (props: Props) => {
  const { receipt, statsData, txn } = props;

  const currentPrice = statsData?.stats?.[0]?.near_price || 0;

  function formatActionKind(actionKind: string) {
    return actionKind && actionKind?.replace(/([a-z])([A-Z])/g, '$1 $2');
  }

  const getGasAttached = (actions: Action[]): string => {
    const gasAttached =
      actions &&
      actions
        .map((action) => action.args)
        .filter(
          (args): args is FunctionCallActionView['FunctionCall'] =>
            'gas' in args,
        );

    if (gasAttached.length === 0) {
      return '0';
    }

    return gasAttached.reduce(
      (acc, args) =>
        Big(acc || '0')
          .plus(args.gas)
          .toString(),
      '0',
    );
  };

  let gasAttached = receipt?.actions ? getGasAttached(receipt?.actions) : '0';

  const status = receipt?.outcome?.status;
  const isSuccess =
    status &&
    (('SuccessValue' in status &&
      status?.SuccessValue !== null &&
      status?.SuccessValue !== undefined) ||
      'SuccessReceiptId' in status);

  return (
    <>
      {receipt &&
        receipt?.actions?.map((action: any, i: number) => (
          <tr key={action?.args?.method_name + i}>
            <td className="pl-6 py-4 text-sm text-nearblue-600 dark:text-neargray-10 font-medium whitespace-nowrap">
              <TxnsReceiptStatus status={isSuccess} />
            </td>
            <td className="px-6 py-4 text-sm text-nearblue-600 dark:text-neargray-10 font-medium whitespace-nowrap">
              <Tooltip
                className="absolute h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2 break-words"
                label={receipt?.id}
              >
                <Link
                  className={`truncate max-w-[120px] inline-block text-green-500 dark:text-green-250 hover:no-underline whitespace-nowrap`}
                  href={`#execution#${receipt?.id}`}
                >
                  {' '}
                  {receipt?.id}
                </Link>
              </Tooltip>
            </td>
            <td className="px-6 py-4 text-sm text-nearblue-600 dark:text-neargray-10 font-medium whitespace-nowrap">
              {formatActionKind(action?.action_kind)}
            </td>
            <td className="px-4 py-4 text-sm text-nearblue-600 dark:text-neargray-10 font-medium whitespace-nowrap">
              {action?.args?.method_name}
            </td>
            <td className="px-4 py-4 text-sm text-nearblue-600 dark:text-neargray-10 font-medium">
              {receipt?.predecessor_id ? (
                <div className="word-break">
                  <Link
                    className="text-green-500 dark:text-green-250 hover:no-underline inline-block truncate max-w-[120px]"
                    href={`/address/${receipt?.predecessor_id}`}
                  >
                    {receipt?.predecessor_id}
                  </Link>
                </div>
              ) : (
                ''
              )}
            </td>
            <td>
              {' '}
              <div className="w-5 h-5 p-1 bg-green-100 rounded-full text-center flex justify-center items-center mx-auto text-white">
                <FaLongArrowAltRight />
              </div>
            </td>
            <td className="px-4 py-4 text-sm text-nearblue-600 dark:text-neargray-10 font-medium">
              {receipt?.receiver_id ? (
                <div className="word-break">
                  <Link
                    className="text-green-500 dark:text-green-250 hover:no-underline inline-block truncate max-w-[120px]"
                    href={`/address/${receipt?.receiver_id}`}
                  >
                    {receipt?.receiver_id}
                  </Link>
                </div>
              ) : (
                ''
              )}
            </td>

            <td className="px-4 py-4 text-sm text-nearblue-600 dark:text-neargray-10 font-medium whitespace-nowrap">
              <span>
                {action?.args?.deposit
                  ? yoctoToNear(action?.args?.deposit, true)
                  : action?.args?.deposit ?? '0'}{' '}
                Ⓝ
                {currentPrice && networkId === 'mainnet'
                  ? ` ($${fiatValue(
                      yoctoToNear(action?.args?.deposit ?? 0, false),
                      currentPrice,
                    )})`
                  : ''}
              </span>
            </td>
            <td className="px-4 py-4 text-sm text-nearblue-600 dark:text-neargray-10 font-medium whitespace-nowrap">{`${
              gasAttached !== '0' ? convertToMetricPrefix(gasAttached) : '0 '
            }gas`}</td>
          </tr>
        ))}

      {receipt?.outcome?.outgoing_receipts?.length > 0 && (
        <>
          {receipt?.outcome?.outgoing_receipts?.map((rcpt: any) => (
            <Fragment key={rcpt?.receipt_id}>
              <ReceiptSummaryRow
                borderFlag={true}
                receipt={rcpt}
                statsData={statsData}
                txn={txn}
              />
            </Fragment>
          ))}
        </>
      )}
    </>
  );
};
export default ReceiptSummaryRow;
