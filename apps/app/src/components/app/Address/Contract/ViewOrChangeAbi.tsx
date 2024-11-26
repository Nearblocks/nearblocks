'use client';
import {
  AccordionButton,
  AccordionItem,
  AccordionPanel,
} from '@reach/accordion';
import { Tooltip } from '@reach/tooltip';
import uniqueId from 'lodash/uniqueId';
import { useContext, useEffect, useState } from 'react';

import ArrowRight from '@/components/Icons/ArrowRight';
import CloseCircle from '@/components/Icons/CloseCircle';
import Question from '@/components/Icons/Question';
import { Link } from '@/i18n/routing';
import { capitalize, mapFeilds, toSnakeCase } from '@/utils/libs';
import { FieldType } from '@/utils/types';
import { NearContext } from '@/wallets/near';

interface Props {
  id: string;
  index: number;
  method: any;
  schema: any;
}

const inputTypes = ['string', 'number', 'boolean', 'null', 'json'];

const sortFields = (fields: FieldType[]) => {
  fields.sort((a, b) => {
    if (a.id < b.id) return -1;
    if (a.id > b.id) return 1;
    return 0;
  });

  return fields;
};

const ViewOrChangeAbi = (props: Props) => {
  const { signedAccountId, wallet } = useContext(NearContext);
  const { index, method, schema } = props;
  const [txn, setTxn] = useState<null | string>(null);
  const [error, setError] = useState(null);
  const [fields, setFields] = useState<FieldType[]>([]);
  const [result, setResult] = useState<null | string>('');
  const [loading, setLoading] = useState(false);
  const [hideQuery, setHideQuery] = useState(false);
  const [options, setOptions] = useState({
    attachedDeposit: '0',
    gas: '30000000000000',
  });

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

  const onOptionChange = (key: string) => (e: any) =>
    setOptions((optns) => ({ ...optns, [key]: e.target.value }));

  const onRead = async () => {
    setLoading(true);

    try {
      const args = mapFeilds(fields);
      if (!wallet) return;

      const response = await wallet.viewMethod({
        args,
        contractId: props?.id,
        method: toSnakeCase(method?.name),
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

      const response = await wallet.callMethod({
        args,
        contractId: props?.id,
        deposit: options?.attachedDeposit,
        gas: options?.gas,
        method: toSnakeCase(method?.name),
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
    if (argsAbi.length > 0) {
      const newFields = argsAbi.map(
        (argName: {
          name: string;
          type_schema: { $ref: string; type: string };
        }) => {
          return {
            id: uniqueId(),
            name: argName.name,
            placeholder: '',
            type: resolveTypeSchema(argName.type_schema),
            value: '',
          };
        },
      );

      setFields(newFields);
      setHideQuery(false);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [method?.params?.args, schema.body.root_schema.definitions]);

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
          {toSnakeCase(method.name ?? '')}
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
          <div className="flex ml-2 mr-1 text-xs px-3 py-1.5 rounded focus:outline-none disabled:opacity-70 disabled:cursor-not-allowed"></div>
          <div className="flex ml-2 mr-1 text-xs px-3 py-1.5 rounded focus:outline-none disabled:opacity-70 disabled:cursor-not-allowed"></div>
        </div>
        {fields.map((field: FieldType) => (
          <div className="flex max-w-xl items-center" key={field.id}>
            <div className="sm:grid grid-cols-9 gap-2">
              <input
                className="col-span-3 block border rounded mb-3 h-9 px-3 w-full outline-none dark:text-neargray-10"
                name="name"
                onChange={onChange(field.id)}
                placeholder="Argument name"
                value={field.name}
              />
              <select
                className="col-span-2 bg-white dark:bg-black-600 block border dark:border-black-200 dark:text-neargray-10 rounded mb-3 h-9 px-3 w-full outline-none"
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
          <div className="flex items-center dark:text-neargray-10">
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
              <span className="text-gray-400 text-xs ">Attached deposit</span>
              <input
                className="block border rounded my-1 h-9 px-3 w-full outline-none dark:text-neargray-10"
                name="attachedDeposit"
                onChange={onOptionChange('attachedDeposit')}
                placeholder="Attached Deposit"
                value={options.attachedDeposit}
              />
            </label>
            <label>
              <span className="text-gray-400 text-xs">Gas</span>
              <input
                className="block border rounded my-1 h-9 px-3 w-full outline-none dark:text-neargray-10"
                name="gas"
                onChange={onOptionChange('gas')}
                placeholder="Gas"
                value={options.gas}
              />
            </label>
          </div>
        </div>
        <div className="flex items-center mt-5">
          {!hideQuery && method?.kind === 'view' && (
            <button
              className="bg-green-500 hover:bg-green-400 text-white text-xs px-3 py-1.5 rounded focus:outline-none disabled:opacity-70 disabled:cursor-not-allowed"
              disabled={loading}
              onClick={onRead}
              type="submit"
            >
              Query
            </button>
          )}
          {method?.kind === 'call' && (
            <button
              className="bg-green-500 hover:bg-green-400 text-white text-xs px-3 py-1.5 rounded focus:outline-none disabled:opacity-70 disabled:cursor-not-allowed"
              disabled={loading || !signedAccountId}
              onClick={onWrite}
              type="submit"
            >
              Write
            </button>
          )}
        </div>
        {error && (
          <textarea
            className="block appearance-none outline-none w-full border rounded-lg dark:bg-red-200 dark:text-black-200 dark:border-red-400 bg-red-50 border-red-100 p-3 mt-3 resize-y"
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
            className="block appearance-none outline-none w-full border rounded-lg bg-green-50 dark:bg-green-100 dark:border-green-200 border-green-100 p-3 mt-3 resize-y dark:text-neargray-10"
            readOnly
            rows={6}
            value={result}
          />
        )}
      </AccordionPanel>
    </AccordionItem>
  );
};

export default ViewOrChangeAbi;
