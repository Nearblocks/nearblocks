/**
 * Component: BlocksDetail
 * Author: Nearblocks Pte Ltd
 * License: Business Source License 1.1
 * Description: Details of specified blocks on Near Protocol.
 * @interface Props
 * @param {string} [network] - The network data to show, either mainnet or testnet
 * @param {string} [hash] -  The block identifier passed as a string.
 * @param {Function} [t] - A function for internationalization (i18n) provided by the next-translate package.
 */

interface Props {
  network: string;
  hash: string;
  t: (
    key: string,
    options?: { block?: string; txns?: string; receipts?: string },
  ) => string | undefined;
}

import {
  convertToMetricPrefix,
  convertToUTC,
  dollarFormat,
  gasFee,
  getTimeAgoString,
  localFormat,
} from '@/includes/formats';
import { getConfig, nanoToMilli } from '@/includes/libs';
import { gasPrice } from '@/includes/near';
import { BlocksInfo } from '@/includes/types';

export default function (props: Props) {
  const { network, hash, t } = props;
  const [isLoading, setIsLoading] = useState(false);
  const [block, setBlock] = useState<BlocksInfo>({} as BlocksInfo);
  const [price, setPrice] = useState(0);
  const [error, setError] = useState(false);
  const config = getConfig(network);

  const Loader = (props: { className?: string; wrapperClassName?: string }) => {
    return (
      <div
        className={`bg-gray-200 h-5 rounded shadow-sm animate-pulse ${props.className} ${props.wrapperClassName}`}
      ></div>
    );
  };

  interface Props {
    children?: string;
    href: string;
  }

  const LinkWrapper = (props: Props) => (
    <a href={props.href} className="hover:no-underline">
      <a className="bg-green-500 bg-opacity-10 hover:bg-opacity-100 text-green-500 hover:text-white text-xs px-2 py-1 rounded-lg hover:no-underline">
        {props.children}
      </a>
    </a>
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
            }
            setIsLoading(false);
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
    const timestamp = new Date(
      nanoToMilli(Number(block?.block_timestamp || 0)),
    );

    function fetchPriceAtDate(date: string) {
      setIsLoading(true);
      asyncFetch(
        `https://api.coingecko.com/api/v3/coins/near/history?date=${date}`,
      ).then(
        (data: {
          body: {
            market_data: { current_price: { usd: number } };
          };
          status: number;
        }) => {
          const resp = data?.body?.market_data?.current_price?.usd;
          if (data.status === 200) {
            setPrice(resp);
          }
        },
      );
      setIsLoading(false);
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
    }
  }, [block?.block_timestamp]);

  return error || (!isLoading && !block) ? (
    <div className="text-gray-400 text-xs px-2 mb-4">
      {t ? t('blocks:blockError') : 'Block Error'}
    </div>
  ) : (
    <>
      <div>
        <div className="md:flex items-center justify-between">
          {isLoading ? (
            <Loader
              className="h-7"
              wrapperClassName="flex w-80 max-w-xs px-3 py-4"
            />
          ) : (
            <h1 className="text-xl text-gray-700 px-2 py-4">
              {t ? (
                <>
                  {t('blocks:block.heading.0')}
                  <span key={1} className="font-semibold">
                    {t('blocks:block.heading.1', {
                      block: localFormat(block.block_height | 0),
                    })}
                  </span>
                </>
              ) : (
                <>
                  Block
                  <span key={1} className="font-semibold">
                    #{localFormat(block.block_height | 0)}
                  </span>
                </>
              )}
            </h1>
          )}
          {
            <Widget
              src={`${config.ownerId}/widget/bos-components.components.Shared.SponsoredBox`}
            />
          }
        </div>
        <div></div>
      </div>
      <div className="bg-white text-sm text-gray-500 divide-solid divide-gray-200 divide-y soft-shadow rounded-lg">
        {network === 'testnet' && (
          <div className="flex flex-wrap p-4 text-red-500">
            {t ? t('blocks:testnetNotice') : '[ This is a Testnet block only ]'}
          </div>
        )}
        <div className="flex flex-wrap p-4">
          <div className="w-full md:w-1/4 mb-2 md:mb-0">
            {t ? t('blocks:block.height') : 'Block Height'}
          </div>
          {isLoading ? (
            <div className="w-full md:w-3/4">
              <Loader wrapperClassName="flex w-20" />
            </div>
          ) : (
            <div className="w-full md:w-3/4 font-semibold break-words">
              {localFormat(block.block_height | 0)}
            </div>
          )}
        </div>
        <div className="flex flex-wrap p-4">
          <div className="w-full md:w-1/4 mb-2 md:mb-0">
            {t ? t('blocks:block.hash') : 'Hash'}
          </div>
          {isLoading ? (
            <div className="w-full md:w-3/4">
              <Loader wrapperClassName="flex w-full max-w-xl" />
            </div>
          ) : (
            <div className="w-full md:w-3/4 break-words">
              {block.block_hash}
            </div>
          )}
        </div>

        <div className="flex flex-wrap p-4">
          <div className="w-full md:w-1/4 mb-2 md:mb-0">
            {t ? t('blocks:block.timestamp') : 'Timestamp'}
          </div>
          {isLoading ? (
            <div className="w-full md:w-3/4">
              <Loader wrapperClassName="flex w-full max-w-sm" />
            </div>
          ) : (
            <div className="w-full md:w-3/4 break-words">
              {getTimeAgoString(
                nanoToMilli(Number(block?.block_timestamp || 0)),
              )}{' '}
              (
              {convertToUTC(
                nanoToMilli(Number(block?.block_timestamp || 0)),
                true,
              )}
              ) +UTC
            </div>
          )}
        </div>
        <div className="flex flex-wrap p-4">
          <div className="w-full md:w-1/4 mb-2 md:mb-0">
            {t ? t('blocks:block.transactions.0') : 'Transactions'}
          </div>
          {isLoading ? (
            <div className="w-full md:w-3/4">
              <Loader wrapperClassName="flex w-full max-w-xs" />
            </div>
          ) : (
            <div className="w-full md:w-3/4 break-words">
              {t ? (
                <>
                  <LinkWrapper href={`/txns?block=${block.block_hash}`}>
                    {t('blocks:block.transactions.1', {
                      txns: localFormat(block.transactions_agg.count || 0),
                    })}
                  </LinkWrapper>
                  &nbsp;
                  {t('blocks:block.transactions.2', {
                    receipts: localFormat(block.receipts_agg.count || 0),
                  })}
                </>
              ) : (
                (
                  <LinkWrapper href={`/txns?block=${block.block_hash}`}>
                    {localFormat(block.transactions_agg.count || 0) +
                      ' transactions'}
                  </LinkWrapper>
                ) + `and ${localFormat(block.receipts_agg.count || 0)} receipts`
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
              <Loader wrapperClassName="flex w-full max-w-lg" />
            </div>
          ) : (
            <div className="w-full md:w-3/4 break-words">
              <a
                href={`/address/${block.author_account_id}`}
                className="hover:no-underline"
              >
                <a className="text-green-500 hover:no-underline">
                  {block.author_account_id}
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
              <Loader wrapperClassName="flex w-full max-w-lg" />
            </div>
          ) : (
            <div className="w-full md:w-3/4 break-words">
              {block.chunks_agg.gas_used
                ? convertToMetricPrefix(block.chunks_agg.gas_used) + 'gas'
                : '0 gas'}
            </div>
          )}
        </div>
        <div className="flex flex-wrap p-4">
          <div className="w-full md:w-1/4 mb-2 md:mb-0">
            {t ? t('blocks:block.gasLimit') : 'Gas limit'}
          </div>
          {isLoading ? (
            <div className="w-full md:w-3/4">
              <Loader wrapperClassName="flex w-full max-w-lg" />
            </div>
          ) : (
            <div className="w-full md:w-3/4 break-words">
              {block.chunks_agg.gas_limit
                ? convertToMetricPrefix(block.chunks_agg.gas_limit) + 'gas'
                : '0 gas'}
            </div>
          )}
        </div>
        <div className="flex flex-wrap p-4">
          <div className="w-full md:w-1/4 mb-2 md:mb-0">
            {t ? t('blocks:block.gasPrice') : 'GAS Price'}
          </div>
          {isLoading ? (
            <div className="w-full md:w-3/4">
              <Loader wrapperClassName="flex w-full max-w-lg" />
            </div>
          ) : (
            <div className="w-full md:w-3/4 break-words">
              {gasPrice(Number(block.gas_price | 0))}
            </div>
          )}
        </div>
        <div className="flex flex-wrap p-4">
          <div className="w-full md:w-1/4 mb-2 md:mb-0">
            {t ? t('blocks:block.gasFee') : 'Gas Fee'}
          </div>
          {isLoading ? (
            <div className="w-full md:w-3/4">
              <Loader wrapperClassName="flex w-full max-w-lg" />
            </div>
          ) : (
            <div className="w-full md:w-3/4 break-words">
              {block.chunks_agg.gas_used && block.gas_price
                ? gasFee(
                    Number(block.chunks_agg.gas_used),
                    Number(block.gas_price),
                  )
                : '0 Ⓝ'}
            </div>
          )}
        </div>
        <div className="flex flex-wrap p-4">
          <div className="w-full md:w-1/4 mb-2 md:mb-0">
            {t ? t('blocks:block.parenthash') : 'Parent hash'}
          </div>
          {isLoading ? (
            <div className="w-full md:w-3/4">
              <Loader wrapperClassName="flex w-full max-w-lg" />
            </div>
          ) : (
            <div className="w-full md:w-3/4 break-words">
              <a
                href={`/blocks/${block.prev_block_hash}`}
                className="hover:no-underline"
              >
                <a className="text-green-500 hover:no-underline">
                  {block.prev_block_hash}
                </a>
              </a>
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
                <Loader wrapperClassName="flex w-full max-w-lg" />
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
  );
}
