import { capitalize, toSnakeCase, isJson, mapFeilds } from '@/utils/libs';
import { FieldType } from '@/utils/types';
import { useState } from 'react';
import uniqueId from 'lodash/uniqueId';
import {
  AccordionButton,
  AccordionItem,
  AccordionPanel,
} from '@reach/accordion';
import ArrowRight from '@/components/Icons/ArrowRight';
import { Tooltip } from '@reach/tooltip';
import Question from '@/components/Icons/Question';
import CloseCircle from '@/components/Icons/CloseCircle';
import { useVmStore } from '@/stores/vm';
import { useRouter } from 'next/router';
import { fetcher } from '@/hooks/useFetch';
import { useAuthStore } from '@/stores/auth';
import { Link } from '@/i18n/routing';

interface Props {
  connected?: boolean;
  index: number;
  method: string;
  accountId?: string;
}

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

const getDataType = (data: string) => {
  if (isJson(data)) {
    return 'json';
  }

  return isNaN(+data) ? typeof data : 'number';
};

const ViewOrChange = (props: Props) => {
  const router = useRouter();
  const { near } = useVmStore();
  const { id: contract } = router.query;
  const account = useAuthStore((store) => store.account);
  const { index, method, connected } = props;
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

  const onAdd = () => setFields((flds: FieldType[]) => [...flds, field()]);

  const onRemove = (id: string) => () =>
    setFields((flds) => sortFields(flds.filter((fld) => fld.id !== id)));

  const onChange = (id: any) => (e: any) =>
    setFields((flds) => {
      const curFeild = flds.find((fld) => fld.id === id);

      if (curFeild) {
        const name = e?.target?.name;
        const value = e?.target?.value;
        const rest = flds && flds?.filter((fld) => fld?.id !== id);

        return sortFields([...rest, { ...curFeild, [name]: value }]);
      }

      return sortFields(flds);
    });

  const onOptionChange = (key: any) => (e: any) =>
    setOptions((optns) => ({ ...optns, [key]: e?.target?.value }));

  const onRead = async () => {
    setLoading(true);

    try {
      const args = mapFeilds(fields);
      near
        .viewCall(contract, toSnakeCase(method), args)
        .then((resp: { transaction_outcome: { id: string } } | null | any) => {
          setError(null);
          setTxn(resp?.transaction_outcome?.id);
          setResult(JSON.stringify(resp, null, 2));
        })
        .catch((error: any) => {
          console.log(error);
          setTxn(null);
          setError(error?.message);
          setResult(null);
        });
    } catch (error: any) {
      setTxn(null);
      setError(error);
      setResult(null);
    }

    setLoading(false);
  };

  const onWrite = async () => {
    setLoading(true);

    try {
      if (!account) throw new Error('Error in wallet connection');

      const args = mapFeilds(fields);
      near
        .functionCall(
          contract,
          toSnakeCase(method),
          args,
          options?.gas,
          options?.attachedDeposit,
        )
        .then((resp: { transaction_outcome: { id: string } } | null | any) => {
          setError(null);
          setTxn(resp?.transaction_outcome?.id);
          setResult(JSON.stringify(resp, null, 2));
        })
        .catch((error: any) => {
          console.log(error);
          setTxn(null);
          setError(error?.message);
          setResult(null);
        });
    } catch (error: any) {
      setTxn(null);
      setError(error);
      setResult(null);
    }

    setLoading(false);
  };

  const onDetect = async () => {
    setLoading(true);
    setFields([]);
    try {
      const resp = await fetcher(`account/${contract}/contract/${method}`);
      const args = resp?.action?.[0]?.args || {};
      const argJson = args?.args_json || {};

      setOptions((optns) => ({
        attachedDeposit: args?.deposit || optns.attachedDeposit,
        gas: args?.gas || optns.gas,
      }));

      for (const arg in argJson) {
        const value = argJson[arg];

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
      }
    } catch (error) {
      // console.log({ error });
    }

    setLoading(false);
  };

  return (
    <AccordionItem
      className="flex flex-col text-gray-600 text-sm mb-3"
      key={index}
    >
      <AccordionButton className="bg-gray-50 dark:bg-black-200/50 dark:border-black-200 border rounded flex items-center justify-between px-4 py-2 w-full dark:text-neargray-10">
        <span>
          <span className="text-gray-400 dark:text-neargray-10">
            {index + 1}.
          </span>{' '}
          {toSnakeCase(method ?? '')}
        </span>
        <ArrowRight className="contract-icon fill-gray-600" />
      </AccordionButton>
      <AccordionPanel className="border dark:border-black-200 p-4 rounded">
        <div className="flex max-w-xl justify-between mb-3">
          <div className="flex items-center dark:text-neargray-10">
            Arguments
            <Tooltip
              label="Specify an arguments schema."
              className="absolute h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2 ml-2"
            >
              <span>
                <Question className="w-4 h-4 fill-current ml-1" />
              </span>
            </Tooltip>
          </div>
          <button
            onClick={onAdd}
            className="mx-3 px-3 mr-1 bg-green-500 dark:bg-green-250 dark:text-neargray-10 py-1 text-xs font-medium rounded-md text-white"
          >
            Add
          </button>
          <button
            onClick={onDetect}
            disabled={loading}
            className="flex ml-2 mr-1 bg-green-500 dark:bg-green-250 dark:text-neargray-10 hover:bg-green-400 text-white text-xs px-3 py-1.5 rounded focus:outline-none disabled:opacity-70 disabled:cursor-not-allowed"
          >
            Auto detect
            <Tooltip
              label="Scan the blockchain to find successful method calls and copy the parameter schema. Auto-detect might not work on every method."
              className="absolute h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2 ml-2"
            >
              <span>
                <Question className="w-4 h-4 fill-current mx-1 " />
              </span>
            </Tooltip>
          </button>
        </div>
        {fields &&
          fields.map((field) => (
            <div key={field.id} className="flex max-w-xl items-center">
              <div className="sm:grid grid-cols-9 gap-2">
                <input
                  name="name"
                  value={field?.name}
                  onChange={onChange(field?.id)}
                  placeholder="Argument name"
                  className="col-span-3 block border rounded mb-3 h-9 px-3 w-full outline-none"
                />
                <select
                  name="type"
                  value={field?.type}
                  onChange={onChange(field?.id)}
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
                  value={field?.value}
                  onChange={onChange(field?.id)}
                  placeholder={field?.placeholder || 'Argument value'}
                  className="col-span-4 block border rounded mb-3 h-9 px-3 w-full outline-none"
                />
              </div>
              <button
                onClick={onRemove(field?.id)}
                className="ml-3 p-1 mr-1 bg-red-300 self-start mt-1.5 hover:bg-red-400 text-xs font-medium rounded-md text-white"
              >
                <CloseCircle className="text-white fill-white w-4 h-4" />
              </button>
            </div>
          ))}
        <div className="flex max-w-xl justify-between mb-3 dark:text-neargray-10">
          <div className="flex items-center">
            Options
            <Tooltip
              label="Optional arguments for write operations."
              className="absolute h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2 ml-2"
            >
              <span>
                <Question className="w-4 h-4 fill-current ml-1" />
              </span>
            </Tooltip>
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
              onClick={onRead}
              disabled={loading}
              className="bg-green-500 dark:bg-green-250 dark:text-neargray-10 hover:bg-green-400 text-white text-xs px-3 py-1.5 rounded focus:outline-none disabled:opacity-70 disabled:cursor-not-allowed"
            >
              Query
            </button>
          )}
          {!hideQuery && (
            <div className="flex items-center mx-4 text-gray-400">
              OR{' '}
              <Tooltip
                label="We cant differentiate read/write methods for this contract, so you should choose the appropriate action"
                className="absolute h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2"
              >
                <span>
                  <Question className="w-4 h-4 fill-current ml-1" />
                </span>
              </Tooltip>
            </div>
          )}
          <button
            onClick={onWrite}
            disabled={loading || !connected}
            className="bg-green-500 dark:bg-green-250 dark:text-neargray-10 hover:bg-green-400 text-white text-xs px-3 py-1.5 rounded focus:outline-none disabled:opacity-70 disabled:cursor-not-allowed"
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
            <Tooltip
              label={txn}
              className="absolute h-auto max-w-xs bg-black bg-opacity-90 z-10 text-white text-xs p-2 break-words"
            >
              <span className="truncate max-w-[120px] inline-block align-bottom text-green-500">
                <Link href={`/txns/${txn}`}>{txn}</Link>
              </span>
            </Tooltip>
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
      </AccordionPanel>
    </AccordionItem>
  );
};

export default ViewOrChange;
