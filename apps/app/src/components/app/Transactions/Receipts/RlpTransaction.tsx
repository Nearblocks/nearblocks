import { ethers } from 'ethers';
import { useState } from 'react';

import { useConfig } from '@/hooks/app/useConfig';
import { jsonParser, jsonStringify } from '@/utils/libs';

interface Props {
  method?: string;
  pretty: any;
  receiver?: any | string;
}

const RlpTransaction = ({ method, pretty, receiver }: Props) => {
  const { aurorablocksUrl } = useConfig();
  const decoded =
    method === 'submit' && receiver?.includes('aurora')
      ? pretty
      : pretty && Buffer.from(pretty, 'base64');
  const parsed =
    method === 'submit' && receiver?.includes('aurora')
      ? decoded
      : decoded && jsonParser(decoded?.toString());

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
    if (!parsed || !parsed?.tx_bytes_b64 || !isBase64(parsed?.tx_bytes_b64)) {
      return parsed;
    }

    const input = ethers?.utils?.base64?.decode(parsed?.tx_bytes_b64);
    const data = ethers?.utils?.parseTransaction(input);
    const parsedData = {
      ...data,
      gasLimit: data?.gasLimit?.toString(),
      gasPrice: data?.gasPrice?.toString(),
      value: data?.value?.toString(),
    };

    return { ...parsed, tx_bytes_b64: parsedData };
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
                        {key === 'hash' &&
                        method === 'submit' &&
                        receiver.includes('aurora') ? (
                          <a
                            className="text-green-500 dark:text-green-250 hover:no-underline"
                            href={`${aurorablocksUrl}/tx/${value}`}
                            rel="noopener noreferrer"
                            target="_blank"
                          >
                            {String(value)}
                          </a>
                        ) : typeof value === 'object' ? (
                          <pre className="whitespace-pre-wrap text-sm">
                            {JSON.stringify(value, null, 2)}
                          </pre>
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
                <p className="mb-2" key={key}>
                  {key}:{' '}
                  {key === 'hash' &&
                  method === 'submit' &&
                  receiver.includes('aurora') ? (
                    <a
                      className="text-green-500 dark:text-green-250 hover:no-underline"
                      href={`${aurorablocksUrl}/tx/${value}`}
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      {String(value)}
                    </a>
                  ) : typeof value === 'object' ? (
                    <pre className="whitespace-pre-wrap text-sm">
                      {JSON.stringify(value, null, 2)}
                    </pre>
                  ) : (
                    <>{String(value)}</>
                  )}
                </p>
              ),
            )}
        </div>
      ) : (
        <textarea
          className="block appearance-none outline-none w-full border rounded-lg bg-gray-100 dark:bg-black-200 dark:border-black-200  p-3 mt-3 resize-y"
          readOnly
          rows={4}
          style={{ height: '150px' }}
          value={
            method === 'submit' && receiver.includes('aurora')
              ? jsonParser(displayedArgs).tx_bytes_b64
              : displayedArgs
          }
        ></textarea>
      )}
      <select
        className="opacity-2 pr-5 pl-1 mt-2 border rounded-md mb-2 text-sm focus:outline-none"
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
