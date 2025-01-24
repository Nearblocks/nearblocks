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
import useTranslation from 'next-translate/useTranslation';
import { BlocksInfo } from '@/utils/types';
import { networkId } from '@/utils/config';
import ListCheck from '../Icons/ListCheck';
import FaCheckCircle from '../Icons/FaCheckCircle';
import Skeleton from '../skeleton/common/Skeleton';

interface Props {
  hash: string;
  blockInfo?: any;
  error: boolean;
  price: string;
  isLoading: boolean;
}

const Details = (props: Props) => {
  const { hash, blockInfo, price, error, isLoading } = props;

  const { t } = useTranslation();

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

  const block: BlocksInfo | null = blockInfo?.blocks?.[0];

  return (
    <>
      <div className="flex items-center justify-between flex-wrap">
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
        <ul className="flex relative md:pt-0 pt-2 items-center text-gray-500 text-xs">
          <li className="ml-3 max-md:mb-2">
            <span className="group flex w-full relative h-full">
              <a
                className={`md:flex justify-center w-full hover:text-green-500 dark:hover:text-green-250 hover:no-underline px-0 py-1`}
                href="#"
              >
                <div className="py-2 px-2 h-8 bg-gray-100 dark:bg-black-200 rounded border">
                  <ListCheck className="h-4 dark:filter dark:invert" />
                </div>
              </a>
              <ul className="bg-white dark:bg-black-600 soft-shadow hidden min-w-full absolute top-full right-0 rounded-md group-hover:block py-1 z-[99]">
                <li className="pb-2">
                  <a
                    className={`flex items-center whitespace-nowrap px-2 pt-2 hover:text-green-400 dark:text-neargray-10 dark:hover:text-green-250`}
                    href={`https://nearvalidate.org/blocks/${hash}?network=${networkId}`}
                    target="_blank"
                  >
                    Validate Block
                    <span className="w-4 ml-3 dark:text-green-250">
                      <FaCheckCircle />
                    </span>
                  </a>
                </li>
              </ul>
            </span>
          </li>
        </ul>
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
                {t ? t('blocks:block.hash') : 'Hash'}
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
                {t ? t('blocks:block.timestamp') : 'Timestamp'}
              </div>
              {isLoading ? (
                <div className="w-full md:w-3/4">
                  <Skeleton className="flex w-full max-w-sm h-4" />
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
                  <Skeleton className="flex w-full max-w-xs h-4" />
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
                        {/* &nbsp;
                        {t('blocks:block.transactions.2', {
                          receipts: block?.receipts_agg?.count
                            ? localFormat(
                                block?.receipts_agg?.count?.toString(),
                              )
                            : block?.receipts_agg?.count?.toString() ?? '',
                        })} */}
                      </>
                    ) : (
                      // <>
                      //   (
                      //   <LinkWrapper href={`/txns?block=${block?.block_hash}`}>
                      //     {block?.transactions_agg?.count
                      //       ? localFormat(
                      //           block?.transactions_agg?.count.toString(),
                      //         )
                      //       : block?.transactions_agg?.count.toString() ??
                      //         '' + ' transactions'}
                      //   </LinkWrapper>
                      //   ) + `and $
                      //   {block?.receipts_agg?.count
                      //     ? localFormat(block?.receipts_agg?.count.toString())
                      //     : block?.receipts_agg?.count ?? ''}{' '}
                      //   receipts`
                      // </>

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
                        )
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
                  <Skeleton className="flex w-full max-w-lg h-4" />
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
            </div>
            <div className="flex flex-wrap p-4">
              <div className="w-full md:w-1/4 mb-2 md:mb-0">
                {t ? t('blocks:block.gasLimit') : 'Gas Limit'}
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
                {t ? t('blocks:block.gasPrice') : 'GAS Price'}
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
                {t ? t('blocks:block.gasFee') : 'Gas Fee'}
              </div>
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
            </div>
            <div className="flex flex-wrap p-4">
              <div className="w-full md:w-1/4 mb-2 md:mb-0">
                {t ? t('blocks:block.parenthash') : 'Parent Hash'}
              </div>
              {isLoading ? (
                <div className="w-full md:w-3/4">
                  <Skeleton className="flex w-full max-w-lg h-4" />
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
            {networkId === 'mainnet' && price && (
              <div className="flex flex-wrap p-4">
                <div className="w-full md:w-1/4 mb-2 md:mb-0">
                  {t ? t('blocks:block.price') : 'Price'}
                </div>
                {isLoading ? (
                  <div className="w-full md:w-3/4">
                    <Skeleton className="flex w-full max-w-lg h-4" />
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
};
export default Details;
