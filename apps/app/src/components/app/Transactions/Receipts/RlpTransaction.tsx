import { ethers } from 'ethers';
import { useState } from 'react';

import { space_mono } from '@/fonts/font';
import { useConfig } from '@/hooks/app/useConfig';
import { jsonParser, jsonStringify } from '@/utils/libs';
import { deserializeUnchecked } from 'borsh';

interface Props {
  method?: string;
  pretty: any;
  receiver?: any | string;
}

// Supports both Aurora transaction types:
// 1. submit - Simple transaction format
// 2. submit_with_args - Uses SubmitArgs structure for EVM transactions:
//    https://github.com/aurora-is-near/aurora-engine/blob/develop/engine-types/src/parameters/engine.rs#L133

class SubmitArgs {
  tx_data: Uint8Array;
  max_gas_price: bigint | null;
  gas_token_address: Uint8Array | null;

  constructor({ tx_data, max_gas_price, gas_token_address }: any) {
    this.tx_data = tx_data;
    this.max_gas_price = max_gas_price;
    this.gas_token_address = gas_token_address;
  }
}

const schema = new Map([
  [
    SubmitArgs,
    {
      kind: 'struct',
      fields: [
        ['tx_data', ['u8']],
        ['max_gas_price', { kind: 'option', type: 'u128' }],
        ['gas_token_address', { kind: 'option', type: [20] }],
      ],
    },
  ],
]);

const RlpTransaction = ({ method, pretty, receiver }: Props) => {
  const { aurorablocksUrl } = useConfig();
  const isAuroraSubmit = method === 'submit' || method === 'submit_with_args';
  const decoded =
    isAuroraSubmit && receiver === 'aurora'
      ? pretty
      : pretty && Buffer.from(pretty, 'base64');
  const parsed =
    isAuroraSubmit && receiver === 'aurora'
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

  function decodeSubmitTransaction(parsed: any) {
    if (!parsed || !parsed?.tx_bytes_b64 || !isBase64(parsed?.tx_bytes_b64)) {
      return parsed;
    }

    try {
      const input = ethers?.utils?.base64?.decode(parsed?.tx_bytes_b64);
      const data = ethers?.utils?.parseTransaction(input);
      const parsedData = {
        ...data,
        gasLimit: data?.gasLimit?.toString(),
        gasPrice: data?.gasPrice?.toString(),
        value: data?.value?.toString(),
      };

      return { ...parsed, tx_bytes_b64: parsedData };
    } catch (error) {
      console.error('Failed to parse submit transaction:', error);
      return parsed;
    }
  }

  function decodeSubmitWithArgsTransaction(parsed: any) {
    if (!parsed || !parsed?.tx_bytes_b64 || !isBase64(parsed?.tx_bytes_b64)) {
      return parsed;
    }

    try {
      const buffer = Buffer.from(parsed.tx_bytes_b64, 'base64');
      const submitArgs = deserializeUnchecked(schema, SubmitArgs, buffer);

      const data = ethers?.utils?.parseTransaction(submitArgs.tx_data);
      const parsedData = {
        ...data,
        gasLimit: data?.gasLimit?.toString(),
        gasPrice: data?.gasPrice?.toString(),
        value: data?.value?.toString(),
      };

      return {
        ...parsed,
        tx_bytes_b64: parsedData,
      };
    } catch (error) {
      console.error('Failed to parse submit_with_args transaction:', error);
      return parsed;
    }
  }

  function decodeTransaction(parsed: any) {
    if (method === 'submit') {
      return decodeSubmitTransaction(parsed);
    } else if (method === 'submit_with_args') {
      return decodeSubmitWithArgsTransaction(parsed);
    } else if (method === 'rlp_execute') {
      return decodeRlpExecuteTransaction(parsed);
    }
    return parsed;
  }

  function decodeRlpExecuteTransaction(data: any) {
    try {
      if (!data || typeof data !== 'object') {
        return data;
      }

      const { tx_bytes_b64, ...rest } = data;

      if (!tx_bytes_b64 || !isBase64(tx_bytes_b64)) {
        return data;
      }

      const input = ethers?.utils?.base64?.decode(tx_bytes_b64);
      const txData = ethers?.utils?.parseTransaction(input);
      const parsed = {
        ...txData,
        gasLimit: txData?.gasLimit?.toString(),
        gasPrice: txData?.gasPrice?.toString(),
        value: txData?.value?.toString(),
      };
      return {
        ...rest,
        tx_bytes_b64: parsed,
      };
    } catch (error) {
      console.error('Failed to parse rlp_execute transaction:', error);
      return data;
    }
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
        transformedArgs =
          method === 'rlp_execute'
            ? tableData?.tx_bytes_b64
            : jsonStringify(tableData, null, 2);
        break;
      default:
        transformedArgs = parsed && jsonStringify(parsed, null, 2);
    }
    setDisplayedArgs(transformedArgs);
  };

  const getDisplayData = () => {
    if (isAuroraSubmit && receiver === 'aurora') {
      if (!displayedArgs) return {};

      try {
        const parsedArgs = jsonParser(displayedArgs);
        return parsedArgs?.tx_bytes_b64 || {};
      } catch (error) {
        console.error('Failed to parse displayed args:', error);
        return {};
      }
    }
    return displayedArgs || {};
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
                Object.entries(getDisplayData()).map(([key, value]) => (
                  <tr key={key}>
                    <td className="border px-4 py-2 whitespace-nowrap align-top">
                      {key}
                    </td>
                    <td className="border px-4 py-2">
                      {key === 'hash' &&
                      isAuroraSubmit &&
                      receiver === 'aurora' ? (
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
                ))}
            </tbody>
          </table>
        </div>
      ) : isAuroraSubmit && receiver === 'aurora' && format === 'rlp' ? (
        <div
          className="table-container overflow-auto border rounded-lg bg-gray-100 dark:bg-black-200 dark:border-black-200 p-3 mt-3 resize-y"
          style={{ height: '150px' }}
        >
          {displayedArgs &&
            Object.entries(getDisplayData()).map(([key, value]) => (
              <p className="mb-2" key={key}>
                {key}:{' '}
                {key === 'hash' && isAuroraSubmit && receiver === 'aurora' ? (
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
            ))}
        </div>
      ) : (
        <textarea
          className={`block appearance-none outline-none w-full border rounded-lg bg-gray-100 dark:bg-black-200 dark:border-black-200  p-3 mt-3 resize-y ${space_mono.className}`}
          readOnly
          rows={4}
          style={{ height: '150px' }}
          value={
            isAuroraSubmit && receiver === 'aurora'
              ? JSON.stringify(getDisplayData(), null, 2)
              : displayedArgs || ''
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
