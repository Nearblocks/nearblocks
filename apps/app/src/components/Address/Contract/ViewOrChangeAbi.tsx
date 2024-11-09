import {
  AccordionButton,
  AccordionItem,
  AccordionPanel,
} from '@reach/accordion';
import { Tooltip } from '@reach/tooltip';
import uniqueId from 'lodash/uniqueId';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

import ArrowRight from '@/components/Icons/ArrowRight';
import CloseCircle from '@/components/Icons/CloseCircle';
import Question from '@/components/Icons/Question';
import { Link } from '@/i18n/routing';
import { useAuthStore } from '@/stores/auth';
import { useVmStore } from '@/stores/vm';
import { capitalize, mapFeilds, toSnakeCase } from '@/utils/libs';
import { FieldType } from '@/utils/types';

interface Props {
  connected?: boolean;
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
  const router = useRouter();
  const { near } = useVmStore();
  const { id: contract } = router.query;
  const account = useAuthStore((store) => store.account);
  const { connected, index, method, schema } = props;
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
        const name = e?.target?.name;
        const value = e?.target?.value;
        const rest = flds && flds?.filter((fld) => fld?.id !== id);

        return sortFields([...rest, { ...curFeild, [name]: value }]);
      }

      return sortFields(flds);
    });

  const onOptionChange = (key: string) => (e: any) =>
    setOptions((optns) => ({ ...optns, [key]: e?.target?.value }));

  const onRead = async () => {
    setLoading(true);

    try {
      const args = mapFeilds(fields);
      near
        .viewCall(contract, toSnakeCase(method?.name), args)
        .then((resp: { transaction_outcome: { id: string } } | any | null) => {
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
          toSnakeCase(method?.name),
          args,
          options?.gas,
          options?.attachedDeposit,
        )
        .then((resp: { transaction_outcome: { id: string } } | any | null) => {
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

  useEffect(() => {
    const resolveTypeSchema = (typeSchema: any) => {
      if (typeSchema['$ref']) {
        const refParts = typeSchema['$ref']?.split('/');
        const definition =
          schema?.body?.root_schema?.definitions[
            refParts[refParts?.length - 1]
          ];
        return definition?.type;
      }
      return typeSchema?.type;
    };

    const argsAbi = method?.params?.args || [];
    if (argsAbi?.length > 0) {
      const newFields =
        argsAbi &&
        argsAbi?.map(
          (argName: {
            name: string;
            type_schema: { $ref: string; type: string };
          }) => {
            return {
              id: uniqueId(),
              name: argName.name,
              placeholder: '',
              type: resolveTypeSchema(argName?.type_schema),
              value: '',
            };
          },
        );

      setFields(newFields);
      setHideQuery(false);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [method?.params?.args, schema?.body?.root_schema?.definitions]);

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
          <div className="flex max-w-xl items-center" key={field?.id}>
            <div className="sm:grid grid-cols-9 gap-2">
              <input
                className="col-span-3 block border rounded mb-3 h-9 px-3 w-full outline-none dark:text-neargray-10"
                name="name"
                onChange={onChange(field?.id)}
                placeholder="Argument name"
                value={field?.name}
              />
              <select
                className="col-span-2 bg-white dark:bg-black-600 block border dark:border-black-200 dark:text-neargray-10 rounded mb-3 h-9 px-3 w-full outline-none"
                name="type"
                onChange={onChange(field?.id)}
                value={field?.type}
              >
                <option disabled value="">
                  Type
                </option>
                {inputTypes?.map((type) => (
                  <option key={type} value={type}>
                    {capitalize(type)}
                  </option>
                ))}
              </select>
              <input
                className="col-span-4 block border rounded mb-3 h-9 px-3 w-full outline-none"
                name="value"
                onChange={onChange(field?.id)}
                placeholder={field?.placeholder || 'Argument value'}
                value={field?.value}
              />
            </div>
            <button
              className="ml-3 p-1 mr-1 bg-red-300 self-start mt-1.5 hover:bg-red-400 text-xs font-medium rounded-md text-white"
              onClick={onRemove(field?.id)}
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
              disabled={loading || !connected}
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

    // <Accordion.Item
    //   value={index + 1}
    //   className="flex flex-col text-sm mb-3"
    //   key={index}
    // >
    //   <Accordion.Header>
    //     <Accordion.Trigger className="bg-gray-50 dark:bg-black-200/50 border dark:border-black-200 rounded flex items-center justify-between px-4 py-2 w-full">
    //       <span>
    //         <span className="text-gray-400">{index + 1}.</span>{' '}
    //         {toSnakeCase(method.name ?? '')}
    //       </span>
    //       <ArrowRight className="contract-icon fill-gray-600" />
    //     </Accordion.Trigger>
    //   </Accordion.Header>
    //   <Accordion.Content className="border p-4 rounded slide-up slide-down">
    //     <div className="flex max-w-xl justify-between mb-3">
    //       <div className="flex items-center">
    //         Arguments
    //         <OverlayTrigger
    //           placement="bottom-start"
    //           delay={{ show: 500, hide: 0 }}
    //           overlay={
    //             <Tooltip className="fixed h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2 ml-2">
    //               Specify an arguments schema.
    //             </Tooltip>
    //           }
    //         >
    //           <span>
    //             <Question className="w-4 h-4 fill-current ml-1" />
    //           </span>
    //         </OverlayTrigger>
    //       </div>
    //       <div className="flex ml-2 mr-1 text-xs px-3 py-1.5 rounded focus:outline-none disabled:opacity-70 disabled:cursor-not-allowed"></div>
    //       <div className="flex ml-2 mr-1 text-xs px-3 py-1.5 rounded focus:outline-none disabled:opacity-70 disabled:cursor-not-allowed"></div>
    //     </div>
    //     {fields.map((field: FieldType) => (
    //       <div key={field.id} className="flex max-w-xl items-center">
    //         <div className="sm:grid grid-cols-9 gap-2">
    //           <input
    //             name="name"
    //             value={field.name}
    //             onChange={(e) => onChange(e, 'name', field.id)}
    //             placeholder="Argument name"
    //             className="col-span-3 block border rounded mb-3 h-9 px-3 w-full outline-none"
    //           />
    //           <select
    //             name="type"
    //             value={field.type}
    //             onChange={(e) => onChange(e, 'type', field.id)}
    //             className="col-span-2 bg-white dark:bg-black-600 block border dark:border-black-200 dark:text-neargray-10 rounded mb-3 h-9 px-3 w-full outline-none"
    //           >
    //             <option value="" disabled>
    //               Type
    //             </option>
    //             {inputTypes.map((type) => (
    //               <option value={type} key={type}>
    //                 {capitalize(type)}
    //               </option>
    //             ))}
    //           </select>
    //           <input
    //             name="value"
    //             value={field.value}
    //             onChange={(e) => onChange(e, 'value', field.id)}
    //             placeholder={field.placeholder || 'Argument value'}
    //             className="col-span-4 block border rounded mb-3 h-9 px-3 w-full outline-none"
    //           />
    //         </div>
    //         <button
    //           onClick={onRemove(field.id)}
    //           className="ml-3 p-1 mr-1 bg-red-300 self-start mt-1.5 hover:bg-red-400 text-xs font-medium rounded-md text-white"
    //         >
    //           <CloseCircle className="text-white fill-white w-4 h-4" />
    //         </button>
    //       </div>
    //     ))}
    //     <div className="flex max-w-xl justify-between mb-3">
    //       <div className="flex items-center">
    //         Options
    //         <OverlayTrigger
    //           placement="bottom-start"
    //           delay={{ show: 500, hide: 0 }}
    //           overlay={
    //             <Tooltip className="fixed h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2 ml-2">
    //               Optional arguments for write operations.
    //             </Tooltip>
    //           }
    //         >
    //           <span>
    //             <Question className="w-4 h-4 fill-current ml-1" />
    //           </span>
    //         </OverlayTrigger>
    //       </div>
    //     </div>
    //     <div className="slide-down disclosure">
    //       <div className="max-w-xl sm:grid grid-cols-2 gap-2">
    //         <label>
    //           <span className="text-gray-400 text-xs">Attached deposit</span>
    //           <input
    //             name="attachedDeposit"
    //             value={options.attachedDeposit}
    //             onChange={onOptionChange('attachedDeposit')}
    //             placeholder="Attached Deposit"
    //             className="block border rounded my-1 h-9 px-3 w-full outline-none"
    //           />
    //         </label>
    //         <label>
    //           <span className="text-gray-400 text-xs">Gas</span>
    //           <input
    //             name="gas"
    //             value={options.gas}
    //             onChange={onOptionChange('gas')}
    //             placeholder="Gas"
    //             className="block border rounded my-1 h-9 px-3 w-full outline-none"
    //           />
    //         </label>
    //       </div>
    //     </div>
    //     <div className="flex items-center mt-5">
    //       {!hideQuery && method?.kind === 'view' && (
    //         <button
    //           type="submit"
    //           onClick={(e) => onRead(e)}
    //           disabled={loading}
    //           className="bg-green-500 hover:bg-green-400 text-white text-xs px-3 py-1.5 rounded focus:outline-none disabled:opacity-70 disabled:cursor-not-allowed"
    //         >
    //           Query
    //         </button>
    //       )}
    //       {method?.kind === 'call' && (
    //         <button
    //           type="submit"
    //           onClick={(e) => onWrite(e)}
    //           disabled={loading || !connected}
    //           className="bg-green-500 hover:bg-green-400 text-white text-xs px-3 py-1.5 rounded focus:outline-none disabled:opacity-70 disabled:cursor-not-allowed"
    //         >
    //           Write
    //         </button>
    //       )}
    //     </div>
    //     {error && (
    //       <textarea
    //         readOnly
    //         rows={6}
    //         className="block appearance-none outline-none w-full border rounded-lg dark:bg-red-200 dark:text-black-200 dark:border-red-400 bg-red-50 border-red-100 p-3 mt-3 resize-y"
    //         value={error}
    //       />
    //     )}
    //     {txn && (
    //       <div className="block appearance-none outline-none w-full border rounded-lg bg-green-50 border-green-100 p-3 mt-3">
    //         View txn details:{' '}
    //         <Tooltip.Provider>
    //           <Tooltip.Root>
    //             <Tooltip.Trigger asChild>
    //               <span className="truncate max-w-[120px] inline-block align-bottom text-green-500">
    //                 <Link href={`/txns/${txn}`} className="hover:no-underline">
    //                   <a className="text-green-500">{txn}</a>
    //                 </Link>
    //               </span>
    //             </Tooltip.Trigger>
    //             <Tooltip.Content
    //               className="h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2 ml-2"
    //               align="start"
    //               side="bottom"
    //             >
    //               {txn}
    //             </Tooltip.Content>
    //           </Tooltip.Root>
    //         </Tooltip.Provider>
    //       </div>
    //     )}
    //     {result && (
    //       <textarea
    //         readOnly
    //         rows={6}
    //         className="block appearance-none outline-none w-full border rounded-lg bg-green-50 dark:bg-green-100 dark:border-green-200 border-green-100 p-3 mt-3 resize-y"
    //         value={result}
    //       />
    //     )}
    //   </Accordion.Content>
    // </Accordion.Item>
  );
};

export default ViewOrChangeAbi;
