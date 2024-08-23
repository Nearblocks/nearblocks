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
import { useMemo, useState } from 'react';
import ErrorMessage from '../common/ErrorMessage';
import FileSlash from '../Icons/FileSlash';
import { gasPrice } from '@/utils/near';
import { fetcher, useFetch } from '@/hooks/useFetch';
import useTranslation from 'next-translate/useTranslation';
import { BlocksInfo } from '@/utils/types';
import { networkId } from '@/utils/config';
import Skeleton from '../skeleton/common/Skeleton';
interface Props {
  hash?: any;
}
export default function Details(props: Props) {
  const { hash } = props;
  const { t } = useTranslation();
  const [price, setPrice] = useState('');
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
  const {
    data: blockDetails,
    loading: isLoading,
    error,
  } = useFetch(`blocks/${hash}`);
  const block: BlocksInfo | null = blockDetails?.blocks?.[0];
  const date = useMemo(() => {
    if (block?.block_timestamp) {
      function fetchPriceAtDate(date: string) {
        fetcher(`stats/price?date=${date}`).then(
          (data: { stats: { near_price: string }[]; status: number }) => {
            const resp = data?.stats[0];
            setPrice(resp?.near_price);
          },
        );
      }
      const timestamp = new Date(nanoToMilli(block?.block_timestamp));
      const currentDate = new Date();
      const currentDay = currentDate.getUTCDate();
      const currentMonth = currentDate.getUTCMonth() + 1;
      const currentYear = currentDate.getUTCFullYear();
      const currentDt = `${currentYear}-${
        currentMonth < 10 ? '0' : ''
      }${currentMonth}-${currentDay < 10 ? '0' : ''}${currentDay}`;
      const day = timestamp.getUTCDate();
      const month = timestamp.getUTCMonth() + 1;
      const year = timestamp.getUTCFullYear();
      const blockDt = `${year}-${month < 10 ? '0' : ''}${month}-${
        day < 10 ? '0' : ''
      }${day}`;
      if (currentDt > blockDt) {
        fetchPriceAtDate(blockDt);
        return blockDt;
      }
    }
    return;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [block?.block_timestamp]);
  const gasUsed = block?.chunks_agg?.gas_used ?? '';
  const gasLimit = block?.chunks_agg?.gas_limit ?? '';
  return (
    <>
      <div className="md:flex items-center justify-between">
        {isLoading ? (
          <div className="w-80 max-w-xs px-3 py-5">
            <Skeleton className="h-7" />
          </div>
        ) : (
          <h1 className="text-xl text-nearblue-600 dark:text-neargray-10 px-2 py-5">
            {t ? (
              <>
                {t('blocks:block.heading.0')}
                <span key={1} className="font-semibold pl-1">
                  {t('blocks:block.heading.1', {
                    block: block?.block_height
                      ? localFormat(block?.block_height.toString())
                      : '',
                  })}
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
            )}
          </h1>
        )}
      </div>
      {error || (!isLoading && !block) ? (
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
                {t
                  ? t('blocks:testnetNotice')
                  : '[ This is a Testnet block only ]'}
              </div>
            )}
            <div className="flex flex-wrap p-4">
              <div className="w-full md:w-1/4 mb-2 md:mb-0">
                {t ? t('blocks:block.height') : 'Block Height'}
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
                {t ? t('blocks:block.hash') : 'Hash'}
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
                {t ? t('blocks:block.timestamp') : 'Timestamp'}
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
                {t ? t('blocks:block.transactions.0') : 'Transactions'}
              </div>
              {isLoading ? (
                <div className="w-full md:w-3/4">
                  <Loader className="flex w-full max-w-xs" />
                </div>
              ) : (
                block?.transactions_agg?.count && (
                  <div className="w-full md:w-3/4 break-words">
                    {t ? (
                      <>
                        <LinkWrapper href={`/txns?block=${block?.block_hash}`}>
                          {t('blocks:block.transactions.1', {
                            txns: block?.transactions_agg?.count
                              ? localFormat(
                                  block?.transactions_agg?.count?.toString(),
                                )
                              : block?.transactions_agg?.count?.toString() ??
                                '',
                          })}
                        </LinkWrapper>
                        &nbsp;
                        {t('blocks:block.transactions.2', {
                          receipts: block?.receipts_agg?.count
                            ? localFormat(
                                block?.receipts_agg?.count?.toString(),
                              )
                            : block?.receipts_agg?.count?.toString() ?? '',
                        })}
                      </>
                    ) : (
                      <>
                        (
                        <LinkWrapper href={`/txns?block=${block?.block_hash}`}>
                          {block?.transactions_agg?.count
                            ? localFormat(
                                block?.transactions_agg?.count.toString(),
                              )
                            : block?.transactions_agg?.count.toString() ??
                              '' + ' transactions'}
                        </LinkWrapper>
                        ) + `and $
                        {block?.receipts_agg?.count
                          ? localFormat(block?.receipts_agg?.count.toString())
                          : block?.receipts_agg?.count ?? ''}{' '}
                        receipts`
                      </>
                    )}
                  </div>
                )
              )}
            </div>
            <div className="flex flex-wrap p-4">
              <div className="w-full md:w-1/4 mb-2 md:mb-0">
                {t ? t('blocks:block.author') : 'Author'}
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
                {t ? t('blocks:block.gasUsed') : 'GAS Used'}
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
                {t ? t('blocks:block.gasLimit') : 'Gas Limit'}
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
                {t ? t('blocks:block.gasPrice') : 'GAS Price'}
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
                {t ? t('blocks:block.gasFee') : 'Gas Fee'}
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
                {t ? t('blocks:block.parenthash') : 'Parent Hash'}
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
            {networkId === 'mainnet' && date && (
              <div className="flex flex-wrap p-4">
                <div className="w-full md:w-1/4 mb-2 md:mb-0">
                  {t ? t('blocks:block.price') : 'Price'}
                </div>
                {isLoading ? (
                  <div className="w-full md:w-3/4">
                    <Loader className="flex w-full max-w-lg" />
                  </div>
                ) : (
                  <div className="w-full md:w-3/4 break-words">
                    {price ? `$${dollarFormat(price)} / Ⓝ` : 'N/A'}
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
