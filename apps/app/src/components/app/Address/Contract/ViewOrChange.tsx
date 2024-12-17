'use client';
import {
  AccordionButton,
  AccordionItem,
  AccordionPanel,
} from '@reach/accordion';
import { Tooltip } from '@reach/tooltip';
import uniqueId from 'lodash/uniqueId';
import { useContext, useState } from 'react';

import { useFetch } from '@/hooks/app/useFetch';
import { Link } from '@/i18n/routing';
import { capitalize, isJson, mapFeilds, toSnakeCase } from '@/utils/libs';
import { FieldType } from '@/utils/types';

import ArrowRight from '../../Icons/ArrowRight';
import CloseCircle from '../../Icons/CloseCircle';
import Question from '../../Icons/Question';
import { NearContext } from '../../wallet/near-context';

interface Props {
  id: string;
  index: number;
  method: string;
}

const inputTypes = ['string', 'number', 'boolean', 'null', 'json'];

const field = () => ({
  id: uniqueId(),
  name: '',
  placeholder: '',
  type: '',
  value: '',
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
  const { signedAccountId, wallet } = useContext(NearContext);
  const { fetcher } = useFetch();
  const { index, method } = props;
  const [txn, setTxn] = useState<null | string>(null);
  const [error, setError] = useState(null);
  const [fields, setFields] = useState<FieldType[]>([]);
  const [result, setResult] = useState<null | string>(null);
  const [loading, setLoading] = useState(false);
  const [hideQuery, _setHideQuery] = useState(false);
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
        const name = e.target.name;
        const value = e.target.value;
        const rest = flds.filter((fld) => fld.id !== id);

        return sortFields([...rest, { ...curFeild, [name]: value }]);
      }

      return sortFields(flds);
    });

  const onOptionChange = (key: any) => (e: any) =>
    setOptions((optns) => ({ ...optns, [key]: e.target.value }));

  const onRead = async () => {
    setLoading(true);

    try {
      const args = mapFeilds(fields);
      if (!wallet) return;

      const response = await wallet.viewMethod({
        args,
        contractId: props?.id,
        method: toSnakeCase(method),
      });

      setError(null);
      setTxn(response?.transaction_outcome?.id || null);
      setResult(JSON.stringify(response, null, 2));
    } catch (error: any) {
      console.error('Error calling view method:', error);
      setTxn(null);
      setError(error?.message || 'An unknown error occurred');
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const onWrite = async () => {
    setLoading(true);

    try {
      if (!wallet) return;
      if (!signedAccountId) throw new Error('Error in wallet connection');

      const args = mapFeilds(fields);

      const response: any = await wallet.callMethod({
        args,
        contractId: props?.id,
        deposit: options?.attachedDeposit,
        gas: options?.gas,
        method: toSnakeCase(method),
      });

      setError(null);
      setTxn(response?.transaction_outcome?.id || null);
      setResult(JSON.stringify(response, null, 2));
    } catch (error: any) {
      console.error('Error calling method:', error);
      setTxn(null);
      setError(error?.message || 'An unknown error occurred');
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const onDetect = async () => {
    setLoading(true);
    setFields([]);
    try {
      const resp = await fetcher(`account/${props?.id}/contract/${method}`);
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
            placeholder:
              type === 'number'
                ? value
                : typeof value === 'object'
                ? JSON.stringify(value)
                : value,
            type: type,
            value: '',
          };
          setFields((flds) => [...flds, field]);
          // setHideQuery(true);
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
              className="absolute h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2 ml-2"
              label="Specify an arguments schema."
            >
              <span>
                <Question className="w-4 h-4 fill-current ml-1" />
              </span>
            </Tooltip>
          </div>
          <button
            className="mx-3 px-3 mr-1 bg-green-500 dark:bg-green-250 dark:text-neargray-10 py-1 text-xs font-medium rounded-md text-white"
            onClick={onAdd}
          >
            Add
          </button>
          <button
            className="flex ml-2 mr-1 bg-green-500 dark:bg-green-250 dark:text-neargray-10 hover:bg-green-400 text-white text-xs px-3 py-1.5 rounded focus:outline-none disabled:opacity-70 disabled:cursor-not-allowed"
            disabled={loading}
            onClick={onDetect}
          >
            Auto detect
            <Tooltip
              className="absolute h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2 ml-2"
              label="Scan the blockchain to find successful method calls and copy the parameter schema. Auto-detect might not work on every method."
            >
              <span>
                <Question className="w-4 h-4 fill-current mx-1 " />
              </span>
            </Tooltip>
          </button>
        </div>
        {fields.map((field) => (
          <div className="flex max-w-xl items-center" key={field.id}>
            <div className="sm:grid grid-cols-9 gap-2">
              <input
                className="col-span-3 block border rounded mb-3 h-9 px-3 w-full outline-none"
                name="name"
                onChange={onChange(field.id)}
                placeholder="Argument name"
                value={field.name}
              />
              <select
                className="col-span-2 bg-white block border rounded mb-3 h-9 px-3 w-full outline-none"
                name="type"
                onChange={onChange(field.id)}
                value={field.type}
              >
                <option disabled value="">
                  Type
                </option>
                {inputTypes.map((type) => (
                  <option key={type} value={type}>
                    {capitalize(type)}
                  </option>
                ))}
              </select>
              <input
                className="col-span-4 block border rounded mb-3 h-9 px-3 w-full outline-none"
                name="value"
                onChange={onChange(field.id)}
                placeholder={field.placeholder || 'Argument value'}
                value={field.value}
              />
            </div>
            <button
              className="ml-3 p-1 mr-1 bg-red-300 self-start mt-1.5 hover:bg-red-400 text-xs font-medium rounded-md text-white"
              onClick={onRemove(field.id)}
            >
              <CloseCircle className="text-white fill-white w-4 h-4" />
            </button>
          </div>
        ))}
        <div className="flex max-w-xl justify-between mb-3 dark:text-neargray-10">
          <div className="flex items-center">
            Options
            <Tooltip
              className="absolute h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2 ml-2"
              label="Optional arguments for write operations."
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
                className="block border rounded my-1 h-9 px-3 w-full outline-none"
                name="attachedDeposit"
                onChange={onOptionChange('attachedDeposit')}
                placeholder="Attached Deposit"
                value={options.attachedDeposit}
              />
            </label>
            <label>
              <span className="text-gray-400 text-xs">Gas</span>
              <input
                className="block border rounded my-1 h-9 px-3 w-full outline-none"
                name="gas"
                onChange={onOptionChange('gas')}
                placeholder="Gas"
                value={options.gas}
              />
            </label>
          </div>
        </div>
        <div className="flex items-center mt-5">
          {!hideQuery && (
            <button
              className="bg-green-500 dark:bg-green-250 dark:text-neargray-10 hover:bg-green-400 text-white text-xs px-3 py-1.5 rounded focus:outline-none disabled:opacity-70 disabled:cursor-not-allowed"
              disabled={loading}
              onClick={onRead}
            >
              Query
            </button>
          )}
          {!hideQuery && (
            <div className="flex items-center mx-4 text-gray-400">
              OR{' '}
              <Tooltip
                className="absolute h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2"
                label="We cant differentiate read/write methods for this contract, so you should choose the appropriate action"
              >
                <span>
                  <Question className="w-4 h-4 fill-current ml-1" />
                </span>
              </Tooltip>
            </div>
          )}
          <button
            className="bg-green-500 dark:bg-green-250 dark:text-neargray-10 hover:bg-green-400 text-white text-xs px-3 py-1.5 rounded focus:outline-none disabled:opacity-70 disabled:cursor-not-allowed"
            disabled={loading || !signedAccountId}
            onClick={onWrite}
          >
            Write
          </button>
        </div>
        {error && (
          <textarea
            className="block appearance-none outline-none w-full border rounded-lg bg-red-50 border-red-100 p-3 mt-3 resize-y"
            readOnly
            rows={6}
            value={error}
          />
        )}
        {txn && (
          <div className="block appearance-none outline-none w-full border rounded-lg bg-green-50 border-green-100 p-3 mt-3">
            View txn details:{' '}
            <Tooltip
              className="absolute h-auto max-w-xs bg-black bg-opacity-90 z-10 text-white text-xs p-2 break-words"
              label={txn}
            >
              <span className="truncate max-w-[120px] inline-block align-bottom text-green-500">
                <Link href={`/txns/${txn}`}>{txn}</Link>
              </span>
            </Tooltip>
          </div>
        )}
        {result && (
          <textarea
            className="block appearance-none outline-none w-full border rounded-lg bg-green-50 border-green-100 p-3 mt-3 resize-y"
            readOnly
            rows={6}
            value={result}
          />
        )}
      </AccordionPanel>
    </AccordionItem>
  );
};

export default ViewOrChange;
