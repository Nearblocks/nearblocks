'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

import { useConfig } from '@/hooks/app/useConfig';
import useRpc from '@/hooks/app/useRpc';
import { Link } from '@/i18n/routing';
import {
  convertTimestampToTimes,
  convertToMetricPrefix,
  dollarFormat,
  gasFee,
  localFormat,
  nanoToMilli,
} from '@/utils/app/libs';
import { gasPrice } from '@/utils/near';
import { BlocksInfo } from '@/utils/types';
import dayjs from '../../../utils/app/dayjs';

import ErrorMessage from '../common/ErrorMessage';
import FileSlash from '../Icons/FileSlash';
import Skeleton from '../skeleton/common/Skeleton';
import Tooltip from '../common/Tooltip';
interface Props {
  data: any;
  hash?: any;
  loading?: any;
  price: any;
}

interface BlockData {
  blocks: BlocksInfo[];
}

export default function Details(props: Props) {
  const t = useTranslations();
  const { data, hash, price } = props;
  const nearPrice = price?.stats[0]?.near_price;
  const { networkId } = useConfig();
  const { getBlockDetails } = useRpc();
  const [blockInfo, setBlockInfo] = useState<BlockData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [utc, setUtc] = useState(true);

  useEffect(() => {
    const fetchBlockData = async () => {
      if (
        !data ||
        (Array?.isArray(data?.blocks) && data?.blocks?.length === 0)
      ) {
        try {
          const res = await getBlockDetails(hash);

          if (res) {
            let limit = 0;
            let used = 0;
            limit = res?.chunks.reduce((acc, curr) => acc + curr.gas_limit, 0);
            used = res.chunks.reduce((acc, curr) => acc + curr.gas_used, 0);

            const rpcBlockData = {
              blocks: [
                {
                  author_account_id: res?.author,
                  block_hash: res?.header?.hash,
                  block_height: res?.header?.height,
                  block_timestamp: res?.header?.timestamp,
                  chunks_agg: {
                    gas_limit: limit,
                    gas_used: used,
                    shards: res?.header?.chunks_included,
                  },
                  gas_price: res?.header?.gas_price,
                  prev_block_hash: res?.header?.prev_hash,
                },
              ],
            };

            setBlockInfo(rpcBlockData as any);
            setIsLoading(false);
          }
        } catch (err) {
          console.error('Error fetching block data:', err);
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };

    fetchBlockData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, hash]);

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

  const block =
    Array.isArray(data?.blocks) && data?.blocks?.length === 0
      ? blockInfo?.blocks?.[0]
      : data?.blocks?.[0];

  const { utcTime, localTime } = convertTimestampToTimes(
    block?.block_timestamp,
  );

  return (
    <>
      <div className="md:flex items-center justify-between">
        {isLoading ? (
          <div className="w-80 max-w-xs px-3 py-5">
            <Skeleton className="h-7" />
          </div>
        ) : (
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
        )}
      </div>
      {!isLoading && !block ? (
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
                  <Skeleton className="flex w-20 h-4" />
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
                  <Skeleton className="flex w-full max-w-xl h-4" />
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
                  <Skeleton className="flex w-full max-w-sm h-4" />
                </div>
              ) : (
                <div className="w-full md:w-3/4 break-words">
                  {block?.block_timestamp && (
                    <>
                      <span className="mr-1">
                        {dayjs().to(dayjs(nanoToMilli(block?.block_timestamp)))}
                      </span>
                      <Tooltip
                        className={'left-1/2 whitespace-nowrap max-w-[200px]'}
                        position="top"
                        tooltip={utc ? 'Switch to local time' : 'Switch to UTC'}
                      >
                        <button
                          onClick={() => setUtc((prevState) => !prevState)}
                        >
                          {`(${utc ? utcTime : localTime})`}
                        </button>
                      </Tooltip>
                    </>
                  )}
                </div>
              )}
            </div>
            <div className="flex flex-wrap p-4">
              <div className="w-full md:w-1/4 mb-2 md:mb-0">
                {t ? t('block.transactions.0') : 'Transactions'}
              </div>
              {isLoading ? (
                <div className="w-full md:w-3/4">
                  <Skeleton className="flex w-full max-w-xs h-4" />
                </div>
              ) : (
                block?.transactions_agg?.count && (
                  <div className="w-full md:w-3/4 break-words">
                    {t ? (
                      <>
                        {networkId === 'mainnet' ? (
                          <LinkWrapper
                            href={`/txns?block=${block?.block_hash}`}
                          >
                            {t('block.transactions.1', {
                              txns: block?.transactions_agg?.count
                                ? localFormat(
                                    block?.transactions_agg?.count?.toString(),
                                  )
                                : block?.transactions_agg?.count?.toString() ??
                                  '',
                            })}
                          </LinkWrapper>
                        ) : (
                          <>
                            <LinkWrapper
                              href={`/txns?block=${block?.block_hash}`}
                            >
                              {t('block.transactions.1', {
                                txns: block?.transactions_agg?.count
                                  ? localFormat(
                                      block?.transactions_agg?.count?.toString(),
                                    )
                                  : block?.transactions_agg?.count?.toString() ??
                                    '',
                              })}
                            </LinkWrapper>
                            &nbsp;
                            {t('block.transactions.2', {
                              receipts: block?.receipts_agg?.count
                                ? localFormat(
                                    block?.receipts_agg?.count?.toString(),
                                  )
                                : block?.receipts_agg?.count?.toString() ?? '',
                            })}{' '}
                          </>
                        )}
                      </>
                    ) : (
                      <>
                        {networkId === 'mainnet' ? (
                          <>
                            (
                            <LinkWrapper
                              href={`/txns?block=${block?.block_hash}`}
                            >
                              {block?.transactions_agg?.count
                                ? localFormat(
                                    block?.transactions_agg?.count.toString(),
                                  )
                                : block?.transactions_agg?.count.toString() ??
                                  '' + ' transactions'}
                            </LinkWrapper>
                            )
                          </>
                        ) : (
                          <>
                            (
                            <LinkWrapper
                              href={`/txns?block=${block?.block_hash}`}
                            >
                              {block?.transactions_agg?.count
                                ? localFormat(
                                    block?.transactions_agg?.count.toString(),
                                  )
                                : block?.transactions_agg?.count.toString() ??
                                  '' + ' transactions'}
                            </LinkWrapper>
                            ) + `and $
                            {block?.receipts_agg?.count
                              ? localFormat(
                                  block?.receipts_agg?.count.toString(),
                                )
                              : block?.receipts_agg?.count ?? ''}{' '}
                            receipts`
                          </>
                        )}
                      </>
                    )}
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
                  <Skeleton className="flex w-full max-w-lg h-4" />
                </div>
              ) : (
                <div className="w-full md:w-3/4 break-words">
                  <Link
                    className="text-green-500 dark:text-green-250 hover:no-underline"
                    href={`/address/${block?.author_account_id}`}
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
                  <Skeleton className="flex w-full max-w-lg h-4" />
                </div>
              ) : (
                <div className="w-full md:w-3/4 break-words">
                  {block?.chunks_agg?.gas_used !== undefined &&
                  block?.chunks_agg?.gas_used !== null &&
                  Number(block?.chunks_agg?.gas_used) !== 0
                    ? convertToMetricPrefix(
                        block?.chunks_agg?.gas_used.toString(),
                      ) + 'gas'
                    : Number(block?.chunks_agg?.gas_used) === 0
                    ? block?.chunks_agg?.gas_used + ' gas'
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
                  <Skeleton className="flex w-full max-w-lg h-4" />
                </div>
              ) : (
                <div className="w-full md:w-3/4 break-words">
                  {block?.chunks_agg?.gas_limit
                    ? convertToMetricPrefix(
                        block?.chunks_agg?.gas_limit.toString(),
                      ) + 'gas'
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
                  <Skeleton className="flex w-full max-w-lg h-4" />
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
                  <Skeleton className="flex w-full max-w-lg h-4" />
                </div>
              ) : (
                <div className="w-full md:w-3/4 break-words">
                  {block?.chunks_agg?.gas_used !== undefined &&
                  block?.chunks_agg?.gas_used !== null &&
                  block?.gas_price
                    ? gasFee(
                        block?.chunks_agg?.gas_used.toString(),
                        block?.gas_price.toString(),
                      ) + ' Ⓝ'
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
                  <Skeleton className="flex w-full max-w-lg h-4" />
                </div>
              ) : (
                <div className="w-full md:w-3/4 break-words">
                  <Link
                    className="text-green-500 dark:text-green-250 hover:no-underline"
                    href={`/blocks/${block?.prev_block_hash}`}
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
                    <Skeleton className="flex w-full max-w-lg h-4" />
                  </div>
                ) : (
                  <div className="w-full md:w-3/4 break-words">
                    {nearPrice && !isNaN(Number(nearPrice))
                      ? `$${dollarFormat(Number(nearPrice))} / Ⓝ`
                      : 'N/A'}
                  </div>
                )}
              </div>
            )}
            <div className="flex flex-wrap p-4">
              <div className="w-full md:w-1/4 mb-2 md:mb-0">Shard Number</div>
              {isLoading ? (
                <div className="w-full md:w-3/4">
                  <Skeleton className="flex w-full max-w-lg h-4" />
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
