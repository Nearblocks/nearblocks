/**
 * Component: TransactionsReceiptSummaryRow
 * Author: Nearblocks Pte Ltd
 * License: Business Source License 1.1
 * Description: Details of Transaction Receipt Summary Row on Near Protocol.
 * @interface Props
 * @param {string} [network] - The network data to show, either mainnet or testnet
 * @param {Function} [t] - A function for internationalization (i18n) provided by the next-translate package.
 * @param {RPCTransactionInfo} [rpcTxn] - RPC data of the transaction.
 * @param {TransactionInfo} [txn] - Information related to a transaction.
 * @param {ReceiptsPropsInfo} [receipt] -  receipt of the transaction.
 * @param {string} ownerId - The identifier of the owner of the component.
 */

interface Props {
  ownerId: string;
  network: string;
  txn: TransactionInfo;
  t: (key: string) => string | undefined;
  receipt: ReceiptsPropsInfo | any;
  borderFlag?: boolean;
}

import {
  Action,
  FunctionCallActionView,
  ReceiptsPropsInfo,
  StatusInfo,
  TransactionInfo,
} from '@/includes/types';
import FaLongArrowAltRight from '@/includes/icons/FaLongArrowAltRight';
import Skeleton from '@/includes/Common/Skeleton';

export default function (props: Props) {
  const { network, receipt, ownerId, txn } = props;

  const { getConfig, handleRateLimit, yoctoToNear, fiatValue } = VM.require(
    `${ownerId}/widget/includes.Utils.libs`,
  );

  const { convertToMetricPrefix } = VM.require(
    `${ownerId}/widget/includes.Utils.formats`,
  );

  const [statsData, setStatsData] = useState<StatusInfo>({} as StatusInfo);
  const config = getConfig && getConfig(network);
  useEffect(() => {
    function fetchStatsDatas() {
      if (txn) {
        asyncFetch(`${config.backendUrl}stats`)
          .then(
            (res: {
              body: {
                stats: StatusInfo[];
              };
              status: number;
            }) => {
              const resp = res?.body?.stats?.[0];
              if (res.status === 200) {
                setStatsData(resp);
              } else {
                handleRateLimit(res, fetchStatsDatas);
              }
            },
          )
          .catch(() => {});
      }
    }

    if (config.backendUrl) {
      fetchStatsDatas();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [txn, config.backendUrl]);

  const currentPrice = statsData?.near_price || 0;
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

  let gasAttached = receipt?.actions ? getGasAttached(receipt?.actions) : '0';

  return (
    <>
      {receipt &&
        receipt?.actions?.map((action: any, i: number) => (
          <tr key={action.args?.method_name + i}>
            <td className="px-6 py-4 text-sm text-nearblue-600 dark:text-neargray-10 font-medium whitespace-nowrap">
              {formatActionKind(action.action_kind)}
            </td>
            <td className="px-4 py-4 text-sm text-nearblue-600 dark:text-neargray-10 font-medium whitespace-nowrap">
              {action.args?.method_name}
            </td>
            <td className="px-4 py-4 text-sm text-nearblue-600 dark:text-neargray-10 font-medium">
              {receipt?.predecessor_id ? (
                <div className="word-break">
                  <Link
                    href={`/address/${receipt?.predecessor_id}`}
                    className="hover:no-underline"
                  >
                    <a className="text-green-500 dark:text-green-250 hover:no-underline inline-block truncate max-w-[120px]">
                      {receipt?.predecessor_id}
                    </a>
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
                    href={`/address/${receipt?.receiver_id}`}
                    className="hover:no-underline"
                  >
                    <a className="text-green-500 dark:text-green-250 hover:no-underline inline-block truncate max-w-[120px]">
                      {receipt?.receiver_id}
                    </a>
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
                {currentPrice && network === 'mainnet'
                  ? ` ($${fiatValue(
                      yoctoToNear(action.args?.deposit ?? 0, false),
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
              {
                <Widget
                  src={`${ownerId}/widget/bos-components.components.Transactions.ReceiptSummaryRow`}
                  props={{
                    receipt: rcpt,
                    borderFlag: true,
                    txn: txn,
                    network: network,
                    Link,
                    ownerId,
                  }}
                  loading={
                    <tr className="hover:bg-blue-900/5 h-[57px]">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-nearblue-600 dark:text-neargray-10">
                        <Skeleton className="w-full h-4" />
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-nearblue-600 dark:text-neargray-10">
                        <Skeleton className="w-full h-4" />
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-tiny ">
                        <Skeleton className="w-full h-4" />
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-nearblue-600 dark:text-neargray-10">
                        <Skeleton className="w-full h-4" />
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-nearblue-600 dark:text-neargray-10">
                        <Skeleton className="w-full h-4" />
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-nearblue-600 dark:text-neargray-10">
                        <Skeleton className="w-full h-4" />
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-nearblue-600 dark:text-neargray-10">
                        <Skeleton className="w-full h-4" />
                      </td>
                    </tr>
                  }
                />
              }
            </Fragment>
          ))}
        </>
      )}
    </>
  );
}
