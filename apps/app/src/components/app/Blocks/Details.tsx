'use client';

import { useTranslations } from 'next-intl';

import { useConfig } from '@/hooks/app/useConfig';
import { Link } from '@/i18n/routing';
import {
  convertToMetricPrefix,
  convertToUTC,
  dollarFormat,
  gasFee,
  getTimeAgoString,
  localFormat,
  nanoToMilli,
} from '@/utils/app/libs';
import { gasPrice } from '@/utils/near';
import { BlocksInfo } from '@/utils/types';

import ErrorMessage from '../common/ErrorMessage';
import FileSlash from '../Icons/FileSlash';
interface Props {
  data: any;
  hash?: any;
  loading?: any;
  price: any;
}

export default function Details(props: Props) {
  const t = useTranslations();
  const { data, hash, price } = props;
  const nearPrice = price?.stats[0]?.near_price;
  const { networkId } = useConfig();

  interface Props {
    children?: string;
    href: string;
  }
  const LinkWrapper = (props: Props) => (
    <Link
      className="bg-green-500 dark:bg-black-200 bg-opacity-10 hover:bg-opacity-100 text-green-500 dark:text-green-250 hover:text-white text-xs px-2 py-1 rounded-xl hover:no-underline"
      href={props.href}
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
                <span className="font-semibold pl-1" key={1}>
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
                <span className="font-semibold" key={1}>
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
              <div className="w-full md:w-3/4 font-semibold break-words">
                {block?.block_height
                  ? localFormat(block?.block_height.toString())
                  : block?.block_height ?? ''}
              </div>
            </div>
            <div className="flex flex-wrap p-4">
              <div className="w-full md:w-1/4 mb-2 md:mb-0">
                {t('block.hash') || 'Hash'}
              </div>
              <div className="w-full md:w-3/4 break-words">
                {block?.block_hash}
              </div>
            </div>
            <div className="flex flex-wrap p-4">
              <div className="w-full md:w-1/4 mb-2 md:mb-0">
                {t('block.timestamp') || 'Timestamp'}
              </div>
              <div className="w-full md:w-3/4 break-words">
                {block?.block_timestamp &&
                  `${getTimeAgoString(
                    nanoToMilli(block?.block_timestamp),
                  )} (${convertToUTC(
                    nanoToMilli(block?.block_timestamp),
                    true,
                  )}) +UTC`}
              </div>
            </div>
            <div className="flex flex-wrap p-4">
              <div className="w-full md:w-1/4 mb-2 md:mb-0">
                {t?.('block.transactions.0') || 'Transactions'}
              </div>
              {block?.transactions_agg?.count && (
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
              )}
            </div>

            <div className="flex flex-wrap p-4">
              <div className="w-full md:w-1/4 mb-2 md:mb-0">
                {t('block.author') || 'Author'}
              </div>
              <div className="w-full md:w-3/4 break-words">
                <Link
                  className="text-green-500 dark:text-green-250 hover:no-underline"
                  href={`/address/${block?.author_account_id}`}
                >
                  {block?.author_account_id}
                </Link>
              </div>
            </div>
            <div className="flex flex-wrap p-4">
              <div className="w-full md:w-1/4 mb-2 md:mb-0">
                {t('block.gasUsed') || 'GAS Used'}
              </div>
              <div className="w-full md:w-3/4 break-words">
                {gasUsed
                  ? convertToMetricPrefix(gasUsed.toString()) + 'gas'
                  : ''}
              </div>
            </div>
            <div className="flex flex-wrap p-4">
              <div className="w-full md:w-1/4 mb-2 md:mb-0">
                {t('block.gasLimit') || 'Gas Limit'}
              </div>
              <div className="w-full md:w-3/4 break-words">
                {gasLimit
                  ? convertToMetricPrefix(gasLimit.toString()) + 'gas'
                  : ''}
              </div>
            </div>
            <div className="flex flex-wrap p-4">
              <div className="w-full md:w-1/4 mb-2 md:mb-0">
                {t('block.gasPrice') || 'GAS Price'}
              </div>
              <div className="w-full md:w-3/4 break-words">
                {block?.gas_price
                  ? gasPrice(block?.gas_price.toString())
                  : block?.gas_price ?? ''}
              </div>
            </div>
            <div className="flex flex-wrap p-4">
              <div className="w-full md:w-1/4 mb-2 md:mb-0">
                {t('block.gasFee') || 'Gas Fee'}
              </div>
              <div className="w-full md:w-3/4 break-words">
                {gasUsed && block?.gas_price
                  ? gasFee(gasUsed.toString(), block?.gas_price.toString()) +
                    ' Ⓝ'
                  : ''}
              </div>
            </div>
            <div className="flex flex-wrap p-4">
              <div className="w-full md:w-1/4 mb-2 md:mb-0">
                {t('block.parenthash') || 'Parent Hash'}
              </div>
              <div className="w-full md:w-3/4 break-words">
                <Link
                  className="text-green-500 dark:text-green-250 hover:no-underline"
                  href={`/blocks/${block?.prev_block_hash}`}
                >
                  {block?.prev_block_hash}
                </Link>
              </div>
            </div>
            {networkId === 'mainnet' && (
              // && date
              <div className="flex flex-wrap p-4">
                <div className="w-full md:w-1/4 mb-2 md:mb-0">
                  {t('block.price') || 'Price'}
                </div>
                <div className="w-full md:w-3/4 break-words">
                  {nearPrice && !isNaN(Number(nearPrice))
                    ? `$${dollarFormat(Number(nearPrice))} / Ⓝ`
                    : 'N/A'}
                </div>
              </div>
            )}
            <div className="flex flex-wrap p-4">
              <div className="w-full md:w-1/4 mb-2 md:mb-0">Shard Number</div>
              <div className="w-full md:w-3/4 break-words">
                {block?.chunks_agg?.shards?.toString() &&
                  localFormat(block?.chunks_agg?.shards?.toString())}
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
