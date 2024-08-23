'use client';

import {
  convertToMetricPrefix,
  convertToUTC,
  dollarFormat,
  gasFee,
  getTimeAgoString,
  localFormat,
  nanoToMilli,
} from '@/utils/libs';
import Link from 'next/link';
import ErrorMessage from '../common/ErrorMessage';
import FileSlash from '../Icons/FileSlash';
import { gasPrice } from '@/utils/near';
import { BlocksInfo } from '@/utils/types';
import { networkId } from '@/utils/config';
interface Props {
  hash?: any;
  data: any;
  loading: any;
  price: any;
}

// Simulated absence of the translation function
const t = (key: string, p?: any): string | undefined => {
  p = {};
  const simulateAbsence = true; // Set to true to simulate absence of t
  return simulateAbsence ? undefined : key; // Return undefined to simulate absence
};

export default function Details(props: Props) {
  const { hash, data, price, loading: isLoading } = props;
  // const t = useTranslations();

  console.log({ propPrice: price?.stats[0]?.near_price });
  const Loader = (props: { className?: string }) => {
    return (
      <div
        className={`bg-gray-200 dark:bg-black-200 h-4 rounded shadow-sm animate-pulse ${props.className}`}
      ></div>
    );
  };

  interface Props {
    children?: string;
    href: string;
  }
  const LinkWrapper = (props: Props) => (
    <Link
      href={props.href}
      className="bg-green-500 dark:bg-black-200 bg-opacity-10 hover:bg-opacity-100 text-green-500 dark:text-green-250 hover:text-white text-xs px-2 py-1 rounded-xl hover:no-underline"
    >
      {props.children}
    </Link>
  );

  const block: BlocksInfo | null = data?.blocks?.[0];
  const gasUsed = block?.chunks_agg?.gas_used ?? '';
  const gasLimit = block?.chunks_agg?.gas_limit ?? '';
  return (
    <>
      <div className="md:flex items-center justify-between">
        <h1 className="text-xl text-nearblue-600 dark:text-neargray-10 px-2 py-5">
          {block ? (
            t ? (
              <>
                {t('block.heading.0') || 'Block'}
                <span key={1} className="font-semibold pl-1">
                  {t('block.heading.1', {
                    block: block?.block_height
                      ? localFormat(block?.block_height.toString())
                      : '',
                  }) ||
                    `#${
                      block?.block_height
                        ? localFormat(block?.block_height.toString())
                        : ''
                    }`}
                </span>
              </>
            ) : (
              <>
                Block
                <span key={1} className="font-semibold">
                  #
                  {block?.block_height
                    ? localFormat(block?.block_height.toString())
                    : ''}
                </span>
              </>
            )
          ) : null}
        </h1>
      </div>
      {!block ? (
        <div className="text-nearblue-700 text-xs px-2 mb-5">
          <div className="bg-white dark:bg-black-600 soft-shadow rounded-xl pb-1">
            <div className="text-sm text-nearblue-600 dark:text-neargray-10 divide-solid divide-gray-200 dark:divide-black-200 divide-y">
              <ErrorMessage
                icons={<FileSlash />}
                message="Sorry, We are unable to locate this BlockHash"
                mutedText={hash ? hash : ''}
              />
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="bg-white text-sm text-nearblue-600 dark:text-neargray-10 dark:bg-black-600 dark:divide-black-200 divide-solid divide-gray-200 divide-y soft-shadow rounded-xl">
            {networkId === 'testnet' && (
              <div className="flex flex-wrap p-4 text-red-500">
                {t('testnetNotice') || '[ This is a Testnet block only ]'}
              </div>
            )}
            <div className="flex flex-wrap p-4">
              <div className="w-full md:w-1/4 mb-2 md:mb-0">
                {t('block.height') || 'Block Height'}
              </div>
              {isLoading ? (
                <div className="w-full md:w-3/4">
                  <Loader className="flex w-20" />
                </div>
              ) : (
                <div className="w-full md:w-3/4 font-semibold break-words">
                  {block?.block_height
                    ? localFormat(block?.block_height.toString())
                    : block?.block_height ?? ''}
                </div>
              )}
            </div>
            <div className="flex flex-wrap p-4">
              <div className="w-full md:w-1/4 mb-2 md:mb-0">
                {t('block.hash') || 'Hash'}
              </div>
              {isLoading ? (
                <div className="w-full md:w-3/4">
                  <Loader className="flex w-full max-w-xl" />
                </div>
              ) : (
                <div className="w-full md:w-3/4 break-words">
                  {block?.block_hash}
                </div>
              )}
            </div>
            <div className="flex flex-wrap p-4">
              <div className="w-full md:w-1/4 mb-2 md:mb-0">
                {t('block.timestamp') || 'Timestamp'}
              </div>
              {isLoading ? (
                <div className="w-full md:w-3/4">
                  <Loader className="flex w-full max-w-sm" />
                </div>
              ) : (
                <div className="w-full md:w-3/4 break-words">
                  {block?.block_timestamp &&
                    `${getTimeAgoString(
                      nanoToMilli(block?.block_timestamp),
                    )} (${convertToUTC(
                      nanoToMilli(block?.block_timestamp),
                      true,
                    )}) +UTC`}
                </div>
              )}
            </div>
            <div className="flex flex-wrap p-4">
              <div className="w-full md:w-1/4 mb-2 md:mb-0">
                {t?.('block.transactions.0') || 'Transactions'}
              </div>
              {isLoading ? (
                <div className="w-full md:w-3/4">
                  <Loader className="flex w-full max-w-xs" />
                </div>
              ) : (
                block?.transactions_agg?.count && (
                  <div className="w-full md:w-3/4 break-words">
                    <LinkWrapper href={`/txns?block=${block?.block_hash}`}>
                      {t?.('block.transactions.1', {
                        txns:
                          localFormat(
                            block?.transactions_agg?.count?.toString(),
                          ) ||
                          block?.transactions_agg?.count?.toString() ||
                          'transactions',
                      }) ||
                        `${localFormat(
                          block?.transactions_agg?.count?.toString(),
                        )} transactions`}
                    </LinkWrapper>
                    &nbsp;
                    {t?.('block.transactions.2', {
                      receipts:
                        localFormat(block?.receipts_agg?.count?.toString()) ||
                        block?.receipts_agg?.count?.toString() ||
                        'receipts',
                    }) ||
                      `and ${localFormat(
                        block?.receipts_agg?.count?.toString(),
                      )} receipts`}
                  </div>
                )
              )}
            </div>

            <div className="flex flex-wrap p-4">
              <div className="w-full md:w-1/4 mb-2 md:mb-0">
                {t('block.author') || 'Author'}
              </div>
              {isLoading ? (
                <div className="w-full md:w-3/4">
                  <Loader className="flex w-full max-w-lg" />
                </div>
              ) : (
                <div className="w-full md:w-3/4 break-words">
                  <Link
                    href={`/address/${block?.author_account_id}`}
                    className="text-green-500 dark:text-green-250 hover:no-underline"
                  >
                    {block?.author_account_id}
                  </Link>
                </div>
              )}
            </div>
            <div className="flex flex-wrap p-4">
              <div className="w-full md:w-1/4 mb-2 md:mb-0">
                {t('block.gasUsed') || 'GAS Used'}
              </div>
              {isLoading ? (
                <div className="w-full md:w-3/4">
                  <Loader className="flex w-full max-w-lg" />
                </div>
              ) : (
                <div className="w-full md:w-3/4 break-words">
                  {gasUsed
                    ? convertToMetricPrefix(gasUsed.toString()) + 'gas'
                    : ''}
                </div>
              )}
            </div>
            <div className="flex flex-wrap p-4">
              <div className="w-full md:w-1/4 mb-2 md:mb-0">
                {t('block.gasLimit') || 'Gas Limit'}
              </div>
              {isLoading ? (
                <div className="w-full md:w-3/4">
                  <Loader className="flex w-full max-w-lg" />
                </div>
              ) : (
                <div className="w-full md:w-3/4 break-words">
                  {gasLimit
                    ? convertToMetricPrefix(gasLimit.toString()) + 'gas'
                    : ''}
                </div>
              )}
            </div>
            <div className="flex flex-wrap p-4">
              <div className="w-full md:w-1/4 mb-2 md:mb-0">
                {t('block.gasPrice') || 'GAS Price'}
              </div>
              {isLoading ? (
                <div className="w-full md:w-3/4">
                  <Loader className="flex w-full max-w-lg" />
                </div>
              ) : (
                <div className="w-full md:w-3/4 break-words">
                  {block?.gas_price
                    ? gasPrice(block?.gas_price.toString())
                    : block?.gas_price ?? ''}
                </div>
              )}
            </div>
            <div className="flex flex-wrap p-4">
              <div className="w-full md:w-1/4 mb-2 md:mb-0">
                {t('block.gasFee') || 'Gas Fee'}
              </div>
              {isLoading ? (
                <div className="w-full md:w-3/4">
                  <Loader className="flex w-full max-w-lg" />
                </div>
              ) : (
                <div className="w-full md:w-3/4 break-words">
                  {gasUsed && block?.gas_price
                    ? gasFee(gasUsed.toString(), block?.gas_price.toString()) +
                      ' Ⓝ'
                    : ''}
                </div>
              )}
            </div>
            <div className="flex flex-wrap p-4">
              <div className="w-full md:w-1/4 mb-2 md:mb-0">
                {t('block.parenthash') || 'Parent Hash'}
              </div>
              {isLoading ? (
                <div className="w-full md:w-3/4">
                  <Loader className="flex w-full max-w-lg" />
                </div>
              ) : (
                <div className="w-full md:w-3/4 break-words">
                  <Link
                    href={`/blocks/${block?.prev_block_hash}`}
                    className="text-green-500 dark:text-green-250 hover:no-underline"
                  >
                    {block?.prev_block_hash}
                  </Link>
                </div>
              )}
            </div>
            {networkId === 'mainnet' && (
              // && date
              <div className="flex flex-wrap p-4">
                <div className="w-full md:w-1/4 mb-2 md:mb-0">
                  {t('block.price') || 'Price'}
                </div>
                {isLoading ? (
                  <div className="w-full md:w-3/4">
                    <Loader className="flex w-full max-w-lg" />
                  </div>
                ) : (
                  <div className="w-full md:w-3/4 break-words">
                    {price
                      ? `$${dollarFormat(price?.stats[0]?.near_price)} / Ⓝ`
                      : 'N/A'}
                  </div>
                )}
              </div>
            )}
            <div className="flex flex-wrap p-4">
              <div className="w-full md:w-1/4 mb-2 md:mb-0">Shard Number</div>
              {isLoading ? (
                <div className="w-full md:w-3/4">
                  <Loader className="flex w-full max-w-lg" />
                </div>
              ) : (
                <div className="w-full md:w-3/4 break-words">
                  {block?.chunks_agg?.shards?.toString() &&
                    localFormat(block?.chunks_agg?.shards?.toString())}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}
