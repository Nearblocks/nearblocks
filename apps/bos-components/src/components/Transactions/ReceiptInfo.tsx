/**
 * Component: TransactionsReceiptInfo
 * Author: Nearblocks Pte Ltd
 * License: Business Source License 1.1
 * Description: Details of Transaction Receipt on Near Protocol.
 * @interface Props
 * @param {string} [network] - The network data to show, either mainnet or testnet
 * @param {Function} [t] - A function for internationalization (i18n) provided by the next-translate package.
 * @param {ReceiptsPropsInfo | any} [receipt] -  receipt of the transaction.
 * @param {React.FC<{
 *   href: string;
 *   children: React.ReactNode;
 *   className?: string;
 * }>} Link - A React component for rendering links.
 */

interface Props {
  network: string;
  t: (key: string) => string | undefined;
  receipt: ReceiptsPropsInfo | any;
  Link: React.FC<{
    href: string;
    children: React.ReactNode;
    className?: string;
  }>;
}

import { convertToMetricPrefix } from '@/includes/formats';
import { getConfig, handleRateLimit, yoctoToNear } from '@/includes/libs';
import { BlocksInfo, ReceiptsPropsInfo } from '@/includes/types';

export default function (props: Props) {
  const { receipt, network, Link } = props;
  const hashes = ['output', 'inspect'];
  const [pageHash, setHash] = useState('output');
  const onTab = (index: number) => {
    setHash(hashes[index]);
  };

  const [block, setBlock] = useState<BlocksInfo>({} as BlocksInfo);
  const [loading, setLoading] = useState(false);
  const config = getConfig(network);

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

    fetchBlocks();
  }, [receipt?.outcome?.blockHash, config.backendUrl]);

  let statusInfo;

  if (receipt?.outcome?.status?.type === 'successValue') {
    if (receipt?.outcome?.status?.value.length === 0) {
      statusInfo = (
        <div className="bg-gray-100 rounded-md text-3f4246 p-5 font-medium my-3">
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
            className="block appearance-none outline-none w-full border rounded-lg bg-gray-100 p-3 my-3 resize-y"
          ></textarea>
        ) : (
          <div>
            <div className="bg-gray-100 rounded-md p-3 font-semibold my-3">
              <div className="bg-inherit text-inherit font-inherit text-base border-none p-0">
                <div className="max-h-52 overflow-auto">
                  <div className="p-4 h-full w-full">{prettyArgs}</div>
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
        className="block appearance-none outline-none w-full border rounded-lg bg-gray-100 p-3 my-3 resize-y"
      ></textarea>
    );
  } else if (receipt?.outcome?.status?.type === 'successReceiptId') {
    statusInfo = (
      <div className="bg-gray-100 rounded-md my-3 p-5 font-medium">
        <pre>{receipt?.outcome?.status?.receiptId}</pre>
      </div>
    );
  }

  return (
    <div className="pb-5 flex flex-col ">
      <Tabs.Root defaultValue={'output'}>
        <Tabs.List>
          {hashes &&
            hashes.map((hash, index) => (
              <Tabs.Trigger
                key={index}
                onClick={() => onTab(index)}
                className={`text-nearblue-600 text-sm mx-2.5 font-medium overflow-hidden inline-block cursor-pointer p-2 mb-3 mr-2 focus:outline-none ${
                  pageHash === hash
                    ? 'rounded-lg bg-green-600 text-white'
                    : 'hover:bg-neargray-800 bg-neargray-700 rounded-lg hover:text-nearblue-600'
                }`}
                value={hash}
              >
                {hash === 'output' ? <h2>Output</h2> : <h2>Inspect</h2>}
              </Tabs.Trigger>
            ))}
        </Tabs.List>
        <Tabs.Content value={hashes[0]}>
          <div className="flex flex-col my-4 mx-7">
            <div className="flex justify-between">
              <div className="flex flex-col w-full lg:w-1/2">
                <div className="">
                  <h2 className="text-sm font-semibold ">Logs</h2>
                  <div className="bg-gray-100 rounded-md p-5 font-medium my-3 overflow-x-auto ">
                    {receipt?.outcome?.logs?.length === 0 ? (
                      'No logs'
                    ) : (
                      <pre>{receipt?.outcome?.logs.join('\n')}</pre>
                    )}
                  </div>
                </div>
                <div>
                  <h2 className="text-sm font-semibold ">Result</h2>
                  {statusInfo}
                </div>
              </div>
            </div>
          </div>
        </Tabs.Content>
        <Tabs.Content value={hashes[1]}>
          <table className="w-full my-4 mx-7">
            <tbody>
              <tr>
                <td>Receipt ID</td>
                <td>{receipt?.id}</td>
              </tr>
              <tr>
                <td>Executed in Block</td>
                <td>
                  <Link
                    href={`/blocks/${receipt?.outcome?.blockHash}`}
                    className="whitespace-nowrap"
                  >{`#${block?.block_height}`}</Link>
                </td>
              </tr>
              <tr>
                <td>Predecessor ID</td>
                <td>{receipt?.predecessorId}</td>
              </tr>

              <tr>
                <td>Receiver ID</td>
                <td>{receipt?.receiverId}</td>
              </tr>

              <tr>
                <td>Attached Gas</td>
                <td>{receipt?.id}</td>
              </tr>
              <tr>
                <td>Gas Burned</td>
                <td>
                  {!loading && receipt?.outcome?.gasBurnt
                    ? convertToMetricPrefix(receipt?.outcome?.gasBurnt)
                    : receipt?.outcome?.gasBurnt ?? ''}
                  gas
                </td>
              </tr>
              <tr>
                <td>Tokens Burned</td>
                <td>
                  {!loading && receipt?.outcome?.tokensBurnt
                    ? yoctoToNear(receipt?.outcome?.tokensBurnt, true)
                    : receipt?.outcome?.tokensBurnt ?? ''}
                  Ⓝ
                </td>
              </tr>
            </tbody>
          </table>
        </Tabs.Content>
      </Tabs.Root>
    </div>
  );
}
