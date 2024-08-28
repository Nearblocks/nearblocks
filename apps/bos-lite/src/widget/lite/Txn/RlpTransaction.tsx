import { UtilsModule } from '@/libs/utils';

interface Props {
  method: string;
  pretty: string;
  receiver: string;
}

let TxnActionSkeleton = window?.TxnActionSkeleton || (() => <></>);

const RlpTransaction = ({ method, pretty, receiver }: Props) => {
  let { jsonParser, jsonStringify } = VM.require<UtilsModule>(
    `${config_account}/widget/lite.libs.utils`,
  );

  if (!jsonParser || !jsonStringify) return <TxnActionSkeleton />;

  const decoded =
    method === 'submit' && receiver.includes('aurora')
      ? pretty
      : pretty && Buffer.from(pretty, 'base64');
  const parsed =
    method === 'submit' && receiver.includes('aurora')
      ? decoded
      : decoded && jsonParser(decoded.toString());

  const [format, setFormat] = useState('rlp');

  function decodeTransaction(parsed: any) {
    if (!parsed || !parsed.tx_bytes_b64) {
      return;
    }
    const input = ethers.utils.base64.decode(parsed.tx_bytes_b64);
    const data = ethers.utils.parseTransaction(input);

    data.value = data.value.toString();
    data.gasPrice = data.gasPrice.toNumber();
    data.gasLimit = data.gasLimit.toNumber();

    parsed.tx_bytes_b64 = data;

    return parsed;
  }

  const [displayedArgs, setDisplayedArgs] = useState(
    parsed && jsonStringify(decodeTransaction(parsed), null, 2),
  );

  const handleFormatChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedFormat = event.target.value as 'default' | 'rlp' | 'table';
    setFormat(selectedFormat);
    let transformedArgs: null | string = null;

    switch (selectedFormat) {
      case 'rlp':
        const rlpData = decodeTransaction(parsed);
        transformedArgs = rlpData ? jsonStringify(rlpData, null, 2) : '';
        break;
      case 'table':
        const tableData = decodeTransaction(parsed);
        transformedArgs = tableData ? tableData.tx_bytes_b64 : '';
        break;
      default:
        transformedArgs = parsed ? jsonStringify(parsed, null, 2) : '';
    }
    setDisplayedArgs(transformedArgs || '');
  };

  return (
    <>
      {format === 'table' ? (
        <div
          className="table-container overflow-auto bg-bg-code p-3 resize-y text-sm"
          style={{ height: '150px' }}
        >
          <table className="table-auto w-full border-collapse">
            <thead>
              <tr>
                <th className="border border-border-body px-4 py-2 whitespace-nowrap">
                  Name
                </th>
                <th className="border border-border-body px-4 py-2">Data</th>
              </tr>
            </thead>
            <tbody>
              {displayedArgs &&
                Object.entries(displayedArgs).map(([key, value]) => (
                  <tr key={key}>
                    <td className="border border-border-body px-4 py-2 whitespace-nowrap align-top">
                      {key}
                    </td>
                    <td className="border border-border-body px-4 py-2">
                      {key === 'hash' &&
                      method === 'submit' &&
                      receiver.includes('aurora') ? (
                        <a
                          className="text-primary hover:no-underline"
                          href={`https://aurora.exploreblocks.io/tx/${value}`}
                          rel="noopener noreferrer"
                          target="_blank"
                        >
                          {String(value)}
                        </a>
                      ) : (
                        <>{String(value)}</>
                      )}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      ) : format === 'rlp' &&
        method === 'submit' &&
        receiver.includes('aurora') ? (
        <div
          className=" overflow-auto bg-bg-code text-sm p-3 rounded resize-y"
          style={{ height: '150px' }}
        >
          {displayedArgs &&
            Object.entries(jsonParser(displayedArgs).tx_bytes_b64).map(
              ([key, value]) => (
                <p className="mb-2" key={key}>
                  {key}:{' '}
                  {key === 'hash' ? (
                    <a
                      className="text-primary hover:no-underline"
                      href={`https://aurora.exploreblocks.io/tx/${value}`}
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      {String(value)}
                    </a>
                  ) : (
                    <>{String(value)}</>
                  )}
                </p>
              ),
            )}
        </div>
      ) : (
        <textarea
          className="block appearance-none outline-none w-full rounded bg-bg-code p-3 resize-y text-sm"
          readOnly
          rows={4}
          style={{ height: '150px' }}
          value={
            method === 'submit' && receiver.includes('aurora')
              ? jsonParser(displayedArgs).tx_bytes_b64
              : jsonStringify(jsonParser(displayedArgs), null, 2)
          }
        ></textarea>
      )}
      <select
        className="opacity-2 pr-5 pl-1  border border-border-body bg-bg-code rounded-md my-2 text-sm focus:outline-none"
        onChange={handleFormatChange}
        value={format}
      >
        <option value="default">Default View</option>
        <option value="rlp">RLP Decoded</option>
        <option value="table">Table View</option>
      </select>
    </>
  );
};
export default RlpTransaction;
