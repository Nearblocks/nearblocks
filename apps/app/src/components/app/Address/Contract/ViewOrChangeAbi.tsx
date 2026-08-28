'use client';
import uniqueId from 'lodash/uniqueId';
import { useContext, useEffect, useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';

import {
  AccordionItem,
  AccordionItemContent,
  AccordionItemTrigger,
} from '@/components/ui/accordion';
import { Link } from '@/i18n/routing';
import { capitalize, mapFeilds, toSnakeCase } from '@/utils/libs';
import { formatContractResponseData } from '@/utils/app/libs';
import { FieldType } from '@/utils/types';

import Tooltip from '@/components/app/common/Tooltip';
import CloseCircle from '@/components/app/Icons/CloseCircle';
import Question from '@/components/app/Icons/Question';
import { NearContext } from '@/components/app/wallet/near-context';
import useRpc from '@/hooks/app/useRpc';
import { useRpcProvider } from '@/components/app/common/RpcContext';
import { useTranslations } from 'next-intl';
import FaChevronDown from '@/components/app/Icons/FaChevronDown';

interface Props {
  id: string;
  index: number;
  method: any;
  schema: any;
}

const getValidationSchema = (fields: FieldType[]) => {
  const schemaFields: any = {};

  fields.forEach((field) => {
    schemaFields[`name_${field.id}`] = Yup.string().required(
      'Argument name is required',
    );
    schemaFields[`type_${field.id}`] =
      Yup.string().required('Type is required');
    schemaFields[`value_${field.id}`] = Yup.string().required(
      'Argument value is required',
    );
  });

  return Yup.object().shape(schemaFields);
};

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
  const { rpc } = useRpcProvider();
  const { viewMethod } = useRpc();
  const t = useTranslations();
  const { index, method, schema } = props;
  const [txn, setTxn] = useState<null | string>(null);
  const [error, setError] = useState<string | null>(null);
  const [fields, setFields] = useState<FieldType[]>([]);
  const [result, setResult] = useState<null | string>('');
  const [loading, setLoading] = useState(false);
  const [hideQuery, setHideQuery] = useState(false);
  const [showValidation, setShowValidation] = useState(false);
  const [options, setOptions] = useState({
    attachedDeposit: '0',
    gas: '30000000000000',
  });

  const getInitialValues = () => {
    const initialValues: any = {};
    fields.forEach((field) => {
      initialValues[`name_${field.id}`] = field.name;
      initialValues[`type_${field.id}`] = field.type;
      initialValues[`value_${field.id}`] = field.value;
    });
    return initialValues;
  };

  const formik = useFormik({
    initialValues: getInitialValues(),
    validationSchema:
      fields.length > 0 ? getValidationSchema(fields) : Yup.object(),
    enableReinitialize: true,
    onSubmit: () => {},
  });

  const onRemove = (id: string) => () =>
    setFields((flds) => sortFields(flds.filter((fld) => fld.id !== id)));

  const onChange = (id: any) => (e: any) => {
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

    const fieldName = e.target.name;
    const formikFieldName = `${fieldName}_${id}`;
    formik.setFieldValue(formikFieldName, e.target.value);
  };

  const onOptionChange = (key: string) => (e: any) =>
    setOptions((optns) => ({ ...optns, [key]: e.target.value }));

  const onRead = async () => {
    if (fields.length > 0) {
      const errors = await formik.validateForm();
      if (Object.keys(errors).length > 0) {
        setShowValidation(true);
        return;
      }
    }

    const resetState = (
      txn: string | null = null,
      error: string | null = null,
      result: string | null = null,
    ): void => {
      setTxn(txn);
      setError(error);
      setResult(result);
    };

    setLoading(true);

    try {
      const args = mapFeilds(fields);
      const response = await viewMethod({
        args,
        contractId: props?.id,
        method: toSnakeCase(method?.name),
        rpcUrl: rpc,
      });
      if (response?.success) {
        resetState(
          response?.data?.transaction_outcome?.id ?? null,
          null,
          formatContractResponseData(response?.data),
        );
      } else {
        const errorMsg =
          [429, 408].includes(response?.statusCode) ||
          response?.error?.details?.message
            ? t('rpcRateLimitError', { rpcUrl: rpc, icon: '📡' })
            : response?.error;

        resetState(null, errorMsg);
      }
    } catch {
      resetState(null, 'An unknown error occurred');
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
      className="flex flex-col text-gray-600 text-sm mb-3 border rounded dark:border-black-200"
      key={index}
      value={index.toString()}
    >
      <AccordionItemTrigger
        buttonColor="fill-gray-600"
        className="bg-gray-50 dark:bg-black-200/50 flex items-center justify-between px-4 py-2 w-full dark:text-neargray-10"
      >
        <span>
          <span className="text-gray-400 dark:text-neargray-10">
            {index + 1}.
          </span>{' '}
          {toSnakeCase(method.name ?? '')}
        </span>
      </AccordionItemTrigger>
      <AccordionItemContent className="p-4">
        <div className="flex max-w-xl justify-between mb-3 sm:flex flex-nowrap">
          <div className="flex items-center dark:text-neargray-10">
            Arguments
            <Tooltip
              className={'left-14 max-w-[200px] w-20'}
              position="bottom"
              tooltip="Specify an arguments schema."
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
              <div className="col-span-3">
                <input
                  className={`block border ${
                    formik.errors[`name_${field.id}`] &&
                    (formik.touched[`name_${field.id}`] || showValidation)
                      ? 'border-red-500'
                      : 'dark:border-black-200'
                  } rounded mb-1 h-9 px-3 w-full outline-none dark:text-neargray-10`}
                  name="name"
                  onChange={onChange(field.id)}
                  placeholder="Argument name"
                  value={field.name}
                />
                {formik.errors[`name_${field.id}`] &&
                  (formik.touched[`name_${field.id}`] || showValidation) && (
                    <small className="text-red-500 text-xs mb-2">
                      {formik.errors[`name_${field.id}`] as string}
                    </small>
                  )}
              </div>

              <div className="col-span-2">
                <div className="relative">
                  <select
                    className={`w-full h-9 mb-1 pl-3 pr-10 bg-white dark:bg-black-600 dark:text-neargray-10 border ${
                      formik.errors[`type_${field.id}`] &&
                      (formik.touched[`type_${field.id}`] || showValidation)
                        ? 'border-red-500'
                        : 'dark:border-black-200'
                    } rounded outline-none appearance-none cursor-pointer`}
                    name="type"
                    onChange={onChange(field.id)}
                    required
                    value={typeof field.type === 'string' ? field.type : ''}
                  >
                    <option value="" disabled>
                      Type
                    </option>
                    {inputTypes.map((type) => (
                      <option key={type} value={type}>
                        {capitalize(type)}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 top-0 flex items-center pr-3 pointer-events-none">
                    <FaChevronDown />
                  </div>
                </div>
                {formik.errors[`type_${field.id}`] &&
                  (formik.touched[`type_${field.id}`] || showValidation) && (
                    <small className="text-red-500 text-xs mb-2">
                      {formik.errors[`type_${field.id}`] as string}
                    </small>
                  )}
              </div>

              <div className="col-span-4">
                <input
                  className={`w-full h-9 mb-1 pl-3 pr-10 bg-white dark:bg-black-600 dark:text-neargray-10 border ${
                    formik.errors[`value_${field.id}`] &&
                    (formik.touched[`value_${field.id}`] || showValidation)
                      ? 'border-red-500'
                      : 'dark:border-black-200'
                  } rounded outline-none appearance-none cursor-pointer`}
                  name="value"
                  onChange={onChange(field.id)}
                  placeholder={field.placeholder || 'Argument value'}
                  value={field.value}
                />
                {formik.errors[`value_${field.id}`] &&
                  (formik.touched[`value_${field.id}`] || showValidation) && (
                    <small className="text-red-500 text-xs mb-2">
                      {formik.errors[`value_${field.id}`] as string}
                    </small>
                  )}
              </div>
            </div>
            <button
              className="ml-3 p-1 mr-1 bg-red-300 dark:bg-red-700 dark:hover:bg-red-600 self-start mt-1.5 hover:bg-red-400 text-xs font-medium rounded-md text-white"
              onClick={onRemove(field.id)}
            >
              <CloseCircle className="text-white fill-white w-4 h-4" />
            </button>
          </div>
        ))}
        <div className="flex max-w-xl justify-between mb-3 dark:text-neargray-10 mt-2">
          <div className="flex items-center dark:text-neargray-10">
            Options
            <Tooltip
              className={'left-20 max-w-[200px] w-32'}
              position="bottom"
              tooltip="Optional arguments for write operations."
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
              <span className="text-gray-400 dark:text-neargray-10 text-xs ">
                Attached deposit
              </span>
              <input
                className="block border dark:border-black-200 rounded my-1 h-9 px-3 w-full outline-none dark:text-neargray-10"
                name="attachedDeposit"
                onChange={onOptionChange('attachedDeposit')}
                placeholder="Attached Deposit"
                value={options.attachedDeposit}
              />
            </label>
            <label>
              <span className="text-gray-400 dark:text-neargray-10 text-xs">
                Gas
              </span>
              <input
                className="block border dark:border-black-200 rounded my-1 h-9 px-3 w-full outline-none dark:text-neargray-10"
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
              className="bg-green-500 dark:bg-green-250 hover:bg-green-400 dark:text-neargray-10 text-white text-xs px-3 py-1.5 rounded focus:outline-none disabled:opacity-70 disabled:cursor-not-allowed"
              disabled={loading}
              onClick={onRead}
              type="submit"
            >
              Query
            </button>
          )}
          {method?.kind === 'call' && (
            <button
              className="bg-green-500 dark:bg-green-250 hover:bg-green-400 dark:text-neargray-10 text-white text-xs px-3 py-1.5 rounded focus:outline-none disabled:opacity-70 disabled:cursor-not-allowed"
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
            className="block appearance-none outline-none w-full border rounded-lg dark:bg-red-950 dark:bg-opacity-40 dark:text-neargray-10 dark:border-red-400 bg-red-50 border-red-100 p-3 mt-3 resize-y"
            readOnly
            rows={6}
            value={
              typeof error === 'string' ? error : JSON.stringify(error, null, 2)
            }
          />
        )}
        {txn && (
          <div className="block appearance-none outline-none w-full border rounded-lg bg-green-50 border-green-100 p-3 mt-3">
            View txn details:{' '}
            <Tooltip
              className={'left-1/2 max-w-[200px] w-96 mt-3'}
              position="bottom"
              tooltip={txn}
            >
              <span className="truncate max-w-[120px] inline-block align-bottom text-green-500">
                <Link href={`/txns/${txn}`}>{txn}</Link>
              </span>
            </Tooltip>
          </div>
        )}
        {result && (
          <textarea
            className="block appearance-none outline-none w-full border rounded-lg bg-green-50 dark:bg-green-900 dark:border-green-200 border-green-100 p-3 mt-3 resize-y dark:text-neargray-10"
            readOnly
            rows={6}
            value={result}
          />
        )}
      </AccordionItemContent>
    </AccordionItem>
  );
};

export default ViewOrChangeAbi;
