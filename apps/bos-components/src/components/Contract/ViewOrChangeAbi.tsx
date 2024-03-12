/**
 * Component: ContractViewOrChangeAbi
 * Author: Nearblocks Pte Ltd
 * License: Business Source License 1.1
 * Description: Details of Contract with near abi on Near Protocol.
 * @interface Props
 * @param {string} [id] - The account identifier passed as a string.
 * @param {boolean} [connected] - Boolean indicating whether the user is currently signed in or not.
 * @param {number} [index] - The position index of the abi contract method.
 * @param {object} [method] - Object containing information about the abi contract functions.
 * @param {string} [accountId] - The account ID of the signed-in user, passed as a string.
 * @param {object} [schema] - Object containing information about the near abi contract.
 * @param {React.FC<{
 *   href: string;
 *   children: React.ReactNode;
 *   className?: string;
 * }>} Link - A React component for rendering links.
 */

interface Props {
  id: string;
  connected: boolean;
  index: number;
  method: any;
  accountId: string;
  schema: any;
  Link: React.FC<{
    href: string;
    children: React.ReactNode;
    className?: string;
  }>;
}

import { capitalize, toSnakeCase } from '@/includes/formats';
import ArrowRight from '@/includes/icons/ArrowRight';
import CloseCircle from '@/includes/icons/CloseCircle';
import Question from '@/includes/icons/Question';
import { uniqueId } from '@/includes/libs';
import { FieldType } from '@/includes/types';

const inputTypes = ['string', 'number', 'boolean', 'null', 'json'];

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

export default function (props: Props) {
  const { id, index, method, connected, accountId, schema, Link } = props;
  const [txn, setTxn] = useState<string | null>(null);
  const [error, setError] = useState(null);
  const [fields, setFields] = useState<FieldType[]>([]);
  const [result, setResult] = useState<string | null>('');
  const [loading, setLoading] = useState(false);
  const [hideQuery, setHideQuery] = useState(false);
  const [options, setOptions] = useState({
    attachedDeposit: '0',
    gas: '30000000000000',
  });

  const onRemove = (id: any) => () => {
    setFields((flds) => sortFields(flds.filter((fld: any) => fld.id !== id)));
  };

  const onChange = (e: any, type: string, id: number) => {
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

  const onOptionChange = (key: string) => (e: any) =>
    setOptions((optns) => ({ ...optns, [key]: e.target.value }));

  const onRead = (e: React.MouseEvent<HTMLButtonElement>): void => {
    e.preventDefault();
    setLoading(true);

    try {
      const args = mapFeilds(fields) ?? {};
      const res: { transaction_outcome: { id: string } } | null | any =
        Near.view(id, toSnakeCase(method?.name), args);

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

  const onWrite = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    setLoading(true);
    try {
      if (!accountId) throw new Error('Error in wallet connection');

      const args = mapFeilds(fields) ?? {};
      const res: { transaction_outcome: { id: string } } | null | any =
        Near.call(id, toSnakeCase(method?.name), args);

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

  useEffect(() => {
    const resolveTypeSchema = (typeSchema: any) => {
      if (typeSchema['$ref']) {
        const refParts = typeSchema['$ref'].split('/');
        const definition =
          schema.body.root_schema.definitions[refParts[refParts.length - 1]];
        return definition.type;
      }
      return typeSchema.type;
    };

    const argsAbi = method?.params?.args || [];
    argsAbi.length > 0 &&
      argsAbi.map(
        (argName: {
          name: string;
          type_schema: { $ref: string; type: string };
        }) => {
          const field = {
            id: uniqueId(),
            name: argName?.name,
            type: resolveTypeSchema(argName?.type_schema),
            value: '',
            placeholder: '',
          };
          setFields((flds) => [...flds, field]);
          setHideQuery(false);
        },
      );
  }, [method?.params?.args, schema.body.root_schema.definitions]);

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
            {toSnakeCase(method.name ?? '')}
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
          <div className="flex ml-2 mr-1 text-xs px-3 py-1.5 rounded focus:outline-none disabled:opacity-70 disabled:cursor-not-allowed"></div>
          <div className="flex ml-2 mr-1 text-xs px-3 py-1.5 rounded focus:outline-none disabled:opacity-70 disabled:cursor-not-allowed"></div>
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
                    <Link href={`/txns/${txn}`} className="hover:no-underline">
                      <a className="text-green-500">{txn}</a>
                    </Link>
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
