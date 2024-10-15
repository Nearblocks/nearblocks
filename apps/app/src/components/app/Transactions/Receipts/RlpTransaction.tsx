import { aurorablocksUrl } from '@/utils/config';
import { jsonParser, jsonStringify } from '@/utils/libs';
import { ethers } from 'ethers';
import { useState } from 'react';

interface Props {
  pretty: any;
  method?: string;
  receiver?: string | any;
}

const RlpTransaction = ({ pretty, method, receiver }: Props) => {
  const decoded =
    method === 'submit' && receiver.includes('aurora')
      ? pretty
      : pretty && Buffer.from(pretty, 'base64');
  const parsed =
    method === 'submit' && receiver.includes('aurora')
      ? decoded
      : decoded && jsonParser(decoded.toString());

  const [format, setFormat] = useState('rlp');
  const [displayedArgs, setDisplayedArgs] = useState(
    parsed && jsonStringify(decodeTransaction(parsed), null, 2),
  );

  function isBase64(str: string) {
    try {
      return btoa(atob(str)) === str;
    } catch (err) {
      return false;
    }
  }

  function decodeTransaction(parsed: any) {
    if (!parsed || !parsed.tx_bytes_b64 || !isBase64(parsed.tx_bytes_b64)) {
      return parsed;
    }

    const input = ethers.utils.base64.decode(parsed.tx_bytes_b64);
    const data = ethers.utils.parseTransaction(input);
    //@ts-ignore
    data.value = data.value.toString();
    //@ts-ignore
    data.gasPrice = data.gasPrice.toString();
    //@ts-ignore
    data.gasLimit = data.gasLimit.toString();

    return { ...parsed, tx_bytes_b64: data };
  }

  const handleFormatChange = (event: any) => {
    const selectedFormat = event.target.value;
    setFormat(selectedFormat);
    let transformedArgs;
    switch (selectedFormat) {
      case 'rlp':
        const data = decodeTransaction(parsed);
        transformedArgs = data && jsonStringify(data, null, 2);
        break;
      case 'table':
        const tableData = decodeTransaction(parsed);
        transformedArgs = tableData && jsonStringify(tableData, null, 2);
        break;
      default:
        transformedArgs = parsed && jsonStringify(parsed, null, 2);
    }
    setDisplayedArgs(transformedArgs);
  };

  return (
    <>
      {format === 'table' ? (
        <div
          className="table-container overflow-auto border rounded-lg bg-gray-100 dark:bg-black-200 dark:border-black-200 p-3 mt-3 resize-y"
          style={{ height: '150px' }}
        >
          <table className="table-auto w-full border-collapse">
            <thead>
              <tr>
                <th className="border px-4 py-2 whitespace-nowrap">Name</th>
                <th className="border px-4 py-2">Data</th>
              </tr>
            </thead>
            <tbody>
              {displayedArgs &&
                Object.entries(jsonParser(displayedArgs).tx_bytes_b64).map(
                  ([key, value]) => (
                    <tr key={key}>
                      <td className="border px-4 py-2 whitespace-nowrap align-top">
                        {key}
                      </td>
                      <td className="border px-4 py-2">
                        {key === 'hash' ? (
                          <a
                            href={`${aurorablocksUrl}/tx/${value}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-green-500 dark:text-green-250 hover:no-underline"
                          >
                            {String(value)}
                          </a>
                        ) : (
                          <>{String(value)}</>
                        )}
                      </td>
                    </tr>
                  ),
                )}
            </tbody>
          </table>
        </div>
      ) : method === 'submit' &&
        receiver.includes('aurora') &&
        format === 'rlp' ? (
        <div
          className="table-container overflow-auto border rounded-lg bg-gray-100 dark:bg-black-200 dark:border-black-200 p-3 mt-3 resize-y"
          style={{ height: '150px' }}
        >
          {displayedArgs &&
            Object.entries(jsonParser(displayedArgs).tx_bytes_b64).map(
              ([key, value]) => (
                <p key={key} className="mb-2">
                  {key}:{' '}
                  {key === 'hash' &&
                  method === 'submit' &&
                  receiver.includes('aurora') ? (
                    <a
                      href={`${aurorablocksUrl}/tx/${value}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-green-500 dark:text-green-250 hover:no-underline"
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
          readOnly
          rows={4}
          value={
            method === 'submit' && receiver.includes('aurora')
              ? jsonParser(displayedArgs).tx_bytes_b64
              : displayedArgs
          }
          className="block appearance-none outline-none w-full border rounded-lg bg-gray-100 dark:bg-black-200 dark:border-black-200  p-3 mt-3 resize-y"
          style={{ height: '150px' }}
        ></textarea>
      )}
      <select
        className="opacity-2 pr-5 pl-1 mt-2 border rounded-md mb-2 text-sm focus:outline-none"
        value={format}
        onChange={handleFormatChange}
      >
        <option value="default">Default View</option>
        <option value="rlp">RLP Decoded</option>
        <option value="table">Table View</option>
      </select>
    </>
  );
};
export default RlpTransaction;
