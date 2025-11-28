import { ethers } from 'ethers';
import { useState } from 'react';

import { jsonParser, jsonStringify } from '@/libs/utils';

import { TxnActionSkeleton } from '../Skeletons/Txn';

interface RlpTransactionProps {
  method: string;
  pretty: any;
  receiver: string;
}

interface DecodedTransaction {
  [key: string]: any;
  tx_bytes_b64: any;
}

const RlpTransaction = ({ method, pretty, receiver }: RlpTransactionProps) => {
  const decoded =
    method === 'submit' && receiver.includes('aurora')
      ? pretty
      : pretty && Buffer.from(pretty, 'base64');

  const parsed =
    method === 'submit' && receiver.includes('aurora')
      ? decoded
      : decoded && jsonParser(decoded.toString());

  const [format, setFormat] = useState<'default' | 'rlp' | 'table'>('rlp');

  function decodeTransaction(parsed: any): DecodedTransaction | undefined {
    if (!parsed || !parsed.tx_bytes_b64) {
      return;
    }

    try {
      const input = ethers.utils.base64.decode(parsed.tx_bytes_b64);
      const data = ethers.utils.parseTransaction(input);

      const decodedData: any = {
        ...data,
        gasLimit: data.gasLimit?.toNumber
          ? data.gasLimit.toNumber()
          : data.gasLimit,
        gasPrice: data.gasPrice?.toNumber
          ? data.gasPrice.toNumber()
          : data.gasPrice,
        value: data.value.toString(),
      };

      return {
        ...parsed,
        tx_bytes_b64: decodedData,
      };
    } catch (error) {
      console.error('Error decoding transaction:', error);
      return parsed;
    }
  }

  const [displayedArgs, setDisplayedArgs] = useState<string>(
    (parsed && jsonStringify(decodeTransaction(parsed), null, 2)) || '',
  );

  const handleFormatChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedFormat = event.target.value as 'default' | 'rlp' | 'table';
    setFormat(selectedFormat);

    let transformedArgs: any = null;

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

  if (!parsed) {
    return <TxnActionSkeleton />;
  }

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
                typeof displayedArgs === 'object' &&
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
          className="overflow-auto bg-bg-code text-sm p-3 rounded resize-y"
          style={{ height: '150px' }}
        >
          {displayedArgs &&
            Object.entries(jsonParser(displayedArgs)?.tx_bytes_b64 || {})?.map(
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
              ? jsonParser(displayedArgs)?.tx_bytes_b64
              : jsonStringify(jsonParser(displayedArgs), null, 2)
          }
        />
      )}
      <select
        className="opacity-2 pr-5 pl-1 border border-border-body bg-bg-code rounded-md my-2 text-sm focus:outline-none"
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
