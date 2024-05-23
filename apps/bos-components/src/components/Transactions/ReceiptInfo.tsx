/**
 * Component: TransactionsReceiptInfo
 * Author: Nearblocks Pte Ltd
 * License: Business Source License 1.1
 * Description: Details of Transaction Receipt on Near Protocol.
 * @interface Props
 * @param {string} [network] - The network data to show, either mainnet or testnet
 * @param {Function} [t] - A function for internationalization (i18n) provided by the next-translate package.
 * @param {ReceiptsPropsInfo | any} [receipt] -  receipt of the transaction.
 * @param {string} ownerId - The identifier of the owner of the component.
 */

interface Props {
  ownerId: string;
  network: string;
  t: (key: string) => string | undefined;
  receipt: ReceiptsPropsInfo | any;
}

import Question from '@/includes/Common/Question';
import {
  Action,
  BlocksInfo,
  FunctionCallActionView,
  ReceiptsPropsInfo,
} from '@/includes/types';

export default function (props: Props) {
  const { receipt, network, ownerId } = props;
  const { getConfig, handleRateLimit, yoctoToNear } = VM.require(
    `${ownerId}/widget/includes.Utils.libs`,
  );

  const { convertToMetricPrefix, localFormat } = VM.require(
    `${ownerId}/widget/includes.Utils.formats`,
  );

  const hashes = ['output', 'inspect'];
  const [pageHash, setHash] = useState('output');
  const onTab = (index: number) => {
    setHash(hashes[index]);
  };

  const [block, setBlock] = useState<BlocksInfo>({} as BlocksInfo);
  const [loading, setLoading] = useState(false);

  const config = getConfig && getConfig(network);

  useEffect(() => {
    function fetchBlocks() {
      setLoading(true);
      if (receipt?.outcome?.blockHash) {
        asyncFetch(`${config.backendUrl}blocks/${receipt?.outcome.blockHash}`)
          .then(
            (res: {
              body: {
                blocks: BlocksInfo[];
              };
              status: number;
            }) => {
              const resp = res?.body?.blocks?.[0];
              if (res.status === 200) {
                setBlock({
                  author_account_id: resp.author_account_id,
                  block_hash: resp.author_account_id,
                  block_height: resp.block_height,
                  block_timestamp: resp.block_timestamp,
                  chunks_agg: resp.chunks_agg,
                  gas_price: resp.gas_price,
                  prev_block_hash: resp.author_account_id,
                  receipts_agg: resp.receipts_agg,
                  transactions_agg: resp.transactions_agg,
                });
                setLoading(false);
              } else {
                handleRateLimit(res, fetchBlocks, () => setLoading(false));
              }
            },
          )
          .catch(() => {});
      }
    }
    if (config?.backendUrl) {
      fetchBlocks();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [receipt?.outcome?.blockHash, config.backendUrl]);

  let statusInfo;

  if (receipt?.outcome?.status?.type === 'successValue') {
    if (receipt?.outcome?.status?.value.length === 0) {
      statusInfo = (
        <div className="bg-gray-100 dark:bg-black-200 rounded-md p-5 font-medium my-3 whitespace-nowrap">
          Empty result
        </div>
      );
    } else {
      const args = receipt?.outcome?.status.value;
      const decodedArgs = Buffer.from(args, 'base64');

      let prettyArgs: object | string;
      try {
        const parsedJSONArgs = JSON.parse(decodedArgs.toString());
        prettyArgs =
          typeof parsedJSONArgs === 'boolean'
            ? JSON.stringify(parsedJSONArgs)
            : parsedJSONArgs;
      } catch {
        prettyArgs = Array.from(decodedArgs)
          .map((byte: any) => byte.toString(16).padStart(2, '0'))
          .join('');
      }

      statusInfo =
        prettyArgs && typeof prettyArgs === 'object' ? (
          <textarea
            readOnly
            rows={4}
            defaultValue={JSON.stringify(prettyArgs)}
            className="block appearance-none outline-none w-fit border font-medium rounded-lg bg-gray-100 dark:bg-black-200 dark:border-black-200 p-5 my-3 resize-y"
          ></textarea>
        ) : (
          <div>
            <div className="bg-gray-100 dark:bg-black-200 rounded-md p-5 font-medium my-3">
              <div className="bg-inherit text-inherit font-inherit border-none p-0">
                <div className="max-h-52 overflow-auto">
                  <div className="h-full w-full">{prettyArgs}</div>
                </div>
              </div>
            </div>
          </div>
        );
    }
  } else if (receipt?.outcome?.status?.type === 'failure') {
    statusInfo = (
      <textarea
        readOnly
        rows={4}
        defaultValue={JSON.stringify(receipt.outcome.status.error, null, 2)}
        className="block appearance-none outline-none w-fit border dark:border-black-200 rounded-lg font-medium bg-gray-100 dark:bg-black-200 p-5 my-3 resize-y"
      ></textarea>
    );
  } else if (receipt?.outcome?.status?.type === 'successReceiptId') {
    statusInfo = (
      <div className="bg-gray-100 dark:bg-black-200 rounded-md my-3 p-5 font-medium overflow-auto">
        <pre>{receipt?.outcome?.status?.receiptId}</pre>
      </div>
    );
  }

  const getDeposit = (actions: Action[]): string =>
    actions
      .map((action) => ('deposit' in action.args ? action.args.deposit : '0'))
      .reduce(
        (acc, deposit) =>
          Big(acc || '0')
            .plus(deposit)
            .toString(),
        '0',
      );

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

  const getRefund = (receipts: any[]): string =>
    receipts
      .filter(
        (receipt) => 'outcome' in receipt && receipt.predecessorId === 'system',
      )
      .reduce(
        (acc, receipt) =>
          Big(acc || '0')
            .plus(getDeposit(receipt.actions))
            .toString(),
        '0',
      );

  const getPreCharged = (receipt: any) =>
    Big(receipt?.outcome?.tokensBurnt || '0')
      .plus(getRefund(receipt?.outcome?.nestedReceipts))
      .toString();

  return (
    <div className="flex flex-col ">
      <Tabs.Root defaultValue={'output'}>
        <Tabs.List>
          {hashes &&
            hashes.map((hash, index) => (
              <Tabs.Trigger
                key={index}
                onClick={() => onTab(index)}
                className={`text-nearblue-600 text-xs leading-4 ${
                  hash === 'output' ? 'ml-6' : 'ml-3'
                } font-medium overflow-hidden inline-block cursor-pointer p-2 focus:outline-none ${
                  pageHash === hash
                    ? 'rounded-lg bg-green-600 dark:bg-green-250 text-white'
                    : 'hover:bg-neargray-800 bg-neargray-700 dark:text-neargray-10 dark:bg-black-200 rounded-lg hover:text-nearblue-600'
                }`}
                value={hash}
              >
                {hash === 'output' ? <h2>Output</h2> : <h2>Inspect</h2>}
              </Tabs.Trigger>
            ))}
        </Tabs.List>
        <Tabs.Content
          value={hashes[0]}
          className={'w-full focus:border-none focus:outline-none'}
        >
          <div className="flex flex-col my-4 ml-6">
            <div className="">
              <h2 className="flex items-center text-sm font-medium">
                <OverlayTrigger
                  placement="bottom-start"
                  delay={{ show: 500, hide: 0 }}
                  overlay={
                    <Tooltip className="fixed h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2">
                      Logs included in the receipt
                    </Tooltip>
                  }
                >
                  <div>
                    <Question className="w-4 h-4 fill-current mr-1" />
                  </div>
                </OverlayTrigger>
                Logs
              </h2>
              <div className="bg-gray-100 dark:bg-black-200 rounded-md p-0  mt-3 overflow-x-auto">
                {receipt?.outcome?.logs?.length > 0 ? (
                  <div className="w-full  break-words  space-y-4">
                    <textarea
                      readOnly
                      rows={4}
                      defaultValue={receipt?.outcome?.logs.join('\n')}
                      className="block appearance-none outline-none w-full border rounded-lg bg-gray-100 dark:bg-black-200 dark:border-black-200 p-5 resize-y"
                    ></textarea>
                  </div>
                ) : (
                  <div className="w-full  break-words p-5 font-medium space-y-4">
                    No Logs
                  </div>
                )}
              </div>
            </div>
            <div className="mt-4">
              <h2 className="flex items-center text-sm font-medium">
                <OverlayTrigger
                  placement="bottom-start"
                  delay={{ show: 500, hide: 0 }}
                  overlay={
                    <Tooltip className="fixed h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2">
                      The result of the receipt execution
                    </Tooltip>
                  }
                >
                  <div>
                    <Question className="w-4 h-4 fill-current mr-1" />
                  </div>
                </OverlayTrigger>
                Result
              </h2>
              {statusInfo}
            </div>
          </div>
        </Tabs.Content>
        <Tabs.Content
          value={hashes[1]}
          className={'w-fit focus:border-none focus:outline-none'}
        >
          <div className="overflow-x-auto">
            <table className="my-4 mx-6 whitespace-nowrap table-auto">
              <tbody>
                <tr>
                  <td className="flex items-center py-2 pr-4">
                    <OverlayTrigger
                      placement="bottom-start"
                      delay={{ show: 500, hide: 0 }}
                      overlay={
                        <Tooltip className="fixed h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2">
                          Unique identifier (hash) of this receipt.
                        </Tooltip>
                      }
                    >
                      <div>
                        <Question className="w-4 h-4 fill-current mr-1" />
                      </div>
                    </OverlayTrigger>
                    Receipt
                  </td>
                  <td className="font-semibold py-2 pl-4">{receipt?.id}</td>
                </tr>
                <tr>
                  <td
                    className={`flex items-center py-2 pr-4 ${
                      !block ? 'whitespace-normal' : 'whitespace-nowrap'
                    }`}
                  >
                    <OverlayTrigger
                      placement="bottom-start"
                      delay={{ show: 500, hide: 0 }}
                      overlay={
                        <Tooltip className="fixed h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2">
                          Block height
                        </Tooltip>
                      }
                    >
                      <div>
                        <Question className="w-4 h-4 fill-current mr-1" />
                      </div>
                    </OverlayTrigger>
                    Block
                  </td>
                  <td className="py-2 pl-4">
                    {block && (
                      <Link
                        href={`/blocks/${receipt?.outcome?.blockHash}`}
                        className="text-green-500 dark:text-green-250"
                      >
                        {!loading && localFormat(block?.block_height)}
                      </Link>
                    )}
                  </td>
                </tr>
                <tr>
                  <td className="flex items-center py-2 pr-4">
                    <OverlayTrigger
                      placement="bottom-start"
                      delay={{ show: 500, hide: 0 }}
                      overlay={
                        <Tooltip className="fixed h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2">
                          The account which issued the receipt
                        </Tooltip>
                      }
                    >
                      <div>
                        <Question className="w-4 h-4 fill-current mr-1" />
                      </div>
                    </OverlayTrigger>
                    From
                  </td>
                  <td className="py-2 pl-4">
                    <Link
                      href={`/address/${receipt?.predecessorId}`}
                      className="text-green-500 dark:text-green-250 hover:no-underline"
                    >
                      {receipt?.predecessorId}
                    </Link>
                  </td>
                </tr>
                <tr>
                  <td className="flex items-center py-2 pr-4">
                    <OverlayTrigger
                      placement="bottom-start"
                      delay={{ show: 500, hide: 0 }}
                      overlay={
                        <Tooltip className="fixed h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2">
                          The destination account of the receipt
                        </Tooltip>
                      }
                    >
                      <div>
                        <Question className="w-4 h-4 fill-current mr-1" />
                      </div>
                    </OverlayTrigger>
                    To
                  </td>
                  <td className="py-2 pl-4">
                    <Link
                      href={`/address/${receipt?.receiverId}`}
                      className="text-green-500 dark:text-green-250 hover:no-underline"
                    >
                      {receipt?.receiverId}
                    </Link>
                  </td>
                </tr>
                <tr>
                  <td className="flex items-center py-2 pr-4">
                    <OverlayTrigger
                      placement="bottom-start"
                      delay={{ show: 500, hide: 0 }}
                      overlay={
                        <Tooltip className="fixed h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2">
                          Maximum amount of gas allocated for the Receipt
                        </Tooltip>
                      }
                    >
                      <div>
                        <Question className="w-4 h-4 fill-current mr-1" />
                      </div>
                    </OverlayTrigger>
                    Gas Limit
                  </td>
                  <td className="py-2 pl-4">{`${
                    !loading &&
                    convertToMetricPrefix(getGasAttached(receipt?.actions))
                  }gas`}</td>
                </tr>
                <tr>
                  <td className="flex items-center py-2 pr-4">
                    <OverlayTrigger
                      placement="bottom-start"
                      delay={{ show: 500, hide: 0 }}
                      overlay={
                        <Tooltip className="fixed h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2">
                          Fees Pre-charged on Receipt
                        </Tooltip>
                      }
                    >
                      <div>
                        <Question className="w-4 h-4 fill-current mr-1" />
                      </div>
                    </OverlayTrigger>
                    Pre-charged Fee
                  </td>
                  <td className="py-2 pl-4">{`${
                    !loading && yoctoToNear(getPreCharged(receipt), true)
                  } Ⓝ`}</td>
                </tr>
                <tr>
                  <td className="flex items-center py-2 pr-4">
                    <OverlayTrigger
                      placement="bottom-start"
                      delay={{ show: 500, hide: 0 }}
                      overlay={
                        <Tooltip className="fixed h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2">
                          Burnt Gas by Receipt
                        </Tooltip>
                      }
                    >
                      <div>
                        <Question className="w-4 h-4 fill-current mr-1" />
                      </div>
                    </OverlayTrigger>
                    Burnt Gas
                  </td>
                  <td className="text-xs py-2 pl-4">
                    <span className="bg-orange-50 dark:bg-black-200 rounded-md px-2 py-1">
                      <span className="text-xs mr-2">🔥 </span>
                      {`${
                        !loading && receipt?.outcome?.gasBurnt
                          ? convertToMetricPrefix(receipt?.outcome?.gasBurnt)
                          : receipt?.outcome?.gasBurnt ?? ''
                      }gas`}
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="flex items-center py-2 pr-4">
                    <OverlayTrigger
                      placement="bottom-start"
                      delay={{ show: 500, hide: 0 }}
                      overlay={
                        <Tooltip className="fixed h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2">
                          Burnt Tokens by Receipt
                        </Tooltip>
                      }
                    >
                      <div>
                        <Question className="w-4 h-4 fill-current mr-1" />
                      </div>
                    </OverlayTrigger>
                    Burnt Tokens
                  </td>
                  <td className="text-xs py-2 pl-4">
                    <span className="bg-orange-50 dark:bg-black-200 rounded-md px-2 py-1">
                      <span className="text-xs mr-2">🔥 </span>
                      {!loading && receipt?.outcome?.tokensBurnt
                        ? yoctoToNear(receipt?.outcome?.tokensBurnt, true)
                        : receipt?.outcome?.tokensBurnt ?? ''}
                      Ⓝ
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="flex items-center py-2 pr-4">
                    <OverlayTrigger
                      placement="bottom-start"
                      delay={{ show: 500, hide: 0 }}
                      overlay={
                        <Tooltip className="fixed h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2">
                          Refund from the receipt
                        </Tooltip>
                      }
                    >
                      <div>
                        <Question className="w-4 h-4 fill-current mr-1" />
                      </div>
                    </OverlayTrigger>
                    Refund
                  </td>
                  <td className="py-2 pl-4">
                    {!loading &&
                      yoctoToNear(
                        getRefund(receipt?.outcome?.nestedReceipts) || '0',
                        true,
                      )}
                    Ⓝ
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </Tabs.Content>
      </Tabs.Root>
    </div>
  );
}
