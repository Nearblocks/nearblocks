/**
 * Component: BlocksDetail
 * Author: Nearblocks Pte Ltd
 * License: Business Source License 1.1
 * Description: Details of specified blocks on Near Protocol.
 * @interface Props
 * @param {string} [network] - The network data to show, either mainnet or testnet
 * @param {Function} [t] - A function for internationalization (i18n) provided by the next-translate package.
 * @param {string} [hash] -  The block identifier passed as a string.
 * @param {React.FC<{
 *   href: string;
 *   children: React.ReactNode;
 *   className?: string;
 * }>} Link - A React component for rendering links.
 */

interface Props {
  network: string;
  hash: string;
  t: (
    key: string,
    options?: { block?: string; txns?: string; receipts?: string },
  ) => string | undefined;
  Link: Link;
}

import Skeleton from '@/includes/Common/Skeleton';
import {
  convertToMetricPrefix,
  convertToUTC,
  dollarFormat,
  gasFee,
  getTimeAgoString,
  localFormat,
} from '@/includes/formats';
import { getConfig, handleRateLimit, nanoToMilli } from '@/includes/libs';
import { gasPrice } from '@/includes/near';
import { BlocksInfo, Link } from '@/includes/types';

export default function (props: Props) {
  const { network, hash, t, Link } = props;
  const [isLoading, setIsLoading] = useState(false);
  const [block, setBlock] = useState<BlocksInfo>({} as BlocksInfo);
  const [price, setPrice] = useState('');
  const [error, setError] = useState(false);
  const config = getConfig(network);

  const Loader = (props: { className?: string }) => {
    return (
      <div
        className={`bg-gray-200 h-4 rounded shadow-sm animate-pulse ${props.className}`}
      ></div>
    );
  };

  interface Props {
    children?: string;
    href: string;
  }

  const LinkWrapper = (props: Props) => (
    <Link href={props.href} className="hover:no-underline">
      <a className="bg-green-500 bg-opacity-10 hover:bg-opacity-100 text-green-500 hover:text-white text-xs px-2 py-1 rounded-xl hover:no-underline">
        {props.children}
      </a>
    </Link>
  );

  useEffect(() => {
    function fetchBlock() {
      setIsLoading(true);
      asyncFetch(`${config.backendUrl}blocks/${hash}`)
        .then(
          (data: {
            body: {
              blocks: BlocksInfo[];
            };
            status: number;
          }) => {
            const resp = data?.body?.blocks?.[0];
            if (data.status === 200) {
              setBlock({
                author_account_id: resp.author_account_id,
                block_hash: resp.block_hash,
                block_height: resp.block_height,
                block_timestamp: resp.block_timestamp,
                chunks_agg: resp.chunks_agg,
                gas_price: resp.gas_price,
                prev_block_hash: resp.prev_block_hash,
                receipts_agg: resp.receipts_agg,
                transactions_agg: resp.transactions_agg,
              });
              setIsLoading(false);
            } else {
              handleRateLimit(data, fetchBlock, () => setIsLoading(false));
            }
          },
        )
        .catch((error: Error) => {
          if (error) setError(true);
          setIsLoading(false);
        });
    }

    fetchBlock();
  }, [config.backendUrl, hash]);

  const date = useMemo(() => {
    if (block?.block_timestamp) {
      const timestamp = new Date(nanoToMilli(block?.block_timestamp));

      function fetchPriceAtDate(date: string) {
        asyncFetch(
          `https://api.coingecko.com/api/v3/coins/near/history?date=${date}`,
        ).then(
          (data: {
            body: {
              market_data: { current_price: { usd: string } };
            };
            status: number;
          }) => {
            const resp = data?.body?.market_data?.current_price?.usd;
            if (data.status === 200) {
              setPrice(resp);
            } else {
              handleRateLimit(data, () => fetchPriceAtDate(date));
            }
          },
        );
      }

      let dt;
      const currentDate = new Date();
      if (currentDate > timestamp) {
        const day = timestamp.getUTCDate();
        const month = timestamp.getUTCMonth() + 1;
        const year = timestamp.getUTCFullYear();

        dt = `${day < 10 ? '0' : ''}${day}-${
          month < 10 ? '0' : ''
        }${month}-${year}`;

        fetchPriceAtDate(dt);

        return dt;
      }
    }
    return;
  }, [block?.block_timestamp]);

  return (
    <>
      {error || (!isLoading && Object.keys(block).length === 0) ? (
        <div className="text-nearblue-700 text-xs px-2 mb-4 py-5">
          {t ? t('blocks:blockError') : 'Block Error'}
        </div>
      ) : (
        <>
          <div className="md:flex items-center justify-between">
            {isLoading ? (
              <div className="w-80 max-w-xs px-3 py-5">
                <Skeleton className="h-7" />
              </div>
            ) : (
              <h1 className="text-xl text-nearblue-600 px-2 py-5">
                {t ? (
                  <>
                    {t('blocks:block.heading.0')}
                    <span key={1} className="font-semibold">
                      {t('blocks:block.heading.1', {
                        block: block?.block_height
                          ? localFormat(block?.block_height)
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
                        ? localFormat(block?.block_height)
                        : ''}
                    </span>
                  </>
                )}
              </h1>
            )}
          </div>
          <div className="bg-white text-sm text-nearblue-600 divide-solid divide-gray-200 divide-y soft-shadow rounded-xl">
            {network === 'testnet' && (
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
                    ? localFormat(block?.block_height)
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
                    `${getTimeAgoString(nanoToMilli(block?.block_timestamp))} (
                ${convertToUTC(
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
                <div className="w-full md:w-3/4 break-words">
                  {t ? (
                    <>
                      <LinkWrapper href={`/txns?block=${block?.block_hash}`}>
                        {t('blocks:block.transactions.1', {
                          txns: block?.transactions_agg?.count
                            ? localFormat(block?.transactions_agg?.count)
                            : block?.transactions_agg?.count ?? '',
                        })}
                      </LinkWrapper>
                      &nbsp;
                      {t('blocks:block.transactions.2', {
                        receipts: block?.receipts_agg?.count
                          ? localFormat(block?.receipts_agg?.count)
                          : block?.receipts_agg?.count ?? '',
                      })}
                    </>
                  ) : (
                    (
                      <LinkWrapper href={`/txns?block=${block?.block_hash}`}>
                        {block?.transactions_agg?.count
                          ? localFormat(block?.transactions_agg?.count)
                          : block?.transactions_agg?.count ??
                            '' + ' transactions'}
                      </LinkWrapper>
                    ) +
                    `and ${
                      block?.receipts_agg?.count
                        ? localFormat(block?.receipts_agg?.count)
                        : block?.receipts_agg?.count ?? ''
                    } receipts`
                  )}
                </div>
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
                  <a
                    href={`/address/${block?.author_account_id}`}
                    className="hover:no-underline"
                  >
                    <a className="text-green-500 hover:no-underline">
                      {block?.author_account_id}
                    </a>
                  </a>
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
                  {block?.chunks_agg?.gas_used
                    ? convertToMetricPrefix(block?.chunks_agg?.gas_used) + 'gas'
                    : (block?.chunks_agg?.gas_used ?? '') + 'gas'}
                </div>
              )}
            </div>
            <div className="flex flex-wrap p-4">
              <div className="w-full md:w-1/4 mb-2 md:mb-0">
                {t ? t('blocks:block.gasLimit') : 'Gas limit'}
              </div>
              {isLoading ? (
                <div className="w-full md:w-3/4">
                  <Loader className="flex w-full max-w-lg" />
                </div>
              ) : (
                <div className="w-full md:w-3/4 break-words">
                  {block?.chunks_agg?.gas_limit
                    ? convertToMetricPrefix(block?.chunks_agg?.gas_limit) +
                      'gas'
                    : (block?.chunks_agg?.gas_limit ?? '') + 'gas'}
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
                    ? gasPrice(block?.gas_price)
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
                  {block?.chunks_agg?.gas_used && block?.gas_price
                    ? gasFee(block?.chunks_agg?.gas_used, block?.gas_price)
                    : ''}
                  Ⓝ
                </div>
              )}
            </div>
            <div className="flex flex-wrap p-4">
              <div className="w-full md:w-1/4 mb-2 md:mb-0">
                {t ? t('blocks:block.parenthash') : 'Parent hash'}
              </div>
              {isLoading ? (
                <div className="w-full md:w-3/4">
                  <Loader className="flex w-full max-w-lg" />
                </div>
              ) : (
                <div className="w-full md:w-3/4 break-words">
                  <Link
                    href={`/blocks/${block?.prev_block_hash}`}
                    className="hover:no-underline"
                  >
                    <a className="text-green-500 hover:no-underline">
                      {block?.prev_block_hash}
                    </a>
                  </Link>
                </div>
              )}
            </div>
            {network === 'mainnet' && date && (
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
          </div>
        </>
      )}
    </>
  );
}
