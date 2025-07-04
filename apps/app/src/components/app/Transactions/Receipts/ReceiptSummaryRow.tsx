import Big from 'big.js';
import { Fragment } from 'react';

import { useConfig } from '@/hooks/app/useConfig';
import { Link } from '@/i18n/routing';
import { convertToMetricPrefix, fiatValue, yoctoToNear } from '@/utils/libs';
import {
  Action,
  FunctionCallActionView,
  ReceiptsPropsInfo,
  TransactionInfo,
} from '@/utils/types';

import Tooltip from '@/components/app/common/Tooltip';
import TxnsReceiptStatus from '@/components/app/common/TxnsReceiptStatus';
import FaLongArrowAltRight from '@/components/app/Icons/FaLongArrowAltRight';

interface Props {
  borderFlag?: boolean;
  price: string;
  receipt: any | ReceiptsPropsInfo;
  polledReceipt: any | ReceiptsPropsInfo;
  statsData: {
    stats: Array<{
      near_price: string;
    }>;
  };
  txn: TransactionInfo;
}

const ReceiptSummaryRow = (props: Props) => {
  const { networkId } = useConfig();

  const { price, receipt, statsData, txn, polledReceipt } = props;

  const currentPrice = statsData?.stats?.[0]?.near_price || 0;

  function formatActionKind(actionKind: string) {
    return actionKind.replace(/([a-z])([A-Z])/g, '$1 $2');
  }

  const getGasAttached = (actions: Action[]): string => {
    const gasAttached = actions
      .map((action) => action.args)
      .filter(
        (args): args is FunctionCallActionView['FunctionCall'] => 'gas' in args,
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

  let gasAttached = polledReceipt?.actions
    ? getGasAttached(receipt?.actions)
    : '0';

  const status = receipt?.outcome?.status;
  const isSuccess =
    status &&
    (('SuccessValue' in status &&
      status.SuccessValue !== null &&
      status.SuccessValue !== undefined) ||
      'SuccessReceiptId' in status);

  return (
    <>
      {polledReceipt &&
        polledReceipt?.actions?.map((action: any, i: number) => (
          <tr key={i}>
            <td className="pl-6 py-4 text-sm text-nearblue-600 dark:text-neargray-10 font-medium whitespace-nowrap">
              <TxnsReceiptStatus status={isSuccess} />
            </td>
            <td className="px-6 py-4 text-sm text-nearblue-600 dark:text-neargray-10 font-medium">
              <Tooltip
                className={'left-1/2 max-w-[200px]'}
                position="top"
                tooltip={receipt.receipt_id || receipt.id}
              >
                <Link
                  className={`truncate max-w-[120px] inline-block text-green-500 dark:text-green-250 hover:no-underline whitespace-nowrap`}
                  href={`?tab=execution#${receipt.receipt_id || receipt.id}`}
                >
                  {receipt.receipt_id || receipt.id}
                </Link>
              </Tooltip>
            </td>
            <td className="px-6 py-4 text-sm text-nearblue-600 dark:text-neargray-10 font-medium whitespace-nowrap">
              {formatActionKind(action.action_kind)}
            </td>
            <td className="px-4 py-4 text-sm text-nearblue-600 dark:text-neargray-10 font-medium whitespace-nowrap">
              {action.args?.method_name}
            </td>
            <td className="px-4 py-4 text-sm text-nearblue-600 dark:text-neargray-10 font-medium">
              {polledReceipt?.predecessor_id ? (
                <div className="word-break">
                  <Link
                    className="text-green-500 dark:text-green-250 hover:no-underline inline-block truncate max-w-[120px] font-medium"
                    href={`/address/${polledReceipt?.predecessor_id}`}
                  >
                    {polledReceipt?.predecessor_id}
                  </Link>
                </div>
              ) : (
                ''
              )}
            </td>
            <td>
              <div className="w-5 h-5 p-1 bg-green-100 rounded-full text-center flex justify-center items-center mx-auto text-white">
                <FaLongArrowAltRight />
              </div>
            </td>
            <td className="px-4 py-4 text-sm text-nearblue-600 dark:text-neargray-10 font-medium">
              {polledReceipt?.receiver_id ? (
                <div className="word-break">
                  <Link
                    className="text-green-500 dark:text-green-250 hover:no-underline inline-block truncate max-w-[120px] font-medium"
                    href={`/address/${polledReceipt?.receiver_id}`}
                  >
                    {polledReceipt?.receiver_id}
                  </Link>
                </div>
              ) : (
                ''
              )}
            </td>

            <td className="px-4 py-4 text-sm text-nearblue-600 dark:text-neargray-10 font-medium whitespace-nowrap">
              <span>
                {action.args?.deposit
                  ? yoctoToNear(action.args?.deposit, true)
                  : action.args?.deposit ?? '0'}{' '}
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

      {polledReceipt?.outcome?.outgoing_receipts?.length > 0 && (
        <>
          {polledReceipt?.outcome?.outgoing_receipts?.map(
            (rcpt: any, index: number) => {
              const childRpcReceipt =
                polledReceipt?.outcome?.outgoing_receipts?.[index] || null;
              return (
                <Fragment key={rcpt?.receipt_id}>
                  <ReceiptSummaryRow
                    borderFlag={true}
                    price={price}
                    receipt={rcpt}
                    statsData={statsData}
                    txn={txn}
                    polledReceipt={childRpcReceipt}
                  />
                </Fragment>
              );
            },
          )}
        </>
      )}
    </>
  );
};
export default ReceiptSummaryRow;
