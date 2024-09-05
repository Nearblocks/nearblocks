import TxnsReceiptStatus from '@/components/common/TxnsReceiptStatus';
import Question from '@/components/Icons/Question';
import useRpc from '@/hooks/useRpc';
import { hexy } from '@/utils/hexy';
import { convertToMetricPrefix, localFormat, yoctoToNear } from '@/utils/libs';
import {
  Action,
  FunctionCallActionView,
  ReceiptsPropsInfo,
} from '@/utils/types';
import { Tooltip } from '@reach/tooltip';
import Big from 'big.js';
import useTranslation from 'next-translate/useTranslation';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Tab, TabList, TabPanel, Tabs } from 'react-tabs';

interface Props {
  receipt: ReceiptsPropsInfo | any;
}

const ReceiptInfo = ({ receipt }: Props) => {
  const hashes = ['output', 'inspect'];
  const [pageHash, setHash] = useState('output');
  const [tabIndex, setTabIndex] = useState(0);
  const { t } = useTranslation();
  const onTab = (index: number) => {
    setHash(hashes[index]);
  };

  const [block, setBlock] = useState<{ height: string } | null>(null);

  const [loading, setLoading] = useState(false);
  const { getBlockDetails } = useRpc();

  useEffect(() => {
    const index = hashes.indexOf(pageHash as string);

    setTabIndex(index === -1 ? 0 : index);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageHash]);

  useEffect(() => {
    function fetchBlocks() {
      setLoading(true);
      if (receipt?.outcome?.blockHash) {
        getBlockDetails(receipt?.outcome.blockHash)
          .then((resp: any) => {
            setBlock(resp?.header);
            setLoading(false);
          })
          .catch(() => {});
      }
    }

    fetchBlocks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [receipt?.outcome?.blockHash]);

  let statusInfo;

  if (receipt?.outcome?.status?.type === 'successValue') {
    if (receipt?.outcome?.status?.value.length === 0) {
      statusInfo = (
        <div className="bg-gray-100 dark:bg-black-200 rounded-md p-5 font-medium my-3 whitespace-nowrap">
          Empty result
        </div>
      );
    } else {
      const args = receipt?.outcome?.status.value;
      const decodedArgs = Buffer.from(args, 'base64');

      let prettyArgs: object | string;
      try {
        const parsedJSONArgs = JSON.parse(decodedArgs.toString());
        if (parsedJSONArgs !== null) {
          prettyArgs =
            typeof parsedJSONArgs === 'boolean'
              ? JSON.stringify(parsedJSONArgs)
              : parsedJSONArgs;
        } else {
          prettyArgs = hexy(decodedArgs, { format: 'twos' });
        }
      } catch {
        prettyArgs = Array.from(decodedArgs)
          .map((byte: any) => byte.toString(16).padStart(2, '0'))
          .join('');
      }

      statusInfo =
        prettyArgs && typeof prettyArgs === 'object' ? (
          <textarea
            readOnly
            rows={4}
            defaultValue={JSON.stringify(prettyArgs)}
            className="block appearance-none outline-none w-full border font-medium rounded-lg bg-gray-100 dark:bg-black-200 dark:border-black-200 p-5 my-3 resize-y"
          ></textarea>
        ) : (
          <div>
            <div className="bg-gray-100 dark:bg-black-200 rounded-md p-5 font-medium my-3">
              <div className="bg-inherit text-inherit font-inherit border-none p-0">
                <div className="max-h-52 overflow-auto">
                  <div className="h-full w-full">
                    <pre>{prettyArgs}</pre>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
    }
  } else if (receipt?.outcome?.status?.type === 'failure') {
    statusInfo = (
      <textarea
        readOnly
        rows={4}
        defaultValue={JSON.stringify(receipt.outcome.status.error, null, 2)}
        className="block appearance-none outline-none w-full border dark:border-black-200 rounded-lg font-medium bg-gray-100 dark:bg-black-200 p-5 my-3 resize-y"
      ></textarea>
    );
  } else if (receipt?.outcome?.status?.type === 'successReceiptId') {
    statusInfo = (
      <div className="bg-gray-100 dark:bg-black-200 rounded-md my-3 p-5 font-medium overflow-auto">
        <pre>{receipt?.outcome?.status?.receiptId}</pre>
      </div>
    );
  }

  const getDeposit = (actions: Action[]): string =>
    actions
      .map((action) => ('deposit' in action.args ? action.args.deposit : '0'))
      .reduce(
        (acc, deposit) =>
          Big(acc || '0')
            .plus(deposit)
            .toString(),
        '0',
      );

  const getGasAttached = (actions: Action[]): string => {
    const gasAttached = actions
      .map((action) => action.args)
      .filter(
        (args): args is FunctionCallActionView['FunctionCall'] => 'gas' in args,
      );

    if (gasAttached.length === 0) {
      return '0';
    }

    return gasAttached.reduce(
      (acc, args) =>
        Big(acc || '0')
          .plus(args.gas)
          .toString(),
      '0',
    );
  };

  const getRefund = (receipts: any[]): string =>
    receipts
      .filter(
        (receipt) => 'outcome' in receipt && receipt.predecessorId === 'system',
      )
      .reduce(
        (acc, receipt) =>
          Big(acc || '0')
            .plus(getDeposit(receipt.actions))
            .toString(),
        '0',
      );

  const getPreCharged = (receipt: any) =>
    Big(receipt?.outcome?.tokensBurnt || '0')
      .plus(getRefund(receipt?.outcome?.nestedReceipts))
      .toString();

  const status = receipt?.outcome?.status.type;
  const isSuccess =
    (status &&
      status === 'successValue' &&
      status !== null &&
      status !== undefined) ||
    status === 'successReceiptId';

  return (
    <div className="flex flex-col">
      <Tabs selectedIndex={tabIndex} onSelect={(index) => onTab(index)}>
        <TabList>
          {hashes &&
            hashes.map((hash, index) => (
              <Tab
                key={index}
                className={`text-nearblue-600 text-xs leading-4 ${
                  hash === 'output' ? 'ml-6' : 'ml-3'
                } font-medium overflow-hidden inline-block cursor-pointer p-2 focus:outline-none ${
                  pageHash === hash
                    ? 'rounded-lg bg-green-600 dark:bg-green-250 text-white'
                    : 'hover:bg-neargray-800 bg-neargray-700 dark:text-neargray-10 dark:bg-black-200 rounded-lg hover:text-nearblue-600'
                }`}
                value={hash}
              >
                {hash === 'output' ? <h2>Output</h2> : <h2>Inspect</h2>}
              </Tab>
            ))}
        </TabList>
        <TabPanel
          value={hashes[0]}
          className={'w-full focus:border-none focus:outline-none'}
        >
          <div className="flex flex-col my-4 ml-6">
            <div className="">
              <h2 className="flex items-center text-sm font-medium">
                <Tooltip
                  label={'Logs included in the receipt'}
                  className="absolute h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2"
                >
                  <div>
                    <Question className="w-4 h-4 fill-current mr-1" />
                  </div>
                </Tooltip>
                Logs
              </h2>
              <div className="bg-gray-100 dark:bg-black-200 rounded-md p-0  mt-3 overflow-x-auto">
                {receipt?.outcome?.logs?.length > 0 ? (
                  <div className="w-full  break-words  space-y-4">
                    <textarea
                      readOnly
                      rows={4}
                      defaultValue={receipt?.outcome?.logs.join('\n')}
                      className="block appearance-none outline-none w-full border rounded-lg bg-gray-100 dark:bg-black-200 dark:border-black-200 p-5 resize-y"
                    ></textarea>
                  </div>
                ) : (
                  <div className="w-full  break-words p-5 font-medium space-y-4">
                    No Logs
                  </div>
                )}
              </div>
            </div>
            <div className="mt-4">
              <h2 className="flex items-center text-sm font-medium">
                <Tooltip
                  label={'The result of the receipt execution'}
                  className="absolute h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2"
                >
                  <div>
                    <Question className="w-4 h-4 fill-current mr-1" />
                  </div>
                </Tooltip>
                Result
              </h2>
              {statusInfo}
            </div>
          </div>
        </TabPanel>
        <TabPanel
          value={hashes[1]}
          className={'w-fit focus:border-none focus:outline-none'}
        >
          <div className="overflow-x-auto">
            <table className="my-4 mx-6 whitespace-nowrap table-auto">
              <tbody>
                <tr>
                  <td className="flex items-center py-2 pr-4">
                    <Tooltip
                      label={'Unique identifier (hash) of this receipt.'}
                      className="absolute h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2"
                    >
                      <div>
                        <Question className="w-4 h-4 fill-current mr-1" />
                      </div>
                    </Tooltip>
                    Receipt
                  </td>
                  <td className="font-semibold py-2 pl-4">{receipt?.id}</td>
                </tr>
                <tr>
                  <td className="flex items-center py-2 pr-4">
                    <Tooltip
                      label={t('txns:txn.status.tooltip')}
                      className="absolute h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2"
                    >
                      <div>
                        <div>
                          <Question className="w-4 h-4 fill-current mr-1" />
                        </div>
                      </div>
                    </Tooltip>
                    {t ? t('txns:txn.status.text.0') : 'Status'}
                  </td>
                  <td className="font-semibold py-2 pl-4">
                    {receipt?.outcome?.status !== undefined && (
                      <TxnsReceiptStatus showLabel status={isSuccess} />
                    )}
                  </td>
                </tr>
                <tr>
                  <td
                    className={`flex items-center py-2 pr-4 ${
                      !block ? 'whitespace-normal' : 'whitespace-nowrap'
                    }`}
                  >
                    <Tooltip
                      label={'Block height'}
                      className="absolute h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2"
                    >
                      <div>
                        <Question className="w-4 h-4 fill-current mr-1" />
                      </div>
                    </Tooltip>
                    Block
                  </td>
                  <td className="py-2 pl-4">
                    {block && (
                      <Link
                        href={`/blocks/${receipt?.outcome?.blockHash}`}
                        className="text-green-500 dark:text-green-250"
                      >
                        {!loading &&
                          block?.height &&
                          localFormat(block?.height)}
                      </Link>
                    )}
                  </td>
                </tr>
                <tr>
                  <td className="flex items-center py-2 pr-4">
                    <Tooltip
                      label={'The account which issued the receipt'}
                      className="absolute h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2"
                    >
                      <div>
                        <Question className="w-4 h-4 fill-current mr-1" />
                      </div>
                    </Tooltip>
                    From
                  </td>
                  <td className="py-2 pl-4">
                    <Link
                      href={`/address/${receipt?.predecessorId}`}
                      className="text-green-500 dark:text-green-250 hover:no-underline"
                    >
                      {receipt?.predecessorId}
                    </Link>
                  </td>
                </tr>
                <tr>
                  <td className="flex items-center py-2 pr-4">
                    <Tooltip
                      label={'The destination account of the receipt'}
                      className="absolute h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2"
                    >
                      <div>
                        <Question className="w-4 h-4 fill-current mr-1" />
                      </div>
                    </Tooltip>
                    To
                  </td>
                  <td className="py-2 pl-4">
                    <Link
                      href={`/address/${receipt?.receiverId}`}
                      className="text-green-500 dark:text-green-250 hover:no-underline"
                    >
                      {receipt?.receiverId}
                    </Link>
                  </td>
                </tr>
                <tr>
                  <td className="flex items-center py-2 pr-4">
                    <Tooltip
                      label={'Maximum amount of gas allocated for the Receipt'}
                      className="absolute h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2"
                    >
                      <div>
                        <Question className="w-4 h-4 fill-current mr-1" />
                      </div>
                    </Tooltip>
                    Gas Limit
                  </td>
                  <td className="py-2 pl-4">{`${
                    !loading &&
                    receipt?.actions &&
                    convertToMetricPrefix(getGasAttached(receipt?.actions))
                  }gas`}</td>
                </tr>
                <tr>
                  <td className="flex items-center py-2 pr-4">
                    <Tooltip
                      label={'Fees Pre-charged on Receipt'}
                      className="absolute h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2"
                    >
                      <div>
                        <Question className="w-4 h-4 fill-current mr-1" />
                      </div>
                    </Tooltip>
                    Pre-charged Fee
                  </td>
                  <td className="py-2 pl-4">{`${
                    !loading &&
                    receipt &&
                    yoctoToNear(getPreCharged(receipt), true)
                  } Ⓝ`}</td>
                </tr>
                <tr>
                  <td className="flex items-center py-2 pr-4">
                    <Tooltip
                      label={'Burnt Gas by Receipt'}
                      className="absolute h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2"
                    >
                      <div>
                        <Question className="w-4 h-4 fill-current mr-1" />
                      </div>
                    </Tooltip>
                    Burnt Gas
                  </td>
                  <td className="text-xs py-2 pl-4">
                    <span className="bg-orange-50 dark:bg-black-200 rounded-md px-2 py-1">
                      <span className="text-xs mr-2">🔥 </span>
                      {`${
                        !loading && receipt?.outcome?.gasBurnt
                          ? convertToMetricPrefix(receipt?.outcome?.gasBurnt)
                          : receipt?.outcome?.gasBurnt ?? ''
                      }gas`}
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="flex items-center py-2 pr-4">
                    <Tooltip
                      label={'Burnt Tokens by Receipt'}
                      className="absolute h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2"
                    >
                      <div>
                        <Question className="w-4 h-4 fill-current mr-1" />
                      </div>
                    </Tooltip>
                    Burnt Tokens
                  </td>
                  <td className="text-xs py-2 pl-4">
                    <span className="bg-orange-50 dark:bg-black-200 rounded-md px-2 py-1">
                      <span className="text-xs mr-2">🔥 </span>
                      {!loading && receipt?.outcome?.tokensBurnt
                        ? yoctoToNear(receipt?.outcome?.tokensBurnt, true)
                        : receipt?.outcome?.tokensBurnt ?? ''}
                      Ⓝ
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="flex items-center py-2 pr-4">
                    <Tooltip
                      label={'Refund from the receipt'}
                      className="absolute h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2"
                    >
                      <div>
                        <Question className="w-4 h-4 fill-current mr-1" />
                      </div>
                    </Tooltip>
                    Refund
                  </td>
                  <td className="py-2 pl-4">
                    {!loading &&
                      receipt?.outcome?.nestedReceipts &&
                      yoctoToNear(
                        getRefund(receipt?.outcome?.nestedReceipts) || '0',
                        true,
                      )}
                    Ⓝ
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </TabPanel>
      </Tabs>
    </div>
  );
};
export default ReceiptInfo;
