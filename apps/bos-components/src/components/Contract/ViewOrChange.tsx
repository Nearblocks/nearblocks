/**
 * Component: ContractViewOrChange
 * Author: Nearblocks Pte Ltd
 * License: Business Source License 1.1
 * Description: Details of Contract on Near Protocol.
 * @interface Props
 * @param {string} [network] - The network data to show, either mainnet or testnet
 * @param {string} [id] - The account identifier passed as a string.
 * @param {boolean} [connected] - Boolean indicating whether the user is currently signed in or not.
 * @param {number} [index] - The position index of the contract method.
 * @param {string} [method] - Specifies the method name for the contract.
 * @param {string} [accountId] - The account ID of the signed-in user, passed as a string.
 */

interface Props {
  network: string;
  id: string;
  connected: boolean;
  index: number;
  method: string;
  accountId: string;
}

import { capitalize, toSnakeCase } from '@/includes/formats';
import ArrowRight from '@/includes/icons/ArrowRight';
import CloseCircle from '@/includes/icons/CloseCircle';
import Question from '@/includes/icons/Question';
import { getConfig, handleRateLimit, isJson, uniqueId } from '@/includes/libs';
import { FieldType } from '@/includes/types';

const inputTypes = ['string', 'number', 'boolean', 'null', 'json'];

const field = () => ({
  id: uniqueId(),
  name: '',
  type: '',
  value: '',
  placeholder: '',
});

const sortFields = (fields: FieldType[]) => {
  fields.sort((a, b) => {
    if (a.id < b.id) return -1;
    if (a.id > b.id) return 1;
    return 0;
  });

  return fields;
};

const mapFeilds = (fields: FieldType[]) => {
  const args: any = {};

  fields.forEach((fld: FieldType) => {
    args[fld.name] = fld.value;
  });

  return args;
};

const getDataType = (data: string) => {
  if (isJson(data)) {
    return 'json';
  }

  return isNaN(Number(data)) ? typeof data : 'number';
};

export default function (props: Props) {
  const { network, id, index, method, connected, accountId } = props;
  const [txn, setTxn] = useState<string | null>(null);
  const [error, setError] = useState(null);
  const [fields, setFields] = useState<FieldType[]>([]);
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [hideQuery, setHideQuery] = useState(false);
  const [options, setOptions] = useState({
    attachedDeposit: '0',
    gas: '30000000000000',
  });
  const config = getConfig(network);
  const onAdd = () => setFields((flds) => [...flds, field()]);

  const onRemove = (id: number) => () => {
    setFields((flds) =>
      sortFields(flds.filter((fld: FieldType) => fld.id !== id)),
    );
  };

  const onChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    type: string,
    id: number,
  ): void => {
    setFields((flds) => {
      const curFeild = flds.find((fld) => fld.id === id);
      if (curFeild) {
        const name = type;
        const value = e.target.value;
        const rest = flds.filter((fld) => fld.id !== id);

        return sortFields([...rest, { ...curFeild, [name]: value }]);
      }

      return sortFields(flds);
    });
  };

  const onOptionChange =
    (key: string) =>
    (e: React.ChangeEvent<HTMLInputElement>): void =>
      setOptions((optns) => ({ ...optns, [key]: e.target.value }));

  const onRead = (e: React.MouseEvent<HTMLButtonElement>): void => {
    e.preventDefault();
    setLoading(true);

    try {
      const args = mapFeilds(fields) ?? {};
      const res: { transaction_outcome: { id: string } } | null | any =
        Near.view(id, toSnakeCase(method), args);
      if (res !== null) {
        setError(null);
        setTxn(res?.transaction_outcome?.id);
        setResult(JSON.stringify(res, null, 2));
      }
    } catch (error: any) {
      setTxn(null);
      setError(error);
      setResult(null);
    }

    setLoading(false);
  };

  const onWrite = (e: React.MouseEvent<HTMLButtonElement>): void => {
    e.preventDefault();

    setLoading(true);

    try {
      if (!accountId) throw new Error('Error in wallet connection');

      const args = mapFeilds(fields) ?? {};
      const res: { transaction_outcome: { id: string } } | null | any =
        Near.call(id, toSnakeCase(method), args);

      if (res !== null) {
        setError(null);
        setTxn(res?.transaction_outcome?.id);
        setResult(JSON.stringify(res, null, 2));
      }
    } catch (error: any) {
      setTxn(null);
      setError(error);
      setResult(null);
    }

    setLoading(false);
  };

  const onDetect = (e: React.MouseEvent<HTMLButtonElement>): void => {
    e.preventDefault();

    setLoading(true);
    setFields([]);

    try {
      asyncFetch(`${config?.backendUrl}account/${id}/contract/${method}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
        .then(
          (data: {
            body: {
              action: {
                args: { args_json: object; deposit: string; gas: string };
              }[];
            };
            status: number;
          }) => {
            const resp = data?.body?.action;
            if (data.status === 200) {
              const args = resp?.[0]?.args || {};
              const argJson = args?.args_json || {};

              setOptions((optns) => ({
                attachedDeposit: args?.deposit || optns.attachedDeposit,
                gas: args?.gas || optns.gas,
              }));

              argJson &&
                Object.entries(argJson).forEach(([arg, value]) => {
                  if (value) {
                    const type = getDataType(value);
                    const field = {
                      id: uniqueId(),
                      name: arg,
                      type: type,
                      value: '',
                      placeholder:
                        type === 'number'
                          ? value
                          : typeof value === 'object'
                          ? JSON.stringify(value)
                          : value,
                    };
                    setFields((flds) => [...flds, field]);
                    setHideQuery(true);
                  }
                });
              setLoading(false);
            } else {
              handleRateLimit(
                data,
                () => onDetect(e),
                () => setLoading(false),
              );
            }
          },
        )
        .catch(() => {});
    } catch (error) {
      console.log({ error });
    }
  };

  return (
    <Accordion.Item
      value={index + 1}
      className="flex flex-col text-sm mb-3"
      key={index}
    >
      <Accordion.Header>
        <Accordion.Trigger className="bg-gray-50 border rounded flex items-center justify-between px-4 py-2 w-full">
          <span>
            <span className="text-gray-400">{index + 1}.</span>{' '}
            {toSnakeCase(method ?? '')}
          </span>
          <ArrowRight className="contract-icon fill-gray-600" />
        </Accordion.Trigger>
      </Accordion.Header>
      <Accordion.Content className="border p-4 rounded slide-up slide-down">
        <div className="flex max-w-xl justify-between mb-3">
          <div className="flex items-center">
            Arguments
            <Tooltip.Provider>
              <Tooltip.Root>
                <Tooltip.Trigger asChild>
                  <span>
                    <Question className="w-4 h-4 fill-current ml-1" />
                  </span>
                </Tooltip.Trigger>
                <Tooltip.Content
                  className="h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2 ml-2"
                  align="start"
                  side="bottom"
                >
                  Specify an arguments schema.
                </Tooltip.Content>
              </Tooltip.Root>
            </Tooltip.Provider>
          </div>
          <button
            onClick={onAdd}
            className="mx-3 px-3 mr-1 bg-green py-1 text-xs font-medium rounded-md text-white"
          >
            Add
          </button>
          <button
            type="submit"
            onClick={(e) => onDetect(e)}
            disabled={loading}
            className="flex ml-2 mr-1 bg-green-500 hover:bg-green-400 text-white text-xs px-3 py-1.5 rounded focus:outline-none disabled:opacity-70 disabled:cursor-not-allowed"
          >
            Auto detect
            <Tooltip.Provider>
              <Tooltip.Root>
                <Tooltip.Trigger asChild>
                  <span>
                    <Question className="w-4 h-4 fill-current ml-1" />
                  </span>
                </Tooltip.Trigger>
                <Tooltip.Content
                  className="h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2 ml-2"
                  align="start"
                  side="bottom"
                >
                  Scan the blockchain to find successful method calls and copy
                  the parameter schema. Auto-detect might not work on every
                  method.
                </Tooltip.Content>
              </Tooltip.Root>
            </Tooltip.Provider>
          </button>
        </div>
        {fields.map((field: FieldType) => (
          <div key={field.id} className="flex max-w-xl items-center">
            <div className="sm:grid grid-cols-9 gap-2">
              <input
                name="name"
                value={field.name}
                onChange={(e) => onChange(e, 'name', field.id)}
                placeholder="Argument name"
                className="col-span-3 block border rounded mb-3 h-9 px-3 w-full outline-none"
              />
              <select
                name="type"
                value={field.type}
                onChange={(e) => onChange(e, 'type', field.id)}
                className="col-span-2 bg-white block border rounded mb-3 h-9 px-3 w-full outline-none"
              >
                <option value="" disabled>
                  Type
                </option>
                {inputTypes.map((type) => (
                  <option value={type} key={type}>
                    {capitalize(type)}
                  </option>
                ))}
              </select>
              <input
                name="value"
                value={field.value}
                onChange={(e) => onChange(e, 'value', field.id)}
                placeholder={field.placeholder || 'Argument value'}
                className="col-span-4 block border rounded mb-3 h-9 px-3 w-full outline-none"
              />
            </div>
            <button
              onClick={onRemove(field.id)}
              className="ml-3 p-1 mr-1 bg-red-300 self-start mt-1.5 hover:bg-red-400 text-xs font-medium rounded-md text-white"
            >
              <CloseCircle className="text-white fill-white w-4 h-4" />
            </button>
          </div>
        ))}
        <div className="flex max-w-xl justify-between mb-3">
          <div className="flex items-center">
            Options
            <Tooltip.Provider>
              <Tooltip.Root>
                <Tooltip.Trigger asChild>
                  <span>
                    <Question className="w-4 h-4 fill-current ml-1" />
                  </span>
                </Tooltip.Trigger>
                <Tooltip.Content
                  className="h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2 ml-2"
                  align="start"
                  side="bottom"
                >
                  Optional arguments for write operations.
                </Tooltip.Content>
              </Tooltip.Root>
            </Tooltip.Provider>
          </div>
        </div>
        <div className="slide-down disclosure">
          <div className="max-w-xl sm:grid grid-cols-2 gap-2">
            <label>
              <span className="text-gray-400 text-xs">Attached deposit</span>
              <input
                name="attachedDeposit"
                value={options.attachedDeposit}
                onChange={onOptionChange('attachedDeposit')}
                placeholder="Attached Deposit"
                className="block border rounded my-1 h-9 px-3 w-full outline-none"
              />
            </label>
            <label>
              <span className="text-gray-400 text-xs">Gas</span>
              <input
                name="gas"
                value={options.gas}
                onChange={onOptionChange('gas')}
                placeholder="Gas"
                className="block border rounded my-1 h-9 px-3 w-full outline-none"
              />
            </label>
          </div>
        </div>
        <div className="flex items-center mt-5">
          {!hideQuery && (
            <button
              type="submit"
              onClick={(e) => onRead(e)}
              disabled={loading}
              className="bg-green-500 hover:bg-green-400 text-white text-xs px-3 py-1.5 rounded focus:outline-none disabled:opacity-70 disabled:cursor-not-allowed"
            >
              Query
            </button>
          )}
          {!hideQuery && (
            <div className="flex items-center mx-4 text-gray-400">
              OR{' '}
              <Tooltip.Provider>
                <Tooltip.Root>
                  <Tooltip.Trigger asChild>
                    <span>
                      <Question className="w-4 h-4 fill-current ml-1" />
                    </span>
                  </Tooltip.Trigger>
                  <Tooltip.Content
                    className="h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2 ml-2"
                    align="start"
                    side="bottom"
                  >
                    We cant differentiate read/write methods for this contract,
                    so you should choose the appropriate action
                  </Tooltip.Content>
                </Tooltip.Root>
              </Tooltip.Provider>
            </div>
          )}
          <button
            type="submit"
            onClick={(e) => onWrite(e)}
            disabled={loading || !connected}
            className="bg-green-500 hover:bg-green-400 text-white text-xs px-3 py-1.5 rounded focus:outline-none disabled:opacity-70 disabled:cursor-not-allowed"
          >
            Write
          </button>
        </div>
        {error && (
          <textarea
            readOnly
            rows={6}
            className="block appearance-none outline-none w-full border rounded-lg bg-red-50 border-red-100 p-3 mt-3 resize-y"
            value={error}
          />
        )}
        {txn && (
          <div className="block appearance-none outline-none w-full border rounded-lg bg-green-50 border-green-100 p-3 mt-3">
            View txn details:{' '}
            <Tooltip.Provider>
              <Tooltip.Root>
                <Tooltip.Trigger asChild>
                  <span className="truncate max-w-[120px] inline-block align-bottom text-green-500">
                    <a href={`/txns/${txn}`} className="hover:no-underline">
                      <a className="text-green-500">{txn}</a>
                    </a>
                  </span>
                </Tooltip.Trigger>
                <Tooltip.Content
                  className="h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2 ml-2"
                  align="start"
                  side="bottom"
                >
                  {txn}
                </Tooltip.Content>
              </Tooltip.Root>
            </Tooltip.Provider>
          </div>
        )}
        {result && (
          <textarea
            readOnly
            rows={6}
            className="block appearance-none outline-none w-full border rounded-lg bg-green-50 border-green-100 p-3 mt-3 resize-y"
            value={result}
          />
        )}
      </Accordion.Content>
    </Accordion.Item>
  );
}
