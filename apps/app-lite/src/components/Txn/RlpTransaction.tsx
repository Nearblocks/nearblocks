import { ChangeEvent, useMemo, useState } from 'react';

import { decodeSubmit, decodeSubmitWithArgs, type EvmFields } from '@/libs/evm';

type RlpTransactionProps = {
  method: string;
  raw: string;
  receiver: string;
};

type Format = 'default' | 'rlp' | 'table';

const AURORA_EXPLORER = 'https://aurora.exploreblocks.io/tx';

const parseJson = (raw: string): null | Record<string, unknown> => {
  try {
    const bytes = Uint8Array.from(atob(raw), (c) => c.charCodeAt(0));

    return JSON.parse(new TextDecoder().decode(bytes));
  } catch {
    return null;
  }
};

const display = (value: unknown) =>
  typeof value === 'object' && value !== null
    ? JSON.stringify(value)
    : String(value);

const RlpTransaction = ({ method, raw, receiver }: RlpTransactionProps) => {
  const [format, setFormat] = useState<Format>('rlp');
  const submit = method === 'submit' || method === 'submit_with_args';
  const isAurora = submit && receiver === 'aurora';

  const { fields, parsed } = useMemo(() => {
    if (submit) {
      return {
        fields:
          method === 'submit' ? decodeSubmit(raw) : decodeSubmitWithArgs(raw),
        parsed: null,
      };
    }

    const json = parseJson(raw);
    const b64 = json?.tx_bytes_b64;

    return {
      fields: typeof b64 === 'string' ? decodeSubmit(b64) : null,
      parsed: json,
    };
  }, [method, raw, submit]);

  const rawText = useMemo(
    () => (submit ? raw : JSON.stringify(parsed ?? raw, null, 2)),
    [parsed, raw, submit],
  );

  const decodedText = useMemo(
    () =>
      parsed && fields
        ? JSON.stringify({ ...parsed, tx_bytes_b64: fields }, null, 2)
        : rawText,
    [fields, parsed, rawText],
  );

  const link = (key: string, value: unknown) =>
    key === 'hash' && isAurora ? (
      <a
        className="text-primary hover:no-underline"
        href={`${AURORA_EXPLORER}/${value}`}
        rel="noopener noreferrer"
        target="_blank"
      >
        {String(value)}
      </a>
    ) : (
      <>{display(value)}</>
    );

  const entries = Object.entries((fields ?? {}) as EvmFields);

  return (
    <>
      {format === 'table' && fields ? (
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
              {entries.map(([key, value]) => (
                <tr key={key}>
                  <td className="border border-border-body px-4 py-2 whitespace-nowrap align-top">
                    {key}
                  </td>
                  <td className="border border-border-body px-4 py-2">
                    {link(key, value)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : format === 'rlp' && fields && submit ? (
        <div
          className=" overflow-auto bg-bg-code text-sm p-3 rounded resize-y"
          style={{ height: '150px' }}
        >
          {entries.map(([key, value]) => (
            <p className="mb-2" key={key}>
              {key}: {link(key, value)}
            </p>
          ))}
        </div>
      ) : (
        <textarea
          className="block appearance-none outline-none w-full rounded bg-bg-code p-3 resize-y text-sm"
          readOnly
          rows={4}
          style={{ height: '150px' }}
          value={format === 'rlp' ? decodedText : rawText}
        />
      )}
      <select
        className="pr-5 pl-1  border border-border-body bg-bg-code rounded-md my-2 text-sm focus:outline-none"
        onChange={(event: ChangeEvent<HTMLSelectElement>) =>
          setFormat(event.target.value as Format)
        }
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
